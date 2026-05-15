from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db
from models.welcome_kit import WelcomeKit
from models.registration import Registration
from models.qr_code import QRCode
from middleware.auth_middleware import admin_required, any_authenticated
from datetime import datetime

welcome_kit_bp = Blueprint('welcome_kits', __name__, url_prefix='/api/welcome-kits')


@welcome_kit_bp.route('/scan', methods=['POST'])
@jwt_required()
def scan_welcome_kit():
    """Scan QR to issue welcome kit."""
    data = request.get_json()
    qr_data = data.get('qr_data')
    event_id = data.get('event_id')

    if not qr_data or not event_id:
        return jsonify({'error': 'qr_data and event_id required'}), 400

    qr_code = QRCode.query.filter_by(qr_data=qr_data).first()
    if not qr_code or not qr_code.is_active:
        return jsonify({'success': False, 'message': 'Invalid QR code'}), 200

    registration = qr_code.registration
    if registration.event_id != int(event_id):
        return jsonify({'success': False, 'message': 'QR not for this event'}), 200

    kit = WelcomeKit.query.filter_by(
        registration_id=registration.id,
        event_id=int(event_id)
    ).first()

    if not kit:
        kit = WelcomeKit(
            registration_id=registration.id,
            event_id=int(event_id)
        )
        db.session.add(kit)

    if kit.received:
        return jsonify({
            'success': False,
            'message': 'Welcome kit already received',
            'kit': kit.to_dict()
        }), 200

    kit.received = True
    kit.issued_at = datetime.utcnow()
    db.session.commit()

    user = registration.user
    return jsonify({
        'success': True,
        'message': f'Welcome kit issued to {user.name}',
        'kit': kit.to_dict()
    }), 200


@welcome_kit_bp.route('/event/<int:event_id>', methods=['GET'])
@any_authenticated
def get_event_kits(event_id):
    """Get welcome kit records for an event."""
    kits = WelcomeKit.query.filter_by(event_id=event_id).all()
    issued = sum(1 for k in kits if k.received)

    return jsonify({
        'kits': [k.to_dict() for k in kits],
        'total': len(kits),
        'issued': issued,
        'pending': len(kits) - issued
    }), 200
