from flask import Flask
from .config import Config
from .extensions import db, jwt, cors
from flask_cors import CORS
from .models import User


from .routes.auth_routes import auth_bp
from .routes.chat_routes import chat_bp
from .routes.mood_routes import mood_bp
from .routes.admin_routes import admin_bp
from .routes.user_routes import user_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    # cors.init_app(app) # Use explicit CORS below
    CORS(app, resources={r"/*": {"origins": "*"}})
    print("Backend Server Starting...")

    # Health check / root route
    @app.route("/")
    def home():
        return {
            "status": "API is running",
            "message": "Mental Health Backend is live"
        }

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(mood_bp, url_prefix="/api/mood")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(user_bp, url_prefix="/api/user")
    
    from .routes.session_routes import session_bp
    app.register_blueprint(session_bp, url_prefix="/api/sessions")

    from .routes.resource_routes import resource_bp
    app.register_blueprint(resource_bp, url_prefix="/api/resources")

    from .routes.contact_routes import contact_bp
    app.register_blueprint(contact_bp, url_prefix="/api/contacts")

    # Create database tables
    with app.app_context():
        db.create_all()

    return app
