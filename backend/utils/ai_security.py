from datetime import datetime, timedelta
from models import db
from models.fraud_log import FraudLog
from models.attendance import Attendance
from models.user import User
from models.qr_code import QRCode


# Configuration
RAPID_SCAN_THRESHOLD_SECONDS = 30  # If same QR scanned within 30 seconds
DUPLICATE_SCAN_WINDOW_HOURS = 1     # Check for duplicates within 1 hour


def check_duplicate_scan(registration_id, event_id, day_number):
    """Check if user already checked in today for this event."""
    existing = Attendance.query.filter_by(
        registration_id=registration_id,
        event_id=event_id,
        day_number=day_number,
        scan_type='entry'
    ).first()

    if existing:
        log_fraud(
            event_id=event_id,
            user_id=None,
            fraud_type='duplicate_scan',
            details=f'Duplicate entry scan for registration {registration_id} on day {day_number}',
            qr_data=None
        )
        return True
    return False


def check_rapid_scan(qr_data):
    """Check if the same QR was scanned too rapidly (possible relay attack)."""
    qr_code = QRCode.query.filter_by(qr_data=qr_data).first()
    if not qr_code:
        return False

    threshold = datetime.utcnow() - timedelta(seconds=RAPID_SCAN_THRESHOLD_SECONDS)

    recent_scan = Attendance.query.filter(
        Attendance.registration_id == qr_code.registration_id,
        Attendance.check_in_time >= threshold
    ).first()

    if recent_scan:
        log_fraud(
            event_id=recent_scan.event_id,
            user_id=None,
            fraud_type='rapid_scan',
            details=f'Rapid scan detected for QR {qr_data} within {RAPID_SCAN_THRESHOLD_SECONDS}s',
            qr_data=qr_data
        )
        return True
    return False


def check_expired_qr(qr_code):
    """Check if a QR code has expired."""
    if qr_code.is_expired():
        log_fraud(
            event_id=None,
            user_id=None,
            fraud_type='expired_qr',
            details=f'Expired QR code used: {qr_code.qr_data}',
            qr_data=qr_code.qr_data
        )
        return True
    return False


def check_blacklisted_user(user_id):
    """Check if a user is blacklisted."""
    user = User.query.get(user_id)
    if user and user.is_blacklisted:
        log_fraud(
            event_id=None,
            user_id=user_id,
            fraud_type='blacklisted_user',
            details=f'Blacklisted user {user.name} (ID: {user_id}) attempted entry',
            qr_data=None
        )
        return True
    return False


def validate_qr_scan(qr_data, event_id, day_number):
    """
    Run all AI security checks on a QR scan.
    Returns (is_valid, error_message, registration)
    """
    # 1. Check if QR exists
    qr_code = QRCode.query.filter_by(qr_data=qr_data).first()
    if not qr_code:
        log_fraud(
            event_id=event_id,
            user_id=None,
            fraud_type='invalid_qr',
            details=f'Invalid QR code scanned: {qr_data}',
            qr_data=qr_data
        )
        return False, 'Invalid QR code', None

    # 2. Check if QR is active
    if not qr_code.is_active:
        return False, 'QR code is deactivated', None

    # 3. Check expiry
    if check_expired_qr(qr_code):
        return False, 'QR code has expired', None

    # 4. Check rapid scan
    if check_rapid_scan(qr_data):
        return False, 'Rapid scan detected — please wait', None

    registration = qr_code.registration

    # 5. Check if registration matches event
    if registration.event_id != event_id:
        log_fraud(
            event_id=event_id,
            user_id=registration.user_id,
            fraud_type='invalid_qr',
            details=f'QR code for event {registration.event_id} used at event {event_id}',
            qr_data=qr_data
        )
        return False, 'QR code is not for this event', None

    # 6. Check blacklisted user
    if check_blacklisted_user(registration.user_id):
        return False, 'User is blacklisted', None

    # 7. Check duplicate scan
    if check_duplicate_scan(registration.id, event_id, day_number):
        return False, 'Already checked in today', None

    return True, 'Entry allowed', registration


def log_fraud(event_id, user_id, fraud_type, details, qr_data):
    """Log a fraud/security incident."""
    fraud_log = FraudLog(
        event_id=event_id,
        user_id=user_id,
        fraud_type=fraud_type,
        details=details,
        qr_data=qr_data
    )
    db.session.add(fraud_log)
    db.session.commit()
    return fraud_log


def analyze_sentiment(text):
    """Simple keyword-based sentiment analysis for feedback comments."""
    if not text:
        return 'neutral'

    text_lower = text.lower()

    positive_words = [
        'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love',
        'awesome', 'good', 'best', 'perfect', 'outstanding', 'brilliant',
        'superb', 'enjoyed', 'happy', 'satisfied', 'impressive', 'well done',
        'thank', 'recommend', 'nice', 'beautiful'
    ]
    negative_words = [
        'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor',
        'disappointing', 'boring', 'waste', 'ugly', 'dislike', 'unhappy',
        'angry', 'frustrated', 'confusing', 'broken', 'slow', 'rude'
    ]

    pos_count = sum(1 for w in positive_words if w in text_lower)
    neg_count = sum(1 for w in negative_words if w in text_lower)

    if pos_count > neg_count:
        return 'positive'
    elif neg_count > pos_count:
        return 'negative'
    else:
        return 'neutral'
