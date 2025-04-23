import os
from flask import Flask, jsonify
from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from apispec_webframeworks.flask import FlaskPlugin

from .config import config
from .extensions import db, migrate
from .models import User  # Import the User model
from .routes.auth_routes import auth_bp  # Import the auth blueprint
from .routes.fuel_order_routes import fuel_order_bp  # Import the fuel order blueprint
from .schemas import (
    RegisterRequestSchema,
    UserResponseSchema,
    RegisterResponseSchema,
    LoginRequestSchema,
    LoginSuccessResponseSchema,
    ErrorResponseSchema
)

def create_app(config_name=None):
    """Application factory function."""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    # Create Flask app instance
    app = Flask(__name__)

    # Load config
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Initialize APISpec
    spec = APISpec(
        title="FBO LaunchPad API",
        version="1.0.0",
        openapi_version="3.0.2",
        plugins=[FlaskPlugin(), MarshmallowPlugin()],
        info={"description": "API for FBO LaunchPad operations platform"},
        components={
            "securitySchemes": {
                "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT"
                }
            }
        },
        security=[{"bearerAuth": []}]
    )

    # Store spec in app context
    app.spec = spec

    # Register schemas with APISpec
    with app.app_context():
        # Register schemas
        spec.components.schema("RegisterRequestSchema", schema=RegisterRequestSchema)
        spec.components.schema("UserResponseSchema", schema=UserResponseSchema)
        spec.components.schema("RegisterResponseSchema", schema=RegisterResponseSchema)
        spec.components.schema("LoginRequestSchema", schema=LoginRequestSchema)
        spec.components.schema("LoginSuccessResponseSchema", schema=LoginSuccessResponseSchema)
        spec.components.schema("ErrorResponseSchema", schema=ErrorResponseSchema)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(fuel_order_bp)  # Register the fuel order blueprint

    # After registering blueprints, register paths with APISpec
    with app.app_context():
        # Register auth routes
        spec.path(view=auth_bp.view_functions['register'])
        spec.path(view=auth_bp.view_functions['login'])

    @app.route('/')
    def root():
        """Root endpoint."""
        return jsonify({"status": "ok", "message": "FBO LaunchPad API is running"})

    @app.route('/health')
    def health_check():
        """Basic health check endpoint."""
        return jsonify({'status': 'healthy', 'message': 'FBO LaunchPad API is running'})

    @app.route('/api/swagger.json')
    def create_swagger_spec():
        """Serve the swagger specification."""
        return jsonify(app.spec.to_dict())

    return app

# Create an app instance for running directly
app = create_app() 