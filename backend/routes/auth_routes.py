from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from models import db, bcrypt
from models.user import User, Admin
from datetime import datetime
from utils.email_utils import send_real_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()

    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    user = User(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone', ''),
        role=data.get('role', 'user')
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'type': 'user'}
    )

    return jsonify({
        'message': 'Registration successful',
        'token': token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login for regular users."""
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    if user.is_blacklisted:
        return jsonify({'error': 'Your account has been suspended'}), 403

    token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'type': 'user'}
    )

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    """Login for admins."""
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    admin = Admin.query.filter_by(email=data['email']).first()

    if not admin or not admin.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = create_access_token(
        identity=str(admin.id),
        additional_claims={'role': 'admin', 'type': 'admin', 'super_admin': admin.super_admin}
    )

    return jsonify({
        'message': 'Admin login successful',
        'token': token,
        'admin': admin.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user profile."""
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims.get('type') == 'admin':
        admin = Admin.query.get(int(user_id))
        if not admin:
            return jsonify({'error': 'Admin not found'}), 404
        return jsonify({'user': admin.to_dict(), 'type': 'admin'}), 200
    else:
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': user.to_dict(), 'type': 'user'}), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Reset password (simplified — sets new password directly)."""
    data = request.get_json()

    if not data or not data.get('email') or not data.get('new_password'):
        return jsonify({'error': 'Email and new password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user:
        admin = Admin.query.filter_by(email=data['email']).first()
        if not admin:
            return jsonify({'error': 'Email not found'}), 404
        admin.set_password(data['new_password'])
        db.session.commit()
        
        # Send email to admin
        send_real_email(
            subject="EventZen QR: Password Reset",
            body=f"Hi {admin.name},\n\nYour password has been successfully reset. Your new password is: {data['new_password']}\n\nPlease change it after logging in.",
            recipient_email=admin.email
        )
        
        return jsonify({'message': 'Password reset successful. Check your email.'}), 200

    user.set_password(data['new_password'])
    db.session.commit()
    
    # Send email to user
    send_real_email(
        subject="EventZen QR: Password Reset",
        body=f"Hi {user.name},\n\nYour password has been successfully reset. Your new password is: {data['new_password']}\n\nPlease change it after logging in.",
        recipient_email=user.email
    )
    
    return jsonify({'message': 'Password reset successful. Check your email.'}), 200


@auth_bp.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile."""
    user_id = get_jwt_identity()
    claims = get_jwt()
    data = request.get_json()

    if claims.get('type') == 'admin':
        admin = Admin.query.get(int(user_id))
        if not admin:
            return jsonify({'error': 'Admin not found'}), 404
        if data.get('name'):
            admin.name = data['name']
        db.session.commit()
        return jsonify({'message': 'Profile updated', 'user': admin.to_dict()}), 200

    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if data.get('name'):
        user.name = data['name']
    if data.get('phone'):
        user.phone = data['phone']

    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': user.to_dict()}), 200
