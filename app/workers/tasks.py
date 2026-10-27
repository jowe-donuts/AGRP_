"""Celery workers for CLIP embeddings and matching.

Each task is idempotent and uses the hardware you have (GPU/CPU). No external API key needed with local CLIP.
"""

import logging
from logging import getLogger
from typing import List, Optional

from celery import Celery
from sqlmodel import Session, select

from app.core.config import settings
from app.db.models import Item, ItemStatus, Match
from app.db.session import get_engine
from app.services.ai_matcher import cosine_similarity, match_score, vectorize_image, vectorize_text

logger = getLogger(__name__)

# Celery app configured with broker/result backend from ENV.
CELERY_APP = Celery(
    "agp_tasks",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)
# Route tasks to a single named queue (for better observability).
CELERY_APP.conf.task_routes = {"app.workers.tasks.*": {"queue": "agp"}}


# Shared engine (used when tasks don’t reuse a FastAPI session).
ENGINE = get_engine()


def _get_session() -> Session:
    """Create a new DB session for a Celery task (outside a HTTP request).

    The task owns the transaction; it will commit or rollback on error.
    """
    return Session(ENGINE)


# ----------------------------------------------------------------------
# Task: generate CLIP embedding for a single item (image or text fallback)
# ----------------------------------------------------------------------
def generate_item_embedding(item_id: int) -> None:
    """Compute CLIP embedding for the item and cache it in a JSONB column.

    If the item has images, the first URL is used; otherwise the embedding is derived from its title + description.

    Args:
        item_id: Primary key of the source Item.

    Raises:
        RuntimeError: If the image download or CLIP call fails.
    """
    logger.info("Generating CLIP embedding for ItemID = %s", item_id)

    with _get_session() as sess:
        item = sess.get(Item, item_id)
        if not item:
            logger.error("Item %s not found", item_id)
            return

        embedding: Optional[List[float]] = None

        # Try to use the first publicly reachable image URL.
        if item.image_urls:
            try:
                embedding = vectorize_image(item.image_urls[0])
            except Exception as exc:
                logger.warning(
                    "Vectorizing first image for Item %s failed (%s). Falling back to text embedding.",
                    item_id,
                    exc,
                )
        # If no image or image failed, create a text embedding (title + description).
        if not embedding:
            text_blob = f"{item.title}. {item.description}"
            try:
                embedding = vectorize_text(item.title, item.description)
            except Exception as exc:
                logger.exception(
                    "CLIP embedding computation for Item %s failed: %s",
                    item_id,
                    exc,
                )
                raise

        # Persist the embedding.
        item.clip_embedding = embedding
        sess.add(item)
        sess.commit()
        logger.info(
            "Saved CLIP embedding (%d dims) for Item %s",
            len(embedding),
            item_id,
        )


@CELERY_APP.task(bind=True, max_retries=5, default_retry_delay=30)
def generate_item_embedding_worker(self, item_id: int) -> None:
    """Celery task wrapper around ``generate_item_embedding`` with retries."""
    try:
        generate_item_embedding(item_id)
    except Exception as exc:
        # Retries inline; after exhaustion the task fails.
        logger.exception("Failed to generate embedding for Item %s after retries", item_id)
        raise self.retry(exc=exc)


# ----------------------------------------------------------------------
# Task: run a matching sweep for a source item (found <-> lost)
# ----------------------------------------------------------------------
def run_matching_sweep(item_id: int) -> None:
    """Compute pairwise cosine similarities between the source item and all opposite‑type items.

    Writes one row into the ``Match`` table for the best candidate.
    If no candidate is found, ``Match`` is never written.

    Args:
        item_id: ID of the source Item.

    Raises:
        RuntimeError: If vectorizer or DB operations fail.
        ValueError: If source item has no embedding or mismatched dimensions in candidates.
    """
    logger.info("Running matching sweep for ItemID = %s", item_id)

    with _get_session() as sess:
        source_item = sess.get(Item, item_id)
        if not source_item:
            logger.error("Item %s not found", item_id)
            return

        # Validate source embedding exists and has valid dimensions.
        if not source_item.clip_embedding:
            raise ValueError(f"Item {item_id} has no CLIP embedding; cannot run matching sweep")
        
        source_dim = len(source_item.clip_embedding)
        if source_dim != 512:
            raise ValueError(
                f"Item {item_id} embedding has unexpected dimension {source_dim} (expected 512)"
            )

        # Determine opposite status.
        opposite_status = (
            ItemStatus.FOUND
            if source_item.status == ItemStatus.LOST
            else ItemStatus.LOST
        )

        # Find all opposite‑type items that already have embeddings.
        stmt = (
            select(Item)
            .where(Item.status == opposite_status, Item.clip_embedding.is_not(None))
        )
        candidates = sess.exec(stmt).all()

        if not candidates:
            logger.info("No candidates found for matching sweep on Item %s", item_id)
            return

        best_score = 0.0
        best_candidate_id: Optional[int] = None
        dimension_errors = []

        # Compute pairwise cosine similarity.
        for cand in candidates:
            try:
                # Validate candidate dimension matches source before calling match_score.
                cand_dim = len(cand.clip_embedding) if cand.clip_embedding else 0
                if cand_dim != source_dim:
                    dimension_errors.append(
                        f"Candidate {cand.id}: dim={cand_dim}, source dim={source_dim}"
                    )
                    continue

                score = match_score(source_item.clip_embedding, cand.clip_embedding)
            except (ValueError, TypeError) as exc:
                # This should not happen after validation above, but log if it does.
                logger.error(
                    "Unexpected error matching Item %s vs Candidate %s: %s",
                    item_id,
                    cand.id,
                    exc,
                )
                raise

            if score > best_score:
                best_score = score
                best_candidate_id = cand.id

        # Log dimension mismatches but don't fail; they're expected during initial setup.
        if dimension_errors:
            logger.warning(
                "Dimension mismatches for Item %s (skipped %d candidates): %s",
                item_id,
                len(dimension_errors),
                "; ".join(dimension_errors[:3]),  # Log first 3 only.
            )

        # Persist the best match result.
        if best_candidate_id is None:
            logger.info("No candidate with a positive match score for Item %s", item_id)
            return

        match_row = Match(
            item_id=item_id,
            candidate_id=best_candidate_id,
            score=best_score,
        )
        sess.add(match_row)
        sess.commit()
        logger.info(
            "Best match for Item %s (%s) -> Item %s (%s): score=%.2f%%",
            item_id,
            source_item.status,
            best_candidate_id,
            opposite_status,
            best_score,
        )


@CELERY_APP.task(bind=True, max_retries=1, default_retry_delay=60)
def run_matching_sweep_worker(self, item_id: int) -> None:
    """Celery task wrapper around ``run_matching_sweep`` with retries."""
    try:
        run_matching_sweep(item_id)
    except Exception as exc:
        logger.exception("Failed to run matching sweep for Item %s", item_id)
        raise self.retry(exc=exc)