from models import db
from datetime import datetime


class Registration(db.Model):
    __tablename__ = 'registrations'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    status = db.Column(db.Enum('registered', 'cancelled', 'attended'), nullable=False, default='registered')
    registered_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    qr_code = db.relationship('QRCode', backref='registration', uselist=False, lazy=True, cascade='all, delete-orphan')
    attendance_records = db.relationship('Attendance', backref='registration', lazy=True, cascade='all, delete-orphan')
    meal_records = db.relationship('Meal', backref='registration', lazy=True, cascade='all, delete-orphan')
    welcome_kit = db.relationship('WelcomeKit', backref='registration', uselist=False, lazy=True, cascade='all, delete-orphan')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'event_id', name='unique_user_event'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'event_id': self.event_id,
            'status': self.status,
            'registered_at': self.registered_at.isoformat() if self.registered_at else None,
            'user': self.user.to_dict() if self.user else None,
            'event': self.event.to_dict() if self.event else None,
        }
