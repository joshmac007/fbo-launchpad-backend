from typing import Tuple, List, Optional, Dict, Any, Set

from ..models.user import User
from ..models.role import Role
from ..extensions import db


class UserService:
    """Service class for managing user-related operations."""

    @classmethod
    def get_users(cls, filters: Optional[Dict[str, Any]] = None) -> Tuple[Optional[List[User]], str, int]:
        """Retrieve users based on specified filters.

        Args:
            filters (Optional[Dict[str, Any]]): Optional dictionary of filter parameters.
                Supported filters:
                - role_ids (List[int]): Filter by role IDs
                - is_active (bool): Filter by user active status

        Returns:
            Tuple[Optional[List[User]], str, int]: A tuple containing:
                - List of User objects if successful, None if error
                - Message describing the result
                - HTTP status code
        """
        try:
            # Initialize base query with eager loading of roles
            query = User.query.options(db.selectinload(User.roles))

            if filters:
                # Filter by role IDs
                role_ids = filters.get('role_ids')
                if role_ids:
                    if not isinstance(role_ids, list):
                        return None, "Invalid role_ids format, must be a list", 400
                    # Join with roles and filter where role.id is in the provided list
                    query = query.join(User.roles).filter(Role.id.in_(role_ids))

                # Filter by active status
                is_active_filter = filters.get('is_active')
                if is_active_filter is not None:
                    is_active_bool = str(is_active_filter).lower() == 'true'
                    query = query.filter(User.is_active == is_active_bool)

            # Default sort by username ascending
            users = query.order_by(User.username.asc()).all()
            return users, "Users retrieved successfully", 200

        except Exception as e:
            # Log the error here if you have a logger configured
            return None, f"Database error while retrieving users: {str(e)}", 500

    @classmethod
    def create_user(cls, data: Dict[str, Any]) -> Tuple[Optional[User], str, int]:
        """Create a new user.
        
        Args:
            data (Dict[str, Any]): Dictionary containing user data
                Required keys:
                - email (str): User's email address
                - password (str): User's password
                - role_ids (List[int]): List of role IDs to assign
                Optional keys:
                - name (str): User's name
                - is_active (bool): Whether user should be active (defaults to True)
                
        Returns:
            Tuple[Optional[User], str, int]: A tuple containing:
                - Created User object if successful, None if error
                - Message describing the result
                - HTTP status code
        """
        try:
            # Validate required fields
            if not all(key in data for key in ['email', 'password', 'role_ids']):
                return None, "Missing required fields: email, password, and role_ids are required", 400

            # Validate role_ids format
            role_ids = data['role_ids']
            if not isinstance(role_ids, list):
                return None, "Invalid role_ids format, must be a list", 400

            if not role_ids:  # Empty list check
                return None, "At least one role must be assigned", 400

            # Check if email already exists
            if User.query.filter_by(email=data['email']).first():
                return None, "Email already registered", 409

            # Fetch and validate roles
            roles = Role.query.filter(Role.id.in_(role_ids)).all()
            if len(roles) != len(set(role_ids)):
                found_ids = {role.id for role in roles}
                invalid_ids = set(role_ids) - found_ids
                return None, f"Invalid role IDs provided: {list(invalid_ids)}", 400

            # Create new user
            user = User(
                email=data['email'],
                username=data.get('name', data['email'].split('@')[0]),  # Default to email username
                is_active=data.get('is_active', True)  # Default to active
            )
            user.set_password(data['password'])
            user.roles = roles  # Assign roles

            db.session.add(user)
            db.session.commit()

            return user, "User created successfully", 201

        except Exception as e:
            db.session.rollback()
            return None, f"Error creating user: {str(e)}", 500

    @classmethod
    def update_user(cls, user_id: int, data: Dict[str, Any]) -> Tuple[Optional[User], str, int]:
        """Update an existing user.
        
        Args:
            user_id (int): ID of user to update
            data (Dict[str, Any]): Dictionary containing update data
                Supported keys:
                - name (str): User's name
                - role_ids (List[int]): List of role IDs to assign
                - is_active (bool): User's active status
                - password (str): User's new password (optional)
                
        Returns:
            Tuple[Optional[User], str, int]: A tuple containing:
                - Updated User object if successful, None if error
                - Message describing the result
                - HTTP status code
        """
        try:
            user = User.query.options(db.selectinload(User.roles)).get(user_id)
            if not user:
                return None, f"User with ID {user_id} not found", 404

            # Update fields if provided
            if 'name' in data:
                user.username = data['name']

            if 'role_ids' in data:
                role_ids = data['role_ids']
                if not isinstance(role_ids, list):
                    return None, "Invalid role_ids format, must be a list", 400

                if role_ids:  # If list is not empty
                    # Fetch and validate roles
                    roles = Role.query.filter(Role.id.in_(role_ids)).all()
                    if len(roles) != len(set(role_ids)):
                        found_ids = {role.id for role in roles}
                        invalid_ids = set(role_ids) - found_ids
                        return None, f"Invalid role IDs provided: {list(invalid_ids)}", 400
                    user.roles = roles
                else:
                    user.roles = []  # Clear all roles if empty list provided

            if 'is_active' in data:
                user.is_active = bool(data['is_active'])

            if 'password' in data:
                user.set_password(data['password'])

            db.session.commit()
            return user, "User updated successfully", 200

        except Exception as e:
            db.session.rollback()
            return None, f"Error updating user: {str(e)}", 500

    @classmethod
    def delete_user(cls, user_id: int) -> Tuple[bool, str, int]:
        """Soft delete a user by setting is_active to False.
        
        Args:
            user_id (int): ID of user to delete
            
        Returns:
            Tuple[bool, str, int]: A tuple containing:
                - True if successful, False if error
                - Message describing the result
                - HTTP status code
        """
        try:
            user = User.query.get(user_id)
            if not user:
                return False, f"User with ID {user_id} not found", 404

            user.is_active = False
            db.session.commit()
            return True, "User deactivated successfully", 200

        except Exception as e:
            db.session.rollback()
            return False, f"Error deactivating user: {str(e)}", 500

    @classmethod
    def get_user_by_id(cls, user_id: int) -> Tuple[Optional[User], str, int]:
        """Get a user by ID.
        
        Args:
            user_id (int): ID of user to retrieve
            
        Returns:
            Tuple[Optional[User], str, int]: A tuple containing:
                - User object if found, None if not found
                - Message describing the result
                - HTTP status code
        """
        try:
            user = User.query.options(db.selectinload(User.roles)).get(user_id)
            if not user:
                return None, f"User with ID {user_id} not found", 404
            return user, "User retrieved successfully", 200

        except Exception as e:
            return None, f"Error retrieving user: {str(e)}", 500 