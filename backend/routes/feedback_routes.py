from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.feedback import Feedback
from models.registration import Registration
from utils.ai_security import analyze_sentiment
from middleware.auth_middleware import any_authenticated
from datetime import datetime

feedback_bp = Blueprint('feedback', __name__, url_prefix='/api/feedback')


@feedback_bp.route('', methods=['POST'])
@jwt_required()
def submit_feedback():
    """Submit feedback for an event."""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    event_id = data.get('event_id')
    rating = data.get('rating')
    comment = data.get('comment', '')

    if not event_id or not rating:
        return jsonify({'error': 'event_id and rating are required'}), 400

    if not (1 <= int(rating) <= 5):
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    # Check if user attended the event
    reg = Registration.query.filter_by(user_id=user_id, event_id=int(event_id)).first()
    if not reg:
        return jsonify({'error': 'You must be registered for this event'}), 400

    # Check for existing feedback
    existing = Feedback.query.filter_by(user_id=user_id, event_id=int(event_id)).first()
    if existing:
        existing.rating = int(rating)
        existing.comment = comment
        existing.sentiment = analyze_sentiment(comment)
        db.session.commit()
        return jsonify({'message': 'Feedback updated', 'feedback': existing.to_dict()}), 200

    sentiment = analyze_sentiment(comment)

    feedback = Feedback(
        user_id=user_id,
        event_id=int(event_id),
        rating=int(rating),
        comment=comment,
        sentiment=sentiment
    )
    db.session.add(feedback)
    db.session.commit()

    return jsonify({'message': 'Feedback submitted', 'feedback': feedback.to_dict()}), 201


@feedback_bp.route('/event/<int:event_id>', methods=['GET'])
@any_authenticated
def get_event_feedback(event_id):
    """Get all feedback for an event."""
    records = Feedback.query.filter_by(event_id=event_id).order_by(Feedback.created_at.desc()).all()

    avg_rating = 0
    if records:
        avg_rating = round(sum(f.rating for f in records) / len(records), 1)

    sentiments = {'positive': 0, 'neutral': 0, 'negative': 0}
    for f in records:
        sentiments[f.sentiment] = sentiments.get(f.sentiment, 0) + 1

    return jsonify({
        'feedback': [f.to_dict() for f in records],
        'total': len(records),
        'average_rating': avg_rating,
        'sentiments': sentiments
    }), 200


@feedback_bp.route('/my/<int:event_id>', methods=['GET'])
@jwt_required()
def get_my_feedback(event_id):
    """Get current user's feedback for an event."""
    user_id = int(get_jwt_identity())
    fb = Feedback.query.filter_by(user_id=user_id, event_id=event_id).first()

    if not fb:
        return jsonify({'feedback': None}), 200

    return jsonify({'feedback': fb.to_dict()}), 200
