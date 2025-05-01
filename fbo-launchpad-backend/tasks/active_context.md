# Active Backend Context

## Current Focus
- Backend CRUD API endpoints for Users, Fuel Trucks, Aircraft, Customers
- Permission-based access control (PBAC) schema implemented (Permission, Role, role_permissions, user_roles, User.roles)
- Static role columns/enums removed from User model
- Marshmallow validation and serialization
- Consistent error handling and OpenAPI documentation

## Entities & Endpoints
- **Users**: Full CRUD, soft delete, activation, role enforcement
- **Fuel Trucks**: Full CRUD, truck number uniqueness
- **Aircraft**: Full CRUD, tail number uniqueness
- **Customers**: Full CRUD, name uniqueness
- **Security**: JWT, decorators for role and active status
- **Docs**: OpenAPI docs for all endpoints

## Security & Validation Patterns
- All CUD operations require Admin role
- JWT required for all endpoints
- Input validated with Marshmallow schemas
- Consistent error/message response structure
- Sensitive fields excluded from responses

## Known Issues
- No pagination or search on list endpoints
- Unit test coverage incomplete
- Some endpoints missing frontend integration

## Status Update
- Admin CRUD API endpoints for Aircraft and Customers are now implemented, documented, and available for frontend integration/testing.
- PBAC migration script updated: Permission, Role, user_roles, role_permissions tables created, User.role column removed. **Permissions table is now seeded with 21 finalized permissions via bulk_insert in upgrade; downgrade removes these records before dropping the table.** Migration script inspected and verified for correctness (upgrade/downgrade, data seeding).
- **Step 5 complete:** Migration now also seeds default roles (System Administrator, Customer Service Representative, Line Service Technician) and assigns the correct permissions to each via the role_permissions table. This ensures baseline access for user migration in the next step. Migration script reviewed for correctness and reversibility.
- **Step 6 complete:** Migration script now migrates all existing users to the new default roles based on their previous role assignment. Old users.role values are mapped to new role names and inserted into user_roles. Downgrade deletes all user_roles links before dropping the table. This preserves user access during PBAC transition.
- **Step 7 complete (2025-05-04):** Alembic migration script applied successfully using `flask db upgrade`. All schema changes (permissions, roles, role_permissions, user_roles tables) and data seeding/migration logic executed without error. Users migrated to new user_roles table, old users.role column removed. Migration ordering and session/table definition issues encountered and resolved (see error documentation). **PBAC Phase 1 is now complete.**
- **Step 8 complete (2025-05-05):** User.has_permission(permission_name) method implemented in src/models/user.py. This enables efficient permission checks for users based on their roles and is ready for use in new authorization logic (decorators, etc.).
- **Step 9 complete (2025-05-06):** @require_permission(permission_name) decorator implemented in src/utils/decorators.py, replacing @require_role. Decorator uses g.current_user.has_permission(permission_name) and returns 403/500 as appropriate. Old @require_role removed. Next: Refactor routes to use new decorator and update tests.
- PBAC Phase 2 Step 10 complete: All route handlers now use @require_permission with correct permission names, all redundant role checks removed, and docstrings updated. Backend authorization logic overhaul is complete. API docs may need APIDog update if docstrings changed significantly.
- **Step 11 complete (2025-05-08):** Implemented complete business logic for `RoleService` class with all required static methods for managing roles and their permissions. Service includes comprehensive error handling, input validation, and proper database transaction management. All methods follow consistent return pattern and are ready for integration with admin routes.
- **Step 12 complete (2025-05-09):** Implemented `get_all_permissions` static method in `PermissionService` class. Method retrieves all permissions ordered by name, includes proper error handling with SQLAlchemy exception catching and session rollback, and follows the consistent return pattern (data/None, message, status_code). Ready for integration with admin routes.
- **Step 13 complete (2025-05-10):** Implemented complete RESTful API endpoints in `src/routes/admin/role_admin_routes.py` for managing Roles and their Permissions. All endpoints are secured with `@require_permission('MANAGE_ROLES')`, use proper request validation and response serialization via Marshmallow schemas, and are fully documented with OpenAPI specifications. The routes are connected to the `RoleService` methods and follow the consistent error handling pattern.
- **Step 14 complete (2025-05-11):** Implemented Flask route handler in `src/routes/admin/permission_admin_routes.py` for listing all available system Permissions. Created `PermissionListResponseSchema` for consistent response serialization, secured endpoint with `@require_permission('VIEW_PERMISSIONS')`, connected to `PermissionService.get_all_permissions()` method, and added OpenAPI documentation. Ready for frontend integration via APIDog swagger.json import.
- **Step 15 complete (2025-05-12):** Refactored `UserService` class to fully support PBAC's many-to-many relationship between Users and Roles. All methods (`create_user`, `update_user`, `get_users`, `get_user_by_id`) now handle role_ids lists, validate role existence, and use SQLAlchemy's eager loading to prevent N+1 queries. The old UserRole enum has been completely removed, and proper error messages are in place for invalid role assignments. This completes the service-layer updates for PBAC Phase 3.
- **Step 16 complete (2025-05-13):** Implemented complete Admin User Management API route handlers in `src/routes/admin/user_admin_routes.py`. Created/updated user schemas to handle role_ids list and proper response serialization. All endpoints (`GET /`, `POST /`, `GET /<id>`, `PATCH /<id>`, `DELETE /<id>`) are secured with appropriate permissions (`VIEW_USERS` or `MANAGE_USERS`). Blueprint registered in `src/app.py` with proper URL prefix and OpenAPI documentation. Ready for frontend integration via APIDog swagger.json import.

## Next Steps
- Add pagination/search to list endpoints
- Write/complete unit and integration tests
- Integrate endpoints with frontend
- Improve error messages and documentation
- Update service and route logic to use new PBAC schema

## [2024-05-01] Refactor: LSTs can now create orders; POST /api/fuel-orders supports -1 for auto-assigning least busy LST; new GET /api/fuel-orders/stats/status-counts endpoint for dashboard; removed obsolete queue/global assign logic.