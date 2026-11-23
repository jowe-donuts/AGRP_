"""Script to generate CLIP embeddings for all items (force regenerate)."""

import sys
from sqlmodel import Session, select

from app.db.models import Item
from app.db.session import get_engine
from app.workers.tasks import generate_item_embedding

def main():
    """Generate embeddings for all items."""
    engine = get_engine()
    
    with Session(engine) as session:
        # Get ALL items
        stmt = select(Item)
        items = session.exec(stmt).all()
        
        print(f"Found {len(items)} items total")
        
        failed_items = []
        for idx, item in enumerate(items, 1):
            has_embedding = item.clip_embedding is not None
            status = "HAS" if has_embedding else "MISSING"
            print(f"[{idx}/{len(items)}] Item #{item.id}: {item.title} - {status}")
            
            if not has_embedding:
                try:
                    generate_item_embedding(item.id)
                    print(f"  [OK] Generated embedding")
                except Exception as e:
                    print(f"  [FAIL] {e}")
                    failed_items.append((item.id, item.title, str(e)))
        
        print(f"\nDone!")
        
        if failed_items:
            print(f"\n[ERROR] Failed to generate embeddings for {len(failed_items)} items:")
            for item_id, title, error in failed_items:
                print(f"  - Item #{item_id} ({title}): {error}")
            sys.exit(1)
        else:
            print(f"[SUCCESS] All items have embeddings")

if __name__ == "__main__":
    main()
