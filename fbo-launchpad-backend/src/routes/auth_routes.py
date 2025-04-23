from flask import Blueprint, request, jsonify, current_app
from ..services.auth_service import AuthService
from ..schemas import (
    RegisterRequestSchema,
    RegisterResponseSchema,
    LoginRequestSchema,
    LoginSuccessResponseSchema,
    ErrorResponseSchema
)

# Create a Blueprint for authentication routes
auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user.
    ---
    tags:
      - Authentication
    requestBody:
      required: true
      content:
        application/json:
          schema: RegisterRequestSchema
    responses:
      201:
        description: User registered successfully
        content:
          application/json:
            schema: RegisterResponseSchema
      400:
        description: Bad Request (e.g., missing fields, invalid email/password format)
        content:
          application/json:
            schema: ErrorResponseSchema
      409:
        description: Conflict (e.g., email already registered)
        content:
          application/json:
            schema: ErrorResponseSchema
    """
    data = request.get_json()
    
    # Basic input validation
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request data"}), 400
    
    # Check for required fields
    required_fields = ['name', 'email', 'password']
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        return jsonify({
            "error": "Missing required fields",
            "missing_fields": missing_fields
        }), 400
    
    # Extract data
    name = data['name']
    email = data['email']
    password = data['password']
    
    # Basic type validation
    if not all(isinstance(data[field], str) for field in required_fields):
        return jsonify({"error": "All fields must be strings"}), 400
    
    # Basic length validation
    if len(name.strip()) < 2:
        return jsonify({"error": "Name must be at least 2 characters long"}), 400
    
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long"}), 400
    
    if '@' not in email or '.' not in email:
        return jsonify({"error": "Invalid email format"}), 400
    
    # Call AuthService to register the user
    new_user, message = AuthService.register_user(name=name, email=email, password=password)
    
    # Handle the registration result
    if new_user is not None:
        # Format user data for response, excluding sensitive information
        user_data = {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role.value,
            "is_active": new_user.is_active,
            "created_at": new_user.created_at.isoformat()
        }
        return jsonify({"message": message, "user": user_data}), 201
    else:
        # Handle registration failure
        status_code = 409 if "Email already registered" in message else 400
        return jsonify({"error": message}), status_code 

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate a user and return a JWT.
    ---
    tags:
      - Authentication
    requestBody:
      required: true
      content:
        application/json:
          schema: LoginRequestSchema
    responses:
      200:
        description: Login successful, JWT returned
        content:
          application/json:
            schema: LoginSuccessResponseSchema
      400:
        description: Bad Request (e.g., missing fields)
        content:
          application/json:
            schema: ErrorResponseSchema
      401:
        description: Unauthorized (e.g., invalid credentials, inactive user)
        content:
          application/json:
            schema: ErrorResponseSchema
      500:
        description: Server error (e.g., token generation failed)
        content:
          application/json:
            schema: ErrorResponseSchema
    """
    data = request.get_json()
    
    # Basic input validation
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request data"}), 400
    
    # Check for required fields
    required_fields = ['email', 'password']
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        return jsonify({
            "error": "Missing required fields",
            "missing_fields": missing_fields
        }), 400
    
    # Extract data
    email = data['email']
    password = data['password']
    
    # Basic type validation
    if not all(isinstance(data[field], str) for field in required_fields):
        return jsonify({"error": "All fields must be strings"}), 400
    
    # Basic email format validation
    if '@' not in email or '.' not in email:
        return jsonify({"error": "Invalid email format"}), 400
    
    # Call AuthService to authenticate the user and get JWT token
    token, message = AuthService.login_user(email=email, password=password)
    
    # Handle the login result
    if token is not None:
        return jsonify({"access_token": token}), 200
    else:
        # Determine appropriate status code based on error message
        status_code = 500 if "Server configuration error" in message or "Error generating token" in message else 401
        return jsonify({"error": message}), status_code 