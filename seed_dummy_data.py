"""Seed dummy data into the database for testing."""

import sys
import io
import os

# Fix encoding on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from datetime import datetime, timezone, timedelta
from sqlmodel import Session, create_engine, select

# Add app to path
sys.path.insert(0, '/app')

from app.db.models import User, Item, ItemStatus, Category, Role
from app.core.security import hash_password
from app.db.session import get_session

# Database URL
DATABASE_URL = "sqlite:///./agp.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def seed_data():
    """Add dummy items to the database."""
    
    with Session(engine) as session:
        # Create or get test user
        test_user = session.exec(
            select(User).where(User.email == "testuser@example.com")
        ).first()
        
        if not test_user:
            test_user = User(
                email="testuser@example.com",
                full_name="Test User",
                hashed_password=hash_password("testpassword123"),
                role=Role.STUDENT,
                is_active=True
            )
            session.add(test_user)
            session.commit()
            session.refresh(test_user)
            print(f"[OK] Created test user: {test_user.email}")
        else:
            print(f"[OK] Test user already exists: {test_user.email}")
        
        # Check if items already exist
        existing_items = session.exec(select(Item)).all()
        if len(existing_items) > 0:
            print(f"[OK] Database already has {len(existing_items)} items. Skipping seed.")
            return
        
        # Dummy items data
        dummy_items = [
            {
                "title": "Black iPhone 14 Pro",
                "description": "Black iPhone 14 Pro with cracked screen protector",
                "category": Category.ELECTRONICS,
                "location": "Library, 3rd Floor",
                "status": ItemStatus.LOST,
                "image_urls": ["https://picsum.photos/id/669/400/500?grayscale"],
                "days_ago": 3
            },
            {
                "title": "Sony WH-1000XM5 Headphones",
                "description": "Black Sony noise-cancelling headphones",
                "category": Category.ELECTRONICS,
                "location": "Student Center",
                "status": ItemStatus.FOUND,
                "image_urls": ["https://picsum.photos/id/177/400/500?grayscale"],
                "days_ago": 2
            },
            {
                "title": "Blue Kanken Backpack",
                "description": "Navy blue Kanken backpack with laptop",
                "category": Category.ACCESSORY,
                "location": "CS Building",
                "status": ItemStatus.LOST,
                "image_urls": ["https://picsum.photos/id/338/400/500?grayscale"],
                "days_ago": 5
            },
            {
                "title": "Samsung Galaxy Watch 5",
                "description": "Silver Samsung Galaxy Watch 5 with strap",
                "category": Category.ELECTRONICS,
                "location": "Gym",
                "status": ItemStatus.FOUND,
                "image_urls": ["https://picsum.photos/id/685/400/500?grayscale"],
                "days_ago": 6
            },
            {
                "title": "Gold Class Ring",
                "description": "Gold class ring with initials inside",
                "category": Category.ACCESSORY,
                "location": "Science Building",
                "status": ItemStatus.LOST,
                "image_urls": ["https://picsum.photos/id/550/400/500?grayscale"],
                "days_ago": 7
            },
            {
                "title": "Apple AirPods Pro (2nd Gen)",
                "description": "White AirPods Pro in charging case",
                "category": Category.ELECTRONICS,
                "location": "Dorm",
                "status": ItemStatus.FOUND,
                "image_urls": ["https://picsum.photos/id/665/400/500?grayscale"],
                "days_ago": 8
            },
            {
                "title": "Brown Leather Wallet",
                "description": "Brown leather wallet with ID and cards",
                "category": Category.ACCESSORY,
                "location": "Dining Hall",
                "status": ItemStatus.LOST,
                "image_urls": ["https://picsum.photos/id/445/400/500?grayscale"],
                "days_ago": 9
            },
            {
                "title": "Silver House Keys",
                "description": "Set of 3 silver keys on blue keychain",
                "category": Category.ACCESSORY,
                "location": "Library Entrance",
                "status": ItemStatus.FOUND,
                "image_urls": ["https://picsum.photos/id/315/400/500?grayscale"],
                "days_ago": 10
            },
            {
                "title": "Dell XPS 13 Laptop",
                "description": "Silver Dell XPS 13 with stickers",
                "category": Category.ELECTRONICS,
                "location": "Coffee Shop",
                "status": ItemStatus.LOST,
                "image_urls": ["https://picsum.photos/id/88/400/500?grayscale"],
                "days_ago": 4
            },
            {
                "title": "Red Backpack",
                "description": "Bright red backpack with hiking gear",
                "category": Category.ACCESSORY,
                "location": "Bus Stop",
                "status": ItemStatus.FOUND,
                "image_urls": ["https://picsum.photos/id/236/400/500?grayscale"],
                "days_ago": 11
            },
            {
                "title": "Student ID Card",
                "description": "Blue student ID with photo",
                "category": Category.DOCUMENT,
                "location": "Main Campus",
                "status": ItemStatus.LOST,
                "image_urls": ["https://picsum.photos/id/407/400/500?grayscale"],
                "days_ago": 1
            },
            {
                "title": "AirTag",
                "description": "White Apple AirTag with leather holder",
                "category": Category.ELECTRONICS,
                "location": "Parking Lot",
                "status": ItemStatus.FOUND,
                "image_urls": ["https://picsum.photos/id/544/400/500?grayscale"],
                "days_ago": 12
            }
        ]
        
        # Add items to database
        for item_data in dummy_items:
            days_ago = item_data.pop("days_ago")
            date_reported = datetime.now(timezone.utc) - timedelta(days=days_ago)
            
            item = Item(
                owner_id=test_user.id,
                date_reported=date_reported,
                **item_data
            )
            session.add(item)
        
        session.commit()
        print(f"[OK] Added {len(dummy_items)} dummy items to database")

if __name__ == "__main__":
    seed_data()
    print("\n[OK] Seed completed successfully!")
