"""Email/notification utility helpers."""

from models import db
from models.notification import Notification


def create_notification(user_id, title, message, notification_type='info'):
    """Create an in-app notification for a user."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type
    )
    db.session.add(notif)
    db.session.commit()
    return notif


def send_registration_success(user_id, event_title):
    """Send registration success notification."""
    create_notification(
        user_id=user_id,
        title='Registration Successful!',
        message=f'You have successfully registered for "{event_title}". Your QR code is ready.',
        notification_type='success'
    )


def send_event_reminder(user_id, event_title, event_date):
    """Send event reminder notification."""
    create_notification(
        user_id=user_id,
        title='Event Reminder',
        message=f'Reminder: "{event_title}" is on {event_date}. Don\'t forget your QR code!',
        notification_type='info'
    )


def send_qr_notification(user_id, event_title):
    """Send QR code ready notification."""
    create_notification(
        user_id=user_id,
        title='QR Code Ready',
        message=f'Your QR code for "{event_title}" has been generated. View it in your dashboard.',
        notification_type='success'
    )
