from models import db
from datetime import datetime


class QRCode(db.Model):
    __tablename__ = 'qr_codes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    registration_id = db.Column(db.Integer, db.ForeignKey('registrations.id'), nullable=False)
    qr_data = db.Column(db.String(255), nullable=False, unique=True)
    generated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    last_reset = db.Column(db.Date, nullable=True)

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def to_dict(self):
        return {
            'id': self.id,
            'registration_id': self.registration_id,
            'qr_data': self.qr_data,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_active': self.is_active,
            'is_expired': self.is_expired(),
            'last_reset': self.last_reset.isoformat() if self.last_reset else None,
        }
