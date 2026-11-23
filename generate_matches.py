"""Script to generate match scores for all existing items with CLIP embeddings.

Run this to create Match records between lost and found items.
"""

import sys
from sqlmodel import Session, select

from app.db.models import Item
from app.db.session import get_engine
from app.workers.tasks import run_matching_sweep

def main():
    """Generate matches for all items with embeddings."""
    engine = get_engine()
    
    with Session(engine) as session:
        # Find all items with embeddings
        stmt = select(Item).where(Item.clip_embedding.is_not(None))
        items = session.exec(stmt).all()
        
        print(f"Found {len(items)} items with CLIP embeddings")
        
        if not items:
            print("No items with embeddings found!")
            return
        
        for idx, item in enumerate(items, 1):
            print(f"[{idx}/{len(items)}] Generating matches for Item #{item.id}: {item.title} ({item.status})")
            try:
                run_matching_sweep(item.id)
                print(f"  [OK] Success")
            except Exception as e:
                print(f"  [FAIL] Failed: {e}")
        
        print(f"\nDone! Generated matches for {len(items)} items")

if __name__ == "__main__":
    main()
