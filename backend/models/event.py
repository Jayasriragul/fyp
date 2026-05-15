from models import db
from datetime import datetime


class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    venue = db.Column(db.String(500), nullable=False)
    address = db.Column(db.Text, nullable=True)
    banner_url = db.Column(db.String(500), nullable=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    max_attendees = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    registrations = db.relationship('Registration', backref='event', lazy=True, cascade='all, delete-orphan')
    attendance_records = db.relationship('Attendance', backref='event', lazy=True, cascade='all, delete-orphan')
    meal_records = db.relationship('Meal', backref='event', lazy=True, cascade='all, delete-orphan')
    welcome_kit_records = db.relationship('WelcomeKit', backref='event', lazy=True, cascade='all, delete-orphan')
    feedback_list = db.relationship('Feedback', backref='event', lazy=True, cascade='all, delete-orphan')

    def total_days(self):
        return (self.end_date - self.start_date).days + 1

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'venue': self.venue,
            'address': self.address,
            'banner_url': self.banner_url,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'max_attendees': self.max_attendees,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'total_days': self.total_days(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
