# Project Progress (Backend)

## Completed Features
- User authentication (JWT, password hashing, role-based access)
- Fuel Order CRUD endpoints
- User CRUD endpoints (Admin/CSR, soft delete)
- Fuel Truck CRUD endpoints
- Aircraft CRUD endpoints
- Customer CRUD endpoints
- OpenAPI/Swagger documentation for all endpoints
- Consistent error handling and validation (Marshmallow)
- **New:** Dedicated database seeding script (`src/seeds.py`) and CLI command (`flask seed run`) for PBAC initial data and admin user creation. Script is idempotent and replaces migration-based seeding logic.
- **Update (2025-05-14):** Permission names and role mappings in `src/seeds.py` were corrected to match the finalized PBAC list of 21 permissions. This ensures all seeded data matches the system's authorization model and prevents downstream errors.
- **Fix (2025-05-15):** Persistent CORS preflight (OPTIONS 404) error resolved by removing the manual @app.before_request OPTIONS handler from src/app.py and standardizing all blueprint url_prefix values to omit trailing slashes. Backend now relies solely on Flask-CORS for preflight handling. After this change, restart the backend and clear browser cache before re-testing frontend form submissions.

## Current API Entities & Endpoints
- **Users**: Create, list, retrieve, update, delete (Admin/CSR, soft delete, activation)
- **Fuel Orders**: Full CRUD, status management, CSV export
- **Fuel Trucks**: Full CRUD, truck number uniqueness
- **Aircraft**: Full CRUD, tail number uniqueness
- **Customers**: Full CRUD, name uniqueness
- **Security**: JWT, role-based decorators, active status enforcement
- **Docs**: All endpoints and schemas documented in OpenAPI

## Known Issues
- No pagination on list endpoints
- No search or advanced filtering
- Unit test coverage incomplete
- Some endpoints lack frontend integration

## Backend Refactor: Fuel Order Auto-Assign & Stats (April 26, 2025)

### Completed
- Refactored `FuelOrderService.create_fuel_order` to implement `-1` auto-assign for LSTs:
  - If `assigned_lst_user_id` is `-1`, backend selects least busy active LST (fewest active/in-progress orders).
  - If not `-1`, validates LST exists, is active, and is an LST.
  - Truck assignment logic unchanged.
- Updated `POST /api/fuel-orders` route:
  - Now allows LSTs to create orders (`@require_role` includes LST).
  - Docstring and validation updated to clarify `-1` behavior and type handling.
- Implemented `GET /api/fuel-orders/stats/status-counts` endpoint:
  - Counts orders by status group (pending, in progress, completed) for dashboard.
  - Available to CSR, ADMIN, and LST roles.
  - Registered schema and route in OpenAPI.
- Updated schemas:
  - `FuelOrderCreateRequestSchema` allows `-1` for auto-assign (with docstring/metadata).
  - `OrderStatusCountsResponseSchema` docstring clarified.
  - All schemas registered in `src/schemas/__init__.py`.
- Registered new schemas and paths in `src/app.py` for OpenAPI docs.
- Removed all obsolete code related to global auto-assign toggle and LST queue API (no longer relevant).
- **As of April 26, 2025:** `src/routes/admin/assignment_settings_routes.py` is now a pure deprecation stub (comment only, no Blueprint or routes). This fixes all NameError and lint errors from that file and confirms the global auto-assign admin API is fully removed.

### New API Behavior
- To auto-assign an LST, send `assigned_lst_user_id: -1` in POST payload.
- All roles (CSR, ADMIN, LST) can create fuel orders and view status counts.
- API docs and schemas up-to-date with new logic.

### Next Steps
- Add pagination and search to list endpoints
- Complete unit/integration test coverage
- Integrate all endpoints with frontend
- Review and improve error messages
- Document any new endpoints or changes in OpenAPI
3. Reporting features

## PBAC Overhaul (Phase 1)
### Step 4 Complete (2025-05-01):
- Alembic migration script for PBAC now seeds the permissions table with the finalized list of 21 permissions (bulk_insert in upgrade, targeted delete in downgrade).
- This ensures all system permissions are present for subsequent role/assignment steps.
- Migration script reviewed for correctness and reversibility.

