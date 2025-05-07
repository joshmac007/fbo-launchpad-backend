from flask import request, jsonify, current_app
from ...services.user_service import UserService
from src.utils.decorators import token_required, require_permission
from ...schemas.user_schemas import UserDetailSchema
from .routes import admin_bp

# --- DIAGNOSTIC SIMPLIFICATION: All other routes temporarily commented out to isolate 404 error ---
# from ...models.user import UserRole
# from ...schemas.user_schemas import (
#     UserCreateRequestSchema,
#     UserUpdateRequestSchema,
#     UserListResponseSchema,
#     UserBriefSchema,
#     RoleBriefSchema
# )
# from ...schemas import ErrorResponseSchema
# from src.extensions import apispec

@admin_bp.route('users', methods=['GET', 'OPTIONS'])
@admin_bp.route('/users', methods=['GET', 'OPTIONS'])
@token_required
@require_permission('MANAGE_USERS')
def get_users():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OPTIONS request successful'}), 200
    current_app.logger.info("--- Attempting to serve GET /api/admin/users/ via get_users ---")
    users, msg, status = UserService.get_all_users(request.args)
    if status == 200:
        schema = UserDetailSchema(many=True)
        return jsonify({"users": schema.dump(users), "message": msg}), status
    else:
        return jsonify({"error": msg}), status

# @admin_bp.route('/users', methods=['POST'])
# @token_required
# @require_permission('MANAGE_USERS')
# def create_user():
#     ...
#
# @admin_bp.route('/users/<int:user_id>', methods=['GET'])
# @token_required
# @require_permission('MANAGE_USERS')
# def get_user(user_id):
#     ...
#
# @admin_bp.route('/users/<int:user_id>', methods=['PATCH'])
# @token_required
# @require_permission('MANAGE_USERS')
# def update_user(user_id):
#     ...
#
# @admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
# @token_required
# @require_permission('MANAGE_USERS')
# def delete_user(user_id):
#     ... 