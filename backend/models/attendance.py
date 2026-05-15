from models import db
from datetime import datetime


class Attendance(db.Model):
    __tablename__ = 'attendance'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    registration_id = db.Column(db.Integer, db.ForeignKey('registrations.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    check_in_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    check_out_time = db.Column(db.DateTime, nullable=True)
    scan_type = db.Column(db.Enum('entry', 'exit'), nullable=False, default='entry')
    scanned_by = db.Column(db.Integer, nullable=True)
    day_number = db.Column(db.Integer, nullable=False, default=1)

    def to_dict(self):
        return {
            'id': self.id,
            'registration_id': self.registration_id,
            'event_id': self.event_id,
            'check_in_time': self.check_in_time.isoformat() if self.check_in_time else None,
            'check_out_time': self.check_out_time.isoformat() if self.check_out_time else None,
            'scan_type': self.scan_type,
            'scanned_by': self.scanned_by,
            'day_number': self.day_number,
            'user': self.registration.user.to_dict() if self.registration and self.registration.user else None,
        }
