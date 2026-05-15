from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.attendance import Attendance
from models.registration import Registration
from models.event import Event
from models.qr_code import QRCode
from utils.ai_security import validate_qr_scan
from middleware.auth_middleware import admin_required, any_authenticated
from datetime import datetime

attendance_bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')


@attendance_bp.route('/scan', methods=['POST'])
@jwt_required()
def scan_entry():
    """Scan QR for event entry — runs full AI security checks."""
    data = request.get_json()
    qr_data = data.get('qr_data')
    event_id = data.get('event_id')
    scan_type = data.get('scan_type', 'entry')

    if not qr_data or not event_id:
        return jsonify({'error': 'qr_data and event_id required'}), 400

    event = Event.query.get(int(event_id))
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    # Calculate day number
    today = datetime.utcnow().date()
    day_number = (today - event.start_date).days + 1
    if day_number < 1:
        day_number = 1

    is_valid, message, registration = validate_qr_scan(qr_data, int(event_id), day_number)

    if not is_valid:
        return jsonify({
            'success': False,
            'message': message,
            'scan_type': scan_type
        }), 200

    # Create attendance record
    scanner_id = int(get_jwt_identity())
    attendance = Attendance(
        registration_id=registration.id,
        event_id=int(event_id),
        check_in_time=datetime.utcnow(),
        scan_type=scan_type,
        scanned_by=scanner_id,
        day_number=day_number
    )
    db.session.add(attendance)

    # Update registration status
    registration.status = 'attended'
    db.session.commit()

    user = registration.user

    return jsonify({
        'success': True,
        'message': f'Entry allowed for {user.name}',
        'scan_type': scan_type,
        'attendance': attendance.to_dict(),
        'user': user.to_dict()
    }), 200


@attendance_bp.route('/event/<int:event_id>', methods=['GET'])
@any_authenticated
def get_event_attendance(event_id):
    """Get attendance records for an event."""
    day = request.args.get('day', type=int)

    query = Attendance.query.filter_by(event_id=event_id)
    if day:
        query = query.filter_by(day_number=day)

    records = query.order_by(Attendance.check_in_time.desc()).all()
    return jsonify({
        'attendance': [r.to_dict() for r in records],
        'total': len(records)
    }), 200


@attendance_bp.route('/event/<int:event_id>/stats', methods=['GET'])
@any_authenticated
def get_attendance_stats(event_id):
    """Get attendance statistics for an event."""
    event = Event.query.get_or_404(event_id)
    total_registered = Registration.query.filter_by(event_id=event_id, status='registered').count()
    total_attended = Registration.query.filter_by(event_id=event_id, status='attended').count()

    today = datetime.utcnow().date()
    day_number = (today - event.start_date).days + 1
    today_attendance = Attendance.query.filter_by(event_id=event_id, day_number=max(day_number, 1)).count()

    return jsonify({
        'total_registered': total_registered + total_attended,
        'total_attended': total_attended,
        'today_attendance': today_attendance,
        'current_day': max(day_number, 1),
        'total_days': event.total_days()
    }), 200


@attendance_bp.route('/logs/<int:event_id>', methods=['GET'])
@any_authenticated
def get_scan_logs(event_id):
    """Get recent scan logs for an event."""
    limit = request.args.get('limit', 50, type=int)
    records = Attendance.query.filter_by(event_id=event_id) \
        .order_by(Attendance.check_in_time.desc()) \
        .limit(limit).all()

    return jsonify({
        'logs': [r.to_dict() for r in records]
    }), 200
