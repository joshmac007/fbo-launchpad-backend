from ..models.user import User
from ..app import db
from datetime import datetime, timedelta
import jwt
from flask import current_app

class AuthService:
    @classmethod
    def register_user(cls, name: str, email: str, password: str) -> tuple[User | None, str]:
        """
        Register a new user if the email is not already taken.
        
        Args:
            name (str): The user's full name
            email (str): The user's email address
            password (str): The user's password (will be hashed before storage)
            
        Returns:
            tuple: (user, message)
                - If successful: (User object, success_message)
                - If email exists or error: (None, error_message)
        """
        # Check if user already exists with this email
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return None, "Email already registered"
            
        # Create new user instance
        new_user = User(
            name=name,
            email=email
        )
        
        # Set password (will be automatically hashed by the User model)
        new_user.password = password
        
        # Add user to database and commit transaction
        try:
            db.session.add(new_user)
            db.session.commit()
            return new_user, "User registered successfully"
        except Exception as e:
            db.session.rollback()
            # In a production environment, you would want to log the error here
            return None, f"Database error: {str(e)}"

    @classmethod
    def login_user(cls, email: str, password: str) -> tuple[str | None, str]:
        """
        Authenticate a user with their email and password.
        
        Args:
            email (str): The user's email address
            password (str): The user's password
            
        Returns:
            tuple: (token, message)
                - If successful: (JWT token string, success_message)
                - If invalid credentials or error: (None, error_message)
        """
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        # Check if user exists and password is correct
        if not user or not user.check_password(password):
            return None, "Invalid email or password"
            
        # Check if user account is active
        if not user.is_active:
            return None, "User account is inactive"
            
        # Get the secret key from app config
        secret_key = current_app.config.get('SECRET_KEY')
        if not secret_key:
            return None, "Server configuration error: Secret key missing"
            
        try:
            # Create JWT payload
            payload = {
                'sub': user.id,
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(hours=1),
                'role': user.role.value if hasattr(user, 'role') else None
            }
            
            # Generate JWT token
            token = jwt.encode(payload, secret_key, algorithm="HS256")
            return token, "Login successful"
            
        except Exception as e:
            # In a production environment, you would want to log the error here
            return None, f"Error generating token: {str(e)}" 