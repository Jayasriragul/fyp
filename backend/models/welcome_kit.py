from models import db
from datetime import datetime


class WelcomeKit(db.Model):
    __tablename__ = 'welcome_kits'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    registration_id = db.Column(db.Integer, db.ForeignKey('registrations.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    received = db.Column(db.Boolean, nullable=False, default=False)
    issued_at = db.Column(db.DateTime, nullable=True)
    issued_by = db.Column(db.Integer, nullable=True)

    __table_args__ = (
        db.UniqueConstraint('registration_id', 'event_id', name='unique_kit'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'registration_id': self.registration_id,
            'event_id': self.event_id,
            'received': self.received,
            'issued_at': self.issued_at.isoformat() if self.issued_at else None,
            'issued_by': self.issued_by,
            'user': self.registration.user.to_dict() if self.registration and self.registration.user else None,
        }
