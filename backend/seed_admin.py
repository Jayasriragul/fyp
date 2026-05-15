import os
import sys
from app import create_app
from models import db, bcrypt
from models.user import Admin

app = create_app()

with app.app_context():
    print("Checking for default admin...")
    admin = Admin.query.filter_by(email='admin@eventzenqr.com').first()
    
    if admin:
        print("Admin already exists. Updating password to 'admin123'...")
        admin.set_password('admin123')
        db.session.commit()
        print("Success! Password updated.")
    else:
        print("Creating default admin...")
        admin = Admin(
            name='System Admin',
            email='admin@eventzenqr.com',
            super_admin=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("Success! Default admin created successfully.")
