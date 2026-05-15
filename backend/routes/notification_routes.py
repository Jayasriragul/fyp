from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.notification import Notification
from middleware.auth_middleware import any_authenticated

notification_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')


@notification_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get user's notifications."""
    user_id = int(get_jwt_identity())
    limit = request.args.get('limit', 20, type=int)

    notifications = Notification.query.filter_by(user_id=user_id) \
        .order_by(Notification.created_at.desc()) \
        .limit(limit).all()

    unread = Notification.query.filter_by(user_id=user_id, is_read=False).count()

    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread
    }), 200


@notification_bp.route('/read/<int:notif_id>', methods=['PUT'])
@jwt_required()
def mark_as_read(notif_id):
    """Mark a notification as read."""
    user_id = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=notif_id, user_id=user_id).first_or_404()
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read'}), 200


@notification_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_read():
    """Mark all notifications as read."""
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All marked as read'}), 200
