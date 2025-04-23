"""
Authentication decorators for protecting API routes.
"""
from functools import wraps
from flask import request, jsonify, current_app, g
import jwt
from ..models.user import User, UserRole


def token_required(f):
    """
    A decorator that protects routes by verifying the JWT token in the Authorization header.
    
    The token must be provided in the format: 'Bearer <token>'.
    On successful verification, the authenticated user is stored in g.current_user.
    
    Args:
        f: The route function to be decorated.
        
    Returns:
        decorated_function: The wrapped function that performs token verification.
        
    Raises:
        401 Unauthorized: If the token is missing, invalid, expired, or the user is not found/inactive.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        # Check if Authorization header exists and follows Bearer scheme
        if auth_header:
            try:
                # Extract token from "Bearer <token>"
                token_parts = auth_header.split()
                if len(token_parts) == 2 and token_parts[0].lower() == 'bearer':
                    token = token_parts[1]
            except Exception:
                return jsonify({"error": "Invalid Authorization header format"}), 401
        
        if not token:
            return jsonify({"error": "Authentication token is missing!"}), 401
            
        try:
            # Decode and verify the token
            payload = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=["HS256"]
            )
            
            # Get user from database
            current_user = User.query.get(payload['sub'])
            
            # Verify user exists and is active
            if not current_user or not current_user.is_active:
                return jsonify({"error": "User not found or inactive"}), 401
                
            # Store user in request context
            g.current_user = current_user
            
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token!"}), 401
        except Exception as e:
            return jsonify({"error": "Token processing error"}), 401
            
        return f(*args, **kwargs)
        
    return decorated_function 

def require_role(*allowed_roles):
    """
    A decorator that checks if the authenticated user has one of the specified roles.
    Must be used after @token_required as it relies on g.current_user being set.
    
    Args:
        *allowed_roles: Variable number of UserRole enum members or role names.
        
    Returns:
        decorator: The actual decorator function that wraps the route.
        
    Example:
        @app.route('/admin-only')
        @token_required
        @require_role(UserRole.ADMIN)
        def admin_route():
            return "Admin access granted"
    """
    def _decorator(f):
        @wraps(f)
        def _wrapper(*args, **kwargs):
            # Check if authentication context exists
            if not hasattr(g, 'current_user'):
                return jsonify({
                    "error": "Authentication context not found. Ensure @token_required is applied first"
                }), 500
            
            # Convert allowed_roles to a set of UserRole enum members
            expected_roles = set()
            for role in allowed_roles:
                if isinstance(role, UserRole):
                    expected_roles.add(role)
                elif isinstance(role, str):
                    try:
                        expected_roles.add(UserRole[role.upper()])
                    except KeyError:
                        current_app.logger.warning(f"Invalid role '{role}' specified in @require_role decorator")
                        continue
            
            # Check if user's role is allowed
            if g.current_user.role not in expected_roles:
                return jsonify({
                    "error": "Forbidden: Insufficient permissions"
                }), 403
            
            return f(*args, **kwargs)
        return _wrapper
    return _decorator 