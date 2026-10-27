"""OpenAI CLIP integration (local model, no API key needed).

Provides:
- vectorize_image(image_url: str) -> List[float]
- vectorize_text(title: str, description: str) -> List[float]
- cosine_similarity(a: List[float], b: List[float]) -> float
- match_score(a: List[float], b: List[float]) -> float
"""

import math
from logging import getLogger
from typing import List

import torch
from PIL import Image
from urllib.request import urlopen
from io import BytesIO
import clip

logger = getLogger(__name__)

# Load CLIP once at module level. Uses CUDA/GPU if available, otherwise CPU.
try:
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info("CLIP loaded on %s", DEVICE)
    
    # Load the CLIP model and the torchvision preprocess transform it expects.
    MODEL, PREPROCESS = clip.load("ViT-B/32", device=DEVICE)
    CLIP_AVAILABLE = True
except Exception as exc:
    logger.error("Failed to load CLIP model: %s. Using fallback zero-vectors.", exc)
    CLIP_AVAILABLE = False
    DEVICE = None
    MODEL = None
    PREPROCESS = None


def _get_zero_vector(dim: int = 512) -> List[float]:
    """Return a zero-vector as fallback when CLIP is unavailable."""
    return [0.0] * dim


def _download_image(image_url: str) -> Image.Image:
    """Download and open an image from its URL as a PIL Image."""
    try:
        response = urlopen(image_url, timeout=10)
        data = response.read()
        return Image.open(BytesIO(data))
    except Exception as exc:
        logger.error("Failed to download image from %s: %s", image_url, exc)
        raise


def vectorize_image(image_url: str) -> List[float]:
    """
    Vectorize an image URL using the local CLIP model.

    The URL must be publicly reachable over HTTPS. CLIP resizes and normalizes the image
    (224x224) and returns a [1, 512] feature vector.

    If CLIP is unavailable, returns a zero-vector (fallback).

    Args:
        image_url: Public HTTP(S) URL of the image.

    Returns:
        List[float] representing the CLIP embedding for that image.

    Raises:
        RuntimeError: If the URL is unreachable or the download fails.
    """
    if not image_url:
        raise ValueError("image_url must be a non‑empty string")

    # Fallback if CLIP is not available
    if not CLIP_AVAILABLE:
        logger.warning("CLIP not available; returning zero-vector for image URL: %s", image_url)
        return _get_zero_vector()

    try:
        image = _download_image(image_url)
    except Exception as exc:
        raise RuntimeError(f"Could not download image from {image_url}") from exc

    try:
        # CLIP expects a Tensor after preprocessing.
        image_tensor = PREPROCESS(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            embeddings = MODEL.encode_image(image_tensor)

        # Normalize so that cosine similarity in [0,1] simplifies to [0,100] with our logic.
        embeddings /= embeddings.norm(dim=-1, keepdim=True)

        return embeddings.cpu().tolist()[0]
    except Exception as exc:
        logger.error("CLIP encode_image failed for %s: %s. Returning zero-vector.", image_url, exc)
        return _get_zero_vector()


def vectorize_text(title: str, description: str) -> List[float]:
    """
    Vectorize combined text (title + description) using the local CLIP model.

    If CLIP is unavailable, returns a zero-vector (fallback).

    Args:
        title: Item title.
        description: Item description.

    Returns:
        List[float] representing the CLIP (512‑dim) embedding.
    """
    if not title and not description:
        raise ValueError("At least title or description must be non‑empty")

    # Fallback if CLIP is not available
    if not CLIP_AVAILABLE:
        logger.warning("CLIP not available; returning zero-vector for text embedding")
        return _get_zero_vector()

    try:
        text_blob = f"{title or ''}. {description or ''}".strip()
        tokens = clip.tokenize([text_blob], truncate=True).to(DEVICE)

        with torch.no_grad():
            embeddings = MODEL.encode_text(tokens)

        embeddings /= embeddings.norm(dim=-1, keepdim=True)

        return embeddings.cpu().tolist()[0]
    except Exception as exc:
        logger.error("CLIP encode_text failed: %s. Returning zero-vector.", exc)
        return _get_zero_vector()


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Return cosine similarity in the range [-1, 1]."""
    if len(a) != len(b):
        raise ValueError("Vectors must be of the same dimensionality")
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def match_score(a: List[float], b: List[float]) -> float:
    """Convert cosine similarity ([-1,1]) to a 0‑100 percentage."""
    similarity = cosine_similarity(a, b)
    normalized = max(min(similarity, 1.0), -1.0)
    return (normalized + 1) * 50
