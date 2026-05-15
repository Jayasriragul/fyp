from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db
from models.user import User
from models.event import Event
from models.registration import Registration
from models.attendance import Attendance
from models.meal import Meal
from models.feedback import Feedback
from models.fraud_log import FraudLog
from models.welcome_kit import WelcomeKit
from middleware.auth_middleware import admin_required
from datetime import datetime
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard():
    """Get admin dashboard statistics."""
    total_users = User.query.count()
    total_events = Event.query.count()
    active_events = Event.query.filter_by(is_active=True).count()
    total_registrations = Registration.query.count()
    total_attendance = Attendance.query.count()
    total_fraud = FraudLog.query.filter_by(resolved=False).count()

    # Today's stats
    today = datetime.utcnow().date()
    today_attendance = Attendance.query.filter(
        func.date(Attendance.check_in_time) == today
    ).count()
    today_registrations = Registration.query.filter(
        func.date(Registration.registered_at) == today
    ).count()

    # Recent fraud
    recent_fraud = FraudLog.query.order_by(FraudLog.detected_at.desc()).limit(10).all()

    return jsonify({
        'stats': {
            'total_users': total_users,
            'total_events': total_events,
            'active_events': active_events,
            'total_registrations': total_registrations,
            'total_attendance': total_attendance,
            'unresolved_fraud': total_fraud,
            'today_attendance': today_attendance,
            'today_registrations': today_registrations
        },
        'recent_fraud': [f.to_dict() for f in recent_fraud]
    }), 200


@admin_bp.route('/analytics/<int:event_id>', methods=['GET'])
@admin_required
def get_event_analytics(event_id):
    """Get detailed analytics for an event."""
    event = Event.query.get_or_404(event_id)

    total_registered = Registration.query.filter_by(event_id=event_id).count()
    total_attended = Registration.query.filter_by(event_id=event_id, status='attended').count()

    # Daily attendance
    daily_attendance = db.session.query(
        Attendance.day_number,
        func.count(Attendance.id)
    ).filter_by(event_id=event_id).group_by(Attendance.day_number).all()

    # Meal stats per day
    meal_stats = db.session.query(
        Meal.day_number,
        Meal.meal_type,
        func.count(Meal.id)
    ).filter_by(event_id=event_id).group_by(Meal.day_number, Meal.meal_type).all()

    # Feedback stats
    feedback_records = Feedback.query.filter_by(event_id=event_id).all()
    avg_rating = round(sum(f.rating for f in feedback_records) / len(feedback_records), 1) if feedback_records else 0
    sentiments = {'positive': 0, 'neutral': 0, 'negative': 0}
    for f in feedback_records:
        sentiments[f.sentiment] = sentiments.get(f.sentiment, 0) + 1

    # Welcome kit stats
    kits_total = WelcomeKit.query.filter_by(event_id=event_id).count()
    kits_issued = WelcomeKit.query.filter_by(event_id=event_id, received=True).count()

    # Fraud stats
    fraud_records = FraudLog.query.filter_by(event_id=event_id).all()
    fraud_by_type = {}
    for f in fraud_records:
        fraud_by_type[f.fraud_type] = fraud_by_type.get(f.fraud_type, 0) + 1

    return jsonify({
        'event': event.to_dict(),
        'registrations': total_registered,
        'attended': total_attended,
        'daily_attendance': [{'day': d, 'count': c} for d, c in daily_attendance],
        'meal_stats': [{'day': d, 'type': t, 'count': c} for d, t, c in meal_stats],
        'feedback': {
            'total': len(feedback_records),
            'average_rating': avg_rating,
            'sentiments': sentiments
        },
        'welcome_kits': {
            'total': kits_total,
            'issued': kits_issued,
            'pending': kits_total - kits_issued
        },
        'fraud': {
            'total': len(fraud_records),
            'by_type': fraud_by_type
        }
    }), 200


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users."""
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200


@admin_bp.route('/users/<int:user_id>/blacklist', methods=['PUT'])
@admin_required
def toggle_blacklist(user_id):
    """Toggle user blacklist status."""
    user = User.query.get_or_404(user_id)
    user.is_blacklisted = not user.is_blacklisted
    db.session.commit()
    return jsonify({
        'message': f'User {"blacklisted" if user.is_blacklisted else "unblacklisted"}',
        'user': user.to_dict()
    }), 200


@admin_bp.route('/fraud-logs', methods=['GET'])
@admin_required
def get_fraud_logs():
    """Get all fraud logs."""
    event_id = request.args.get('event_id', type=int)
    query = FraudLog.query

    if event_id:
        query = query.filter_by(event_id=event_id)

    logs = query.order_by(FraudLog.detected_at.desc()).limit(100).all()
    return jsonify({'fraud_logs': [l.to_dict() for l in logs]}), 200


@admin_bp.route('/fraud-logs/<int:log_id>/resolve', methods=['PUT'])
@admin_required
def resolve_fraud(log_id):
    """Resolve a fraud log entry."""
    log = FraudLog.query.get_or_404(log_id)
    log.resolved = True
    db.session.commit()
    return jsonify({'message': 'Fraud log resolved'}), 200
