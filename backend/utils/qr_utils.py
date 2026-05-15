import qrcode
import uuid
import io
import base64
from datetime import datetime, timedelta
from models import db
from models.qr_code import QRCode


def generate_qr_data():
    """Generate a unique UUID string for QR code data."""
    return str(uuid.uuid4())


def generate_qr_image_base64(qr_data):
    """Generate a QR code image and return it as a base64-encoded PNG string."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#6C3CE1", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)

    return base64.b64encode(buffer.getvalue()).decode('utf-8')


def create_qr_for_registration(registration_id, event_end_date, event_end_time):
    """Create a QR code record for a registration."""
    qr_data = generate_qr_data()

    # QR expires at end of event
    expires_at = datetime.combine(event_end_date, event_end_time)

    qr_code = QRCode(
        registration_id=registration_id,
        qr_data=qr_data,
        expires_at=expires_at,
        is_active=True,
        last_reset=datetime.utcnow().date()
    )

    db.session.add(qr_code)
    db.session.commit()

    return qr_code


def reset_qr_daily(qr_code):
    """Reset a QR code for a new day (generate new qr_data)."""
    today = datetime.utcnow().date()

    if qr_code.last_reset == today:
        return qr_code  # Already reset today

    qr_code.qr_data = generate_qr_data()
    qr_code.last_reset = today
    qr_code.is_active = True
    db.session.commit()

    return qr_code


def get_qr_image(qr_data):
    """Get a QR image as base64 from QR data string."""
    return generate_qr_image_base64(qr_data)
