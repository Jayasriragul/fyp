from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.meal import Meal
from models.registration import Registration
from models.event import Event
from models.qr_code import QRCode
from middleware.auth_middleware import any_authenticated, admin_required
from datetime import datetime

meal_bp = Blueprint('meals', __name__, url_prefix='/api/meals')


@meal_bp.route('/scan', methods=['POST'])
@jwt_required()
def scan_meal():
    """Scan QR for meal tracking."""
    data = request.get_json()
    qr_data = data.get('qr_data')
    event_id = data.get('event_id')
    meal_type = data.get('meal_type')  # breakfast, lunch, dinner

    if not qr_data or not event_id or not meal_type:
        return jsonify({'error': 'qr_data, event_id, and meal_type required'}), 400

    if meal_type not in ('breakfast', 'lunch', 'dinner'):
        return jsonify({'error': 'Invalid meal type'}), 400

    # Validate QR
    qr_code = QRCode.query.filter_by(qr_data=qr_data).first()
    if not qr_code or not qr_code.is_active or qr_code.is_expired():
        return jsonify({'success': False, 'message': 'Invalid or expired QR code'}), 200

    registration = qr_code.registration
    if registration.event_id != int(event_id):
        return jsonify({'success': False, 'message': 'QR not for this event'}), 200

    event = Event.query.get(int(event_id))
    today = datetime.utcnow().date()
    day_number = (today - event.start_date).days + 1
    if day_number < 1:
        day_number = 1

    # Check duplicate meal
    existing = Meal.query.filter_by(
        registration_id=registration.id,
        event_id=int(event_id),
        meal_type=meal_type,
        day_number=day_number
    ).first()

    if existing:
        return jsonify({
            'success': False,
            'message': f'{meal_type.capitalize()} already claimed today'
        }), 200

    meal = Meal(
        registration_id=registration.id,
        event_id=int(event_id),
        meal_type=meal_type,
        day_number=day_number
    )
    db.session.add(meal)
    db.session.commit()

    user = registration.user
    return jsonify({
        'success': True,
        'message': f'{meal_type.capitalize()} recorded for {user.name}',
        'meal': meal.to_dict()
    }), 200


@meal_bp.route('/event/<int:event_id>', methods=['GET'])
@any_authenticated
def get_event_meals(event_id):
    """Get meal records for an event."""
    day = request.args.get('day', type=int)
    meal_type = request.args.get('meal_type')

    query = Meal.query.filter_by(event_id=event_id)
    if day:
        query = query.filter_by(day_number=day)
    if meal_type:
        query = query.filter_by(meal_type=meal_type)

    records = query.order_by(Meal.scanned_at.desc()).all()
    return jsonify({
        'meals': [r.to_dict() for r in records],
        'total': len(records)
    }), 200


@meal_bp.route('/event/<int:event_id>/stats', methods=['GET'])
@any_authenticated
def get_meal_stats(event_id):
    """Get meal statistics for an event."""
    event = Event.query.get_or_404(event_id)
    today = datetime.utcnow().date()
    day_number = max((today - event.start_date).days + 1, 1)

    breakfast = Meal.query.filter_by(event_id=event_id, meal_type='breakfast', day_number=day_number).count()
    lunch = Meal.query.filter_by(event_id=event_id, meal_type='lunch', day_number=day_number).count()
    dinner = Meal.query.filter_by(event_id=event_id, meal_type='dinner', day_number=day_number).count()

    total_registered = Registration.query.filter_by(event_id=event_id).filter(
        Registration.status.in_(['registered', 'attended'])
    ).count()

    return jsonify({
        'breakfast': breakfast,
        'lunch': lunch,
        'dinner': dinner,
        'total_registered': total_registered,
        'current_day': day_number
    }), 200
