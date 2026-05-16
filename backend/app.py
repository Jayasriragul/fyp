import eventlet
eventlet.monkey_patch()

import os
import sys

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO, emit
from flask_mailman import Mail
from config import Config
from models import db, bcrypt

# Initialize Extensions (global instances)
socketio = SocketIO(cors_allowed_origins="*", async_mode='eventlet')
mail = Mail()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)
    JWTManager(app)
    
    # Support multiple CORS origins
    origins = [o.strip() for o in Config.FRONTEND_URL.split(',')]
    CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)
    socketio.init_app(app)

    # Create uploads directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'banners'), exist_ok=True)

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Register blueprints
    from routes.auth_routes import auth_bp
    from routes.event_routes import event_bp
    from routes.qr_routes import qr_bp
    from routes.attendance_routes import attendance_bp
    from routes.meal_routes import meal_bp
    from routes.welcome_kit_routes import welcome_kit_bp
    from routes.export_routes import export_bp
    from routes.feedback_routes import feedback_bp
    from routes.notification_routes import notification_bp
    from routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(event_bp)
    app.register_blueprint(qr_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(meal_bp)
    app.register_blueprint(welcome_kit_bp)
    app.register_blueprint(export_bp)
    app.register_blueprint(feedback_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(admin_bp)

    # Root route
    @app.route('/')
    def index():
        return {
            'status': 'online',
            'message': 'EventZen QR API is live',
            'version': '1.0.0'
        }

    # Health check
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'EventZen QR API is running'}

    return app


# ============================================
# SocketIO Events
# ============================================

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connected', {'message': 'Connected to EventZen QR'})


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@socketio.on('join_event')
def handle_join_event(data):
    """Join a specific event room for live updates."""
    from flask_socketio import join_room
    event_id = data.get('event_id')
    if event_id:
        join_room(f'event_{event_id}')
        emit('joined', {'event_id': event_id})


@socketio.on('leave_event')
def handle_leave_event(data):
    """Leave an event room."""
    from flask_socketio import leave_room
    event_id = data.get('event_id')
    if event_id:
        leave_room(f'event_{event_id}')


@socketio.on('scan_update')
def handle_scan_update(data):
    """Broadcast scan update to event room."""
    event_id = data.get('event_id')
    if event_id:
        socketio.emit('attendance_update', data, room=f'event_{event_id}')


@socketio.on('fraud_alert')
def handle_fraud_alert(data):
    """Broadcast fraud alert to event room."""
    event_id = data.get('event_id')
    if event_id:
        socketio.emit('fraud_detected', data, room=f'event_{event_id}')


# ============================================
# Run Application
# ============================================

if __name__ == '__main__':
    app = create_app()

    with app.app_context():
        # Import all models to ensure they are registered
        from models.user import User, Admin
        from models.event import Event
        from models.registration import Registration
        from models.qr_code import QRCode
        from models.attendance import Attendance
        from models.meal import Meal
        from models.welcome_kit import WelcomeKit
        from models.fraud_log import FraudLog
        from models.notification import Notification
        from models.feedback import Feedback

    print('=' * 50)
    print('  EventZen QR API Server')
    print('  http://localhost:5000')
    print('=' * 50)

    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=Config.DEBUG)
