"""Email/notification utility helpers."""
import logging
from flask import current_app
from flask_mailman import EmailMessage
from models import db
from models.notification import Notification
from models.user import User

logger = logging.getLogger(__name__)

def send_real_email(subject, body, recipient_email):
    """Send a real email using Flask-Mailman."""
    try:
        msg = EmailMessage(
            subject=subject,
            body=body,
            to=[recipient_email]
        )
        msg.send()
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {recipient_email}: {str(e)}")
        return False


def create_notification(user_id, title, message, notification_type='info'):
    """Create an in-app notification for a user and trigger an email."""
    # 1. Create DB Notification
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type
    )
    db.session.add(notif)
    db.session.commit()
    
    # 2. Try to send real email
    user = User.query.get(user_id)
    if user and user.email:
        send_real_email(
            subject=f"EventZen QR: {title}",
            body=message,
            recipient_email=user.email
        )
        
    return notif


def send_registration_success(user_id, event_title):
    """Send registration success notification."""
    create_notification(
        user_id=user_id,
        title='Registration Successful!',
        message=f'Hi! You have successfully registered for "{event_title}". Your QR code is ready in your dashboard.',
        notification_type='success'
    )


def send_event_reminder(user_id, event_title, event_date):
    """Send event reminder notification."""
    create_notification(
        user_id=user_id,
        title='Event Reminder',
        message=f'Reminder: "{event_title}" is coming up on {event_date}. Don\'t forget to bring your QR code!',
        notification_type='info'
    )


def send_qr_notification(user_id, event_title):
    """Send QR code ready notification."""
    create_notification(
        user_id=user_id,
        title='QR Code Ready',
        message=f'Your QR code for "{event_title}" has been generated. You can download it from your dashboard.',
        notification_type='success'
    )
