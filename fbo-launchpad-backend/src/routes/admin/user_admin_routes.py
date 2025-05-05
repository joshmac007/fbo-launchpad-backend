from flask import request, jsonify
from ...services.user_service import UserService
from src.utils.decorators import token_required, require_permission
from ...models.user import UserRole
from ...schemas.user_schemas import (
    UserCreateRequestSchema,
    UserUpdateRequestSchema,
    UserDetailSchema,
    UserListResponseSchema,
    UserBriefSchema,
    RoleBriefSchema
)
from ...schemas import ErrorResponseSchema
from src.extensions import apispec
from .routes import admin_bp

@admin_bp.route('/users', methods=['GET'])
@token_required
@require_permission('MANAGE_USERS')
def get_users():
    """
    ---
    get:
      summary: List all users (admin, MANAGE_USERS permission required)
      tags:
        - Admin - Users
      responses:
        200:
          description: List of users
          content:
            application/json:
              schema: UserListResponseSchema
        401:
          description: Unauthorized
        403:
          description: Forbidden (missing permission)
    """
    users, msg, status = UserService.get_all_users(request.args)
    schema = UserDetailSchema(many=True)
    return jsonify({"users": schema.dump(users)}), status

@admin_bp.route('/users', methods=['POST'])
@token_required
@require_permission('MANAGE_USERS')
def create_user():
    """
    ---
    post:
      summary: Create a new user (admin, MANAGE_USERS permission required)
      tags:
        - Admin - Users
      requestBody:
        required: true
        content:
          application/json:
            schema: UserCreateRequestSchema
      responses:
        201:
          description: User created
          content:
            application/json:
              schema: UserDetailSchema
        400:
          description: Bad request
        409:
          description: Conflict
    """
    data = request.get_json()
    user, msg, status = UserService.create_user(data)
    if not user:
        return jsonify({"error": msg}), status
    schema = UserDetailSchema()
    return jsonify(schema.dump(user)), status

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@token_required
@require_permission('MANAGE_USERS')
def get_user(user_id):
    """
    ---
    get:
      summary: Get a user by ID (admin, MANAGE_USERS permission required)
      tags:
        - Admin - Users
      parameters:
        - in: path
          name: user_id
          schema:
            type: integer
          required: true
      responses:
        200:
          description: User details
          content:
            application/json:
              schema: UserDetailSchema
        404:
          description: Not found
    """
    user, msg, status = UserService.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": msg}), status
    schema = UserDetailSchema()
    return jsonify(schema.dump(user)), status

@admin_bp.route('/users/<int:user_id>', methods=['PATCH'])
@token_required
@require_permission('MANAGE_USERS')
def update_user(user_id):
    """
    ---
    patch:
      summary: Update a user by ID (admin, MANAGE_USERS permission required)
      tags:
        - Admin - Users
      parameters:
        - in: path
          name: user_id
          schema:
            type: integer
          required: true
      requestBody:
        required: true
        content:
          application/json:
            schema: UserUpdateRequestSchema
      responses:
        200:
          description: User updated
          content:
            application/json:
              schema: UserDetailSchema
        400:
          description: Bad request
        404:
          description: Not found
    """
    data = request.get_json()
    user, msg, status = UserService.update_user(user_id, data)
    if not user:
        return jsonify({"error": msg}), status
    schema = UserDetailSchema()
    return jsonify(schema.dump(user)), status

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
@require_permission('MANAGE_USERS')
def delete_user(user_id):
    """
    ---
    delete:
      summary: Delete a user by ID (admin, MANAGE_USERS permission required)
      tags:
        - Admin - Users
      parameters:
        - in: path
          name: user_id
          schema:
            type: integer
          required: true
      responses:
        204:
          description: User deleted
        404:
          description: Not found
        409:
          description: Conflict (user has associated records)
    """
    deleted, msg, status = UserService.delete_user(user_id)
    if not deleted:
        return jsonify({"error": msg}), status
    return '', 204 