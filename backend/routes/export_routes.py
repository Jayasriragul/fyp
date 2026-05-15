from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required
from models.user import User
from models.attendance import Attendance
from models.meal import Meal
from models.feedback import Feedback
from models.registration import Registration
from utils.export_utils import export_users_excel, export_attendance_excel, export_meals_excel, export_feedback_excel
from utils.pdf_utils import generate_event_badge, generate_entry_pass, generate_certificate
from utils.qr_utils import generate_qr_image_base64
from models.qr_code import QRCode
from models.event import Event
from middleware.auth_middleware import admin_required, any_authenticated
from datetime import datetime

export_bp = Blueprint('export', __name__, url_prefix='/api/export')


@export_bp.route('/users', methods=['GET'])
@admin_required
def export_users():
    """Export all users to Excel."""
    users = User.query.all()
    buffer = export_users_excel(users)
    return send_file(
        buffer,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'users_{datetime.utcnow().strftime("%Y%m%d")}.xlsx'
    )


@export_bp.route('/attendance/<int:event_id>', methods=['GET'])
@admin_required
def export_attendance(event_id):
    """Export attendance records for an event."""
    records = Attendance.query.filter_by(event_id=event_id).all()
    buffer = export_attendance_excel(records)
    return send_file(
        buffer,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'attendance_event{event_id}_{datetime.utcnow().strftime("%Y%m%d")}.xlsx'
    )


@export_bp.route('/meals/<int:event_id>', methods=['GET'])
@admin_required
def export_meals(event_id):
    """Export meal records for an event."""
    records = Meal.query.filter_by(event_id=event_id).all()
    buffer = export_meals_excel(records)
    return send_file(
        buffer,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'meals_event{event_id}_{datetime.utcnow().strftime("%Y%m%d")}.xlsx'
    )


@export_bp.route('/feedback/<int:event_id>', methods=['GET'])
@admin_required
def export_feedback(event_id):
    """Export feedback for an event."""
    records = Feedback.query.filter_by(event_id=event_id).all()
    buffer = export_feedback_excel(records)
    return send_file(
        buffer,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'feedback_event{event_id}_{datetime.utcnow().strftime("%Y%m%d")}.xlsx'
    )


@export_bp.route('/badge/<int:registration_id>', methods=['GET'])
@any_authenticated
def export_badge(registration_id):
    """Generate and download an event badge PDF."""
    reg = Registration.query.get_or_404(registration_id)
    user = reg.user
    event = reg.event
    qr_code = reg.qr_code

    qr_image = generate_qr_image_base64(qr_code.qr_data) if qr_code else None

    buffer = generate_event_badge(
        user_name=user.name,
        user_email=user.email,
        event_title=event.title,
        event_venue=event.venue,
        qr_image_base64=qr_image
    )

    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'badge_{user.name.replace(" ", "_")}.pdf'
    )


@export_bp.route('/entry-pass/<int:registration_id>', methods=['GET'])
@any_authenticated
def export_entry_pass(registration_id):
    """Generate and download an entry pass PDF."""
    reg = Registration.query.get_or_404(registration_id)
    user = reg.user
    event = reg.event
    qr_code = reg.qr_code

    qr_image = generate_qr_image_base64(qr_code.qr_data) if qr_code else None

    buffer = generate_entry_pass(
        user_name=user.name,
        event_title=event.title,
        event_date=event.start_date.strftime('%B %d, %Y'),
        event_venue=event.venue,
        qr_image_base64=qr_image
    )

    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'entry_pass_{user.name.replace(" ", "_")}.pdf'
    )


@export_bp.route('/certificate/<int:registration_id>', methods=['GET'])
@any_authenticated
def export_certificate(registration_id):
    """Generate and download a participation certificate PDF."""
    reg = Registration.query.get_or_404(registration_id)
    user = reg.user
    event = reg.event

    buffer = generate_certificate(
        user_name=user.name,
        event_title=event.title,
        event_date=f"{event.start_date.strftime('%B %d')} - {event.end_date.strftime('%B %d, %Y')}"
    )

    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'certificate_{user.name.replace(" ", "_")}.pdf'
    )
