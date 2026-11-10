import sys
import codecs

sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# Add app to path
sys.path.insert(0, 'app')

from datetime import datetime, timezone
from sqlmodel import Session, create_engine, select
from app.db.models import User, Role
from app.core.security import hash_password

DATABASE_URL = "sqlite:///../agp.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

with Session(engine) as session:
    # Check if admin exists
    admin = session.exec(
        select(User).where(User.email == "admin@gamit.edu")
    ).first()

    if admin:
        admin.role = Role.ADMIN
        admin.is_active = True
        session.commit()
        print(f"[OK] Updated admin user: {admin.email}")
    else:
        admin = User(
            email="admin@gamit.edu",
            full_name="Admin User",
            hashed_password=hash_password("admin123"),
            role=Role.ADMIN,
            is_active=True
        )
        session.add(admin)
        session.commit()
        print(f"[OK] Created admin user: {admin.email}")

    # List all users
    users = session.exec(select(User)).all()
    print(f"\n[OK] Database has {len(users)} users:")
    for u in users:
        print(f"  - {u.email} ({u.role})")