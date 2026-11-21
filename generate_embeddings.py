"""Script to generate CLIP embeddings for all existing items in the database.

Run this to backfill embeddings for items created before the embedding system was active.
"""

import sys
from sqlmodel import Session, select

from app.db.models import Item
from app.db.session import get_engine
from app.workers.tasks import generate_item_embedding

def main():
    """Generate embeddings for all items missing clip_embedding."""
    engine = get_engine()
    
    with Session(engine) as session:
        # Find all items without embeddings
        stmt = select(Item).where(Item.clip_embedding.is_(None))
        items = session.exec(stmt).all()
        
        print(f"Found {len(items)} items without CLIP embeddings")
        
        if not items:
            print("All items already have embeddings!")
            return
        
        for idx, item in enumerate(items, 1):
            print(f"[{idx}/{len(items)}] Generating embedding for Item #{item.id}: {item.title}")
            try:
                generate_item_embedding(item.id)
                print(f"  ✓ Success")
            except Exception as e:
                print(f"  ✗ Failed: {e}")
        
        print(f"\nDone! Generated embeddings for {len(items)} items")

if __name__ == "__main__":
    main()
