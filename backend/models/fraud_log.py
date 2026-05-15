from models import db
from datetime import datetime


class FraudLog(db.Model):
    __tablename__ = 'fraud_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='SET NULL'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    fraud_type = db.Column(
        db.Enum('duplicate_scan', 'rapid_scan', 'expired_qr', 'invalid_qr', 'blacklisted_user', 'suspicious_activity'),
        nullable=False
    )
    details = db.Column(db.Text, nullable=True)
    qr_data = db.Column(db.String(255), nullable=True)
    detected_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    resolved = db.Column(db.Boolean, nullable=False, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'user_id': self.user_id,
            'fraud_type': self.fraud_type,
            'details': self.details,
            'qr_data': self.qr_data,
            'detected_at': self.detected_at.isoformat() if self.detected_at else None,
            'resolved': self.resolved,
        }
