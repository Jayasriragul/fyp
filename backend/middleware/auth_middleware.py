from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def admin_required(fn):
    """Decorator that ensures the request comes from an admin user."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


def user_required(fn):
    """Decorator that ensures the request comes from a regular user."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get('role') not in ('user', 'organizer'):
            return jsonify({'error': 'User access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


def any_authenticated(fn):
    """Decorator that allows both admin and user access."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        return fn(*args, **kwargs)
    return wrapper