### Step 5 Complete (2025-05-02):
- Alembic migration script now seeds the default roles (System Administrator, Customer Service Representative, Line Service Technician) and assigns the correct permissions to each via the role_permissions table.
- This ensures all baseline roles and permissions are present for user migration in the next step.
- Migration script reviewed for correctness, reversibility, and data integrity.

### Step 6 Complete (2025-05-03):
- Alembic migration script now migrates all existing users to the new default roles based on their previous role assignment.
- Reads old users.role value before column is dropped, maps to new role name, and inserts into user_roles association table.
- Ensures all users retain correct access after PBAC migration.
- Downgrade deletes all user_roles links before dropping table.
- Migration script reviewed for correctness, reversibility, and data integrity.

### Step 7 Complete (2025-05-04):
- Alembic migration script applied successfully using `flask db upgrade`.
- All schema changes (permissions, roles, role_permissions, user_roles tables) and data seeding/migration logic executed without error.
- Users migrated to new user_roles table, old users.role column removed.
- Migration ordering and session/table definition issues encountered and resolved (see error documentation).
- **PBAC Phase 1 is now complete.**

### Next Steps
- Assign seeded permissions to default roles in a follow-up migration or script.
- Update service and route logic to use new PBAC schema.
- Continue with PBAC Phase 2 as planned.

## PBAC Overhaul (Phase 2)
### Step 8 Complete (2025-05-05):
- Implemented User.has_permission(permission_name) method in src/models/user.py.
- This method checks if a user has a specific permission by iterating through their roles and checking each role's permissions efficiently using SQLAlchemy's filter_by.
- Ready for use by the new authorization decorator (to be implemented in Step 9).

### Step 9 Complete (2025-05-06):
- Implemented @require_permission(permission_name) decorator in src/utils/decorators.py.
- Decorator checks g.current_user.has_permission(permission_name) and returns 403/500 as appropriate.
- Old @require_role decorator removed.
- Ready for use in route protection for all endpoints requiring granular permission checks.
- Next: Refactor routes to use @require_permission and update tests accordingly.

### Step 10 Complete (2025-05-07):
- All route handlers now use @require_permission with correct permission names, all redundant role checks removed, and docstrings updated.
- Backend authorization logic overhaul is complete.
- API docs may need APIDog update if docstrings changed significantly.

## PBAC Overhaul (Phase 3)
### Step 11 Complete (2025-05-08):
- Implemented complete business logic for all static methods in `RoleService` class (`src/services/role_service.py`).
- Methods implemented:
  - `get_all_roles`: Retrieves all roles ordered by name
  - `create_role`: Creates new role with name validation
  - `get_role_by_id`: Retrieves role by ID
  - `update_role`: Updates role with name uniqueness check
  - `delete_role`: Deletes role with user assignment check
  - `get_role_permissions`: Gets permissions for a role
  - `assign_permission_to_role`: Assigns permission to role
  - `remove_permission_from_role`: Removes permission from role
- All methods include proper error handling, input validation, and database transaction management
- Return tuples follow consistent pattern: (result, message, status_code)
- Ready for integration with admin routes in next step

### Step 12 Complete (2025-05-09):
- Implemented `get_all_permissions` static method in `PermissionService` class.
- Method retrieves all permissions ordered by name.
- Includes proper error handling with SQLAlchemy exception catching and session rollback.
- Follows consistent return pattern (data/None, message, status_code).
- Ready for integration with admin routes.

### Step 13 Complete (2025-05-10):
- Implemented complete RESTful API endpoints in `src/routes/admin/role_admin_routes.py` for managing Roles and their Permissions.
- All endpoints secured with `@require_permission('MANAGE_ROLES')`.
- Uses proper request validation and response serialization via Marshmallow schemas.
- Fully documented with OpenAPI specifications.
- Routes connected to `RoleService` methods and follow the consistent error handling pattern.

