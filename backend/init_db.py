import os
from app import create_app
from models import db

app = create_app()

with app.app_context():
    print("Connecting to Aiven and creating tables...")
    try:
        db.create_all()
        print("✅ Success! All tables created in Aiven.")
    except Exception as e:
        print(f"❌ Error: {e}")
