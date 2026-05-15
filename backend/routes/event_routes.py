import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.event import Event
from models.registration import Registration
from middleware.auth_middleware import admin_required
from datetime import datetime
from werkzeug.utils import secure_filename

event_bp = Blueprint('events', __name__, url_prefix='/api/events')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@event_bp.route('', methods=['GET'])
def get_events():
    """Get all active events."""
    events = Event.query.filter_by(is_active=True).order_by(Event.start_date.desc()).all()
    result = []
    for event in events:
        ed = event.to_dict()
        ed['registration_count'] = Registration.query.filter_by(event_id=event.id, status='registered').count()
        result.append(ed)
    return jsonify({'events': result}), 200


@event_bp.route('/all', methods=['GET'])
@admin_required
def get_all_events():
    """Admin: Get all events including inactive."""
    events = Event.query.order_by(Event.start_date.desc()).all()
    result = []
    for event in events:
        ed = event.to_dict()
        ed['registration_count'] = Registration.query.filter_by(event_id=event.id).count()
        result.append(ed)
    return jsonify({'events': result}), 200


@event_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    """Get a single event by ID."""
    event = Event.query.get_or_404(event_id)
    ed = event.to_dict()
    ed['registration_count'] = Registration.query.filter_by(event_id=event.id, status='registered').count()
    return jsonify({'event': ed}), 200


@event_bp.route('', methods=['POST'])
@admin_required
def create_event():
    """Create a new event."""
    admin_id = get_jwt_identity()

    title = request.form.get('title') or (request.get_json() or {}).get('title')
    if not title:
        return jsonify({'error': 'Title is required'}), 400

    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
    else:
        data = request.get_json() or {}

    event = Event(
        title=data.get('title', ''),
        description=data.get('description', ''),
        venue=data.get('venue', ''),
        address=data.get('address', ''),
        start_date=datetime.strptime(data.get('start_date', datetime.utcnow().strftime('%Y-%m-%d')), '%Y-%m-%d').date(),
        end_date=datetime.strptime(data.get('end_date', datetime.utcnow().strftime('%Y-%m-%d')), '%Y-%m-%d').date(),
        start_time=datetime.strptime(data.get('start_time', '09:00'), '%H:%M').time(),
        end_time=datetime.strptime(data.get('end_time', '17:00'), '%H:%M').time(),
        max_attendees=int(data.get('max_attendees', 0)),
        created_by=int(admin_id)
    )

    # Handle banner upload
    if 'banner' in request.files:
        file = request.files['banner']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{datetime.utcnow().timestamp()}_{file.filename}")
            upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'banners')
            os.makedirs(upload_dir, exist_ok=True)
            filepath = os.path.join(upload_dir, filename)
            file.save(filepath)
            event.banner_url = f'/uploads/banners/{filename}'

    db.session.add(event)
    db.session.commit()

    return jsonify({'message': 'Event created', 'event': event.to_dict()}), 201


@event_bp.route('/<int:event_id>', methods=['PUT'])
@admin_required
def update_event(event_id):
    """Update an existing event."""
    event = Event.query.get_or_404(event_id)

    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
    else:
        data = request.get_json() or {}

    if data.get('title'):
        event.title = data['title']
    if data.get('description') is not None:
        event.description = data['description']
    if data.get('venue'):
        event.venue = data['venue']
    if data.get('address') is not None:
        event.address = data['address']
    if data.get('start_date'):
        event.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
    if data.get('end_date'):
        event.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
    if data.get('start_time'):
        event.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
    if data.get('end_time'):
        event.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
    if data.get('max_attendees') is not None:
        event.max_attendees = int(data['max_attendees'])
    if data.get('is_active') is not None:
        event.is_active = data['is_active'] in (True, 'true', '1', 1)

    # Handle banner upload
    if 'banner' in request.files:
        file = request.files['banner']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{datetime.utcnow().timestamp()}_{file.filename}")
            upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'banners')
            os.makedirs(upload_dir, exist_ok=True)
            filepath = os.path.join(upload_dir, filename)
            file.save(filepath)
            event.banner_url = f'/uploads/banners/{filename}'

    db.session.commit()
    return jsonify({'message': 'Event updated', 'event': event.to_dict()}), 200


@event_bp.route('/<int:event_id>', methods=['DELETE'])
@admin_required
def delete_event(event_id):
    """Delete an event."""
    event = Event.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Event deleted'}), 200


@event_bp.route('/<int:event_id>/register', methods=['POST'])
@jwt_required()
def register_for_event(event_id):
    """Register current user for an event."""
    user_id = int(get_jwt_identity())
    claims = get_jwt()

    if claims.get('type') == 'admin':
        return jsonify({'error': 'Admins cannot register for events'}), 400

    event = Event.query.get_or_404(event_id)

    if not event.is_active:
        return jsonify({'error': 'Event is not active'}), 400

    existing = Registration.query.filter_by(user_id=user_id, event_id=event_id).first()
    if existing:
        return jsonify({'error': 'Already registered for this event'}), 409

    if event.max_attendees > 0:
        current_count = Registration.query.filter_by(event_id=event_id, status='registered').count()
        if current_count >= event.max_attendees:
            return jsonify({'error': 'Event is full'}), 400

    registration = Registration(user_id=user_id, event_id=event_id)
    db.session.add(registration)
    db.session.commit()

    # Generate QR code
    from utils.qr_utils import create_qr_for_registration
    qr_code = create_qr_for_registration(registration.id, event.end_date, event.end_time)

    # Create welcome kit record
    from models.welcome_kit import WelcomeKit
    kit = WelcomeKit(registration_id=registration.id, event_id=event_id)
    db.session.add(kit)
    db.session.commit()

    # Send notification
    from utils.email_utils import send_registration_success, send_qr_notification
    send_registration_success(user_id, event.title)
    send_qr_notification(user_id, event.title)

    return jsonify({
        'message': 'Registration successful',
        'registration': registration.to_dict(),
        'qr_code': qr_code.to_dict()
    }), 201


@event_bp.route('/my-events', methods=['GET'])
@jwt_required()
def get_my_events():
    """Get events the current user is registered for."""
    user_id = int(get_jwt_identity())
    registrations = Registration.query.filter_by(user_id=user_id).all()

    result = []
    for reg in registrations:
        event = reg.event.to_dict()
        event['registration_id'] = reg.id
        event['registration_status'] = reg.status
        if reg.qr_code:
            event['qr_data'] = reg.qr_code.qr_data
            event['qr_active'] = reg.qr_code.is_active and not reg.qr_code.is_expired()
        result.append(event)

    return jsonify({'events': result}), 200