### Step 14 Complete (2025-05-11):
- Implemented Flask route handler in `src/routes/admin/permission_admin_routes.py` for listing all available system Permissions.
- Created `PermissionListResponseSchema` for consistent response serialization.
- Endpoint secured with `@require_permission('VIEW_PERMISSIONS')`.
- Connected to `PermissionService.get_all_permissions()` method.
- Added OpenAPI documentation and registered blueprint/schemas in `src/app.py`.
- Ready for frontend integration via APIDog swagger.json import.

### Step 15 Complete (2025-05-12):
- Refactored `UserService` class to handle many-to-many relationship between Users and Roles.
- Updated all methods to work with `role_ids` list instead of single `role` enum:
  - `create_user`: Now accepts and validates list of role IDs, fetches Role objects, and assigns them to user.
  - `update_user`: Handles role_ids updates, including empty list for removing all roles.
  - `get_users`: Uses eager loading (selectinload) for roles, supports filtering by role IDs.
  - `get_user_by_id`: Uses eager loading for roles to prevent N+1 queries.
- Added proper validation for role IDs existence and format.
- Improved error messages for invalid role assignments.
- Removed all references to old UserRole enum.
- Uses SQLAlchemy relationship features correctly for many-to-many associations.

### Step 16 Complete (2025-05-13):
- Implemented complete Admin User Management API route handlers in `src/routes/admin/user_admin_routes.py`.
- Created/updated user schemas in `src/schemas/user_schemas.py`:
  - Added `RoleBriefSchema` for role information in responses
  - Updated `UserCreateRequestSchema` and `UserUpdateRequestSchema` to use `role_ids` list
  - Added `UserBriefSchema` and `UserDetailSchema` for responses
  - Updated `UserListResponseSchema` to use `UserBriefSchema`
- Implemented all required endpoints with proper permission decorators:
  - `GET /api/admin/users/` - List users (`@require_permission('VIEW_USERS')`)
  - `POST /api/admin/users/` - Create user (`@require_permission('MANAGE_USERS')`)
  - `GET /api/admin/users/<id>` - Get user details (`@require_permission('VIEW_USERS')`)
  - `PATCH /api/admin/users/<id>` - Update user (`@require_permission('MANAGE_USERS')`)
  - `DELETE /api/admin/users/<id>` - Delete user (`@require_permission('MANAGE_USERS')`)
- Updated `src/app.py` to:
  - Register `user_admin_bp` blueprint with URL prefix `/api/admin/users`
  - Register all user admin schemas with apispec
  - Register all user admin views with apispec for documentation
- All endpoints properly documented with OpenAPI specifications
- Ready for frontend integration via APIDog swagger.json import

## Recent Changes
2. Implemented Admin CRUD API endpoints for Aircraft and Customers:
   - Created `src/routes/admin/aircraft_admin_routes.py` and `src/routes/admin/customer_admin_routes.py` for all admin CRUD operations (GET, POST, PATCH, DELETE).
   - Added/verified service logic in `src/services/aircraft_service.py` and `src/services/customer_service.py` (including error handling, foreign key checks, and correct PK usage).
   - Created `src/schemas/admin_schemas.py` with Marshmallow schemas for admin Aircraft and Customer operations.
   - Registered new blueprints and schemas in `src/app.py` and updated OpenAPI documentation (apispec docstrings and schema registration).
   - All endpoints secured with Admin role and JWT, with consistent error handling and OpenAPI compliance.

1. Updated user_routes.py:
   - Implemented get_users endpoint
   - Added filter parameter handling
   - Added response serialization
   - Updated API documentation

## Validation Status
- ✅ API documentation complete
- ✅ Security measures implemented
- ⏳ Test coverage pending
- ⏳ Frontend integration pending

---

### PBAC Seeding Workflow (2025-05-14)
- After a database reset, run `flask seed run` to populate permissions, roles, role-permission assignments, and a default admin user.
- The seeding script is idempotent and can be safely re-run.
- This replaces the previous migration-based seeding logic for PBAC initial data.
- **Update (2025-05-14):** Permission names and role mappings in `src/seeds.py` were corrected to match the finalized PBAC list of 21 permissions. This ensures all seeded data matches the system's authorization model and prevents downstream errors.