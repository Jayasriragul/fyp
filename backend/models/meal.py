from models import db
from datetime import datetime


class Meal(db.Model):
    __tablename__ = 'meals'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    registration_id = db.Column(db.Integer, db.ForeignKey('registrations.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    meal_type = db.Column(db.Enum('breakfast', 'lunch', 'dinner'), nullable=False)
    scanned_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    day_number = db.Column(db.Integer, nullable=False, default=1)

    __table_args__ = (
        db.UniqueConstraint('registration_id', 'event_id', 'meal_type', 'day_number', name='unique_meal'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'registration_id': self.registration_id,
            'event_id': self.event_id,
            'meal_type': self.meal_type,
            'scanned_at': self.scanned_at.isoformat() if self.scanned_at else None,
            'day_number': self.day_number,
            'user': self.registration.user.to_dict() if self.registration and self.registration.user else None,
        }
