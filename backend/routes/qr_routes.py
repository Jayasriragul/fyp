from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.qr_code import QRCode
from models.registration import Registration
from utils.qr_utils import generate_qr_image_base64, reset_qr_daily
from middleware.auth_middleware import admin_required
from datetime import datetime

qr_bp = Blueprint('qr', __name__, url_prefix='/api/qr')


@qr_bp.route('/my-qr/<int:event_id>', methods=['GET'])
@jwt_required()
def get_my_qr(event_id):
    """Get user's QR code for a specific event."""
    user_id = int(get_jwt_identity())

    registration = Registration.query.filter_by(user_id=user_id, event_id=event_id).first()
    if not registration:
        return jsonify({'error': 'Not registered for this event'}), 404

    qr_code = registration.qr_code
    if not qr_code:
        return jsonify({'error': 'QR code not found'}), 404

    # Daily reset check
    today = datetime.utcnow().date()
    if qr_code.last_reset != today and not qr_code.is_expired():
        qr_code = reset_qr_daily(qr_code)

    qr_image = generate_qr_image_base64(qr_code.qr_data)

    return jsonify({
        'qr_code': qr_code.to_dict(),
        'qr_image': qr_image,
        'user': registration.user.to_dict(),
        'event': registration.event.to_dict()
    }), 200


@qr_bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_qr():
    """Validate a QR code (scanner endpoint)."""
    data = request.get_json()
    qr_data = data.get('qr_data')
    event_id = data.get('event_id')

    if not qr_data or not event_id:
        return jsonify({'error': 'qr_data and event_id required'}), 400

    qr_code = QRCode.query.filter_by(qr_data=qr_data).first()

    if not qr_code:
        return jsonify({'valid': False, 'message': 'Invalid QR code'}), 200

    if not qr_code.is_active:
        return jsonify({'valid': False, 'message': 'QR code is deactivated'}), 200

    if qr_code.is_expired():
        return jsonify({'valid': False, 'message': 'QR code has expired'}), 200

    registration = qr_code.registration
    if registration.event_id != int(event_id):
        return jsonify({'valid': False, 'message': 'QR code is not for this event'}), 200

    user = registration.user
    return jsonify({
        'valid': True,
        'message': 'Valid QR code',
        'user': user.to_dict(),
        'registration': registration.to_dict()
    }), 200


@qr_bp.route('/reset/<int:registration_id>', methods=['POST'])
@admin_required
def reset_qr(registration_id):
    """Admin: Force reset a QR code."""
    registration = Registration.query.get_or_404(registration_id)
    qr_code = registration.qr_code

    if not qr_code:
        return jsonify({'error': 'QR code not found'}), 404

    qr_code = reset_qr_daily(qr_code)
    return jsonify({
        'message': 'QR code reset successful',
        'qr_code': qr_code.to_dict()
    }), 200


@qr_bp.route('/deactivate/<int:registration_id>', methods=['POST'])
@admin_required
def deactivate_qr(registration_id):
    """Admin: Deactivate a QR code."""
    registration = Registration.query.get_or_404(registration_id)
    qr_code = registration.qr_code

    if not qr_code:
        return jsonify({'error': 'QR code not found'}), 404

    qr_code.is_active = False
    db.session.commit()

    return jsonify({'message': 'QR code deactivated'}), 200
