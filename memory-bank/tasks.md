  # Task: User Management System Update: Implement Edit and Delete Functionality

  ## Description
  Enhance the Admin User Management system to allow administrators (with appropriate permissions) to edit existing user details (like name, email, active status, roles) and delete users. Decide and implement a user deletion strategy (soft vs. hard delete).

  ## Complexity
  Level: 3
  Type: Feature

  ## Technology Stack
  - Backend: Python, Flask, SQLAlchemy, Flask-Migrate, Marshmallow, Flask-JWT-Extended
  - Frontend: JavaScript, React, Vite, Material UI (MUI)
  - Database: PostgreSQL
  - API Style: RESTful

  ## Technology Validation Checkpoints
  *(To be completed after planning, potentially in VAN QA mode)*
  - [ ] Project initialization command verified
  - [ ] Required dependencies identified and installed
  - [ ] Build configuration validated
  - [ ] Hello world verification completed
  - [ ] Test build passes successfully

  ## Status
  - [x] Initialization complete (VAN Mode)
  - [ ] Planning complete
  - [ ] Technology validation complete
  - [ ] Backend Implementation
  - [ ] Frontend Implementation
  - [ ] Testing
  - [ ] Documentation

  ## Implementation Plan

  **Phase 1: Backend Implementation (Edit & Delete Logic)**

  1.  **Decision: Soft vs. Hard Delete**
      *   Analyze implications of hard delete (data loss, audit trails) vs. soft delete (data retention, complexity).
      *   **Decision:** Implement **soft delete** by default (using the existing `is_active` flag or adding a dedicated `is_deleted` flag) for data integrity and potential recovery. Add a mechanism for eventual hard deletion if needed (e.g., a separate cleanup process or admin action). For now, focus on soft delete via `is_active`. Deactivating a user will serve as the soft delete mechanism.
  2.  **Database Model (`src/models/user.py`)**
      *   Verify `is_active` flag exists and is suitable for soft delete. (Seems it is already used based on `tasks.md`). No changes likely needed here unless a dedicated flag is preferred. Let's stick with `is_active` for now.
  3.  **User Service (`src/services/user_service.py`)**
      *   Implement `update_user` method:
          *   Modify existing `update_user` to handle updates to all editable fields (name, email, `is_active`, roles). Ensure email uniqueness is checked correctly during updates (ignore self). Password changes should likely be handled separately for security (e.g., requiring current password, separate endpoint). Assume password change is out of scope for *this* task unless specified otherwise.
      *   Implement `delete_user` method:
          *   Implement logic to soft-delete a user (set `is_active = False`).
          *   Prevent self-deletion (admin cannot deactivate their own account via this method).
          *   Consider potential dependencies (e.g., assigned fuel orders - decide if deactivation should be prevented or handled). For now, allow deactivation regardless of assignments.
  4.  **Schemas (`src/schemas/user_schemas.py`)**
      *   Review `UserUpdateRequestSchema`: Ensure it includes all fields intended to be editable (name, email, `is_active`, `role_ids`).
      *   No new schemas needed for delete if using existing `is_active` flag via the update endpoint. If a dedicated DELETE endpoint is added, a simple response schema might be needed.
  5.  **API Routes (`src/routes/admin/user_admin_routes.py`)**
      *   Verify `PATCH /api/admin/users/<id>`: Ensure it correctly uses `UserService.update_user` and handles the updated schema. Seems this already exists (Step 16 in `tasks.md`). Double-check its implementation details.
      *   Verify `DELETE /api/admin/users/<id>`: Ensure it correctly uses `UserService.delete_user` (likely setting `is_active=False`). Seems this also exists (Step 16). Double-check its implementation.
      *   Ensure both endpoints are protected by the correct permission (`MANAGE_USERS`).
  6.  **Testing (Backend)**
      *   Add unit tests for `UserService.update_user` (various fields, email conflict, role changes, activation/deactivation).
      *   Add unit tests for `UserService.delete_user` (soft delete logic, self-delete prevention).
      *   Add integration tests for the PATCH and DELETE API endpoints.

  **Phase 2: Frontend Implementation (UI for Edit & Delete)**

  1.  **User Service (`src/services/UserService.js`)**
      *   Implement `updateUser(userId, userData)` function to call the `PATCH /api/admin/users/<id>` endpoint.
      *   Implement `deleteUser(userId)` function to call the `DELETE /api/admin/users/<id>` endpoint (or the PATCH endpoint if deactivation is done via update).
  2.  **User Management Page (`src/pages/admin/UserManagementPage.jsx`)**
      *   Add "Edit" button/icon to each row in the user table (likely `UserTable.jsx`).
      *   Add "Deactivate/Activate" button/icon (representing soft delete) to each row. Consider changing the label based on current `is_active` status.
      *   Implement logic to open a modal or navigate to a form for editing when "Edit" is clicked.
      *   Implement logic to call `deleteUser` service function when "Deactivate/Activate" is clicked, likely with a confirmation dialog.
      *   Update the user list after successful edit or delete/deactivation.
  3.  **User Form (`src/components/admin/UserForm.jsx`)**
      *   Modify the existing form (currently used for creation?) to support editing.
      *   Pre-populate the form with the selected user's data when editing.
      *   Handle form submission by calling the `updateUser` service function.
      *   Ensure Role selection component handles existing roles correctly.
  4.  **State Management / Context (`src/contexts/AuthContext.tsx` or page state)**
      *   Ensure user list state is updated correctly after edits/deletions.
      *   Check if changes to the logged-in user's own data (if allowed, though maybe restricted) require updating the AuthContext. Restricting self-edit of critical fields like roles/active status via this UI might be prudent.
  5.  **Testing (Frontend)**
      *   Add component tests for `UserForm.jsx` in edit mode.
      *   Add tests for the edit and delete/deactivate buttons/interactions in `UserManagementPage.jsx` or `UserTable.jsx`.
      *   Perform end-to-end tests for the user edit and delete/deactivate flows.

  **Phase 3: Documentation & Finalization**

  1.  **API Documentation**
      *   Ensure OpenAPI/Swagger documentation for the PATCH and DELETE user endpoints accurately reflects request/response schemas and behavior.
  2.  **User Documentation**
      *   Update any admin user guides explaining how to edit and deactivate/activate users.
  3.  **Code Review & Merge**

  ## Creative Phases Required
  - [ ] **UI/UX Design**: Potentially minor. Requires designing the user experience for editing (modal vs. separate page?) and deleting/deactivating (button placement, confirmation dialogs). Low complexity creative phase needed.

  ## Dependencies
  - Existing PBAC implementation (permissions `VIEW_USERS`, `MANAGE_USERS`).
  - Existing User model, service, routes, and schemas.
  - Frontend React components for Admin section.

  ## Challenges & Mitigations
  - **Challenge**: Deciding soft vs. hard delete strategy.
      - **Mitigation**: Decided on soft delete using `is_active` flag for data integrity.
  - **Challenge**: Preventing admins from locking themselves out (deactivating self, removing own MANAGE_USERS role).
      - **Mitigation**: Add specific checks in `UserService` to prevent self-deactivation and potentially restrict role changes for the current user. Frontend UI should also prevent these actions.
  - **Challenge**: Handling concurrent edits (less likely in admin scenario but possible).
      - **Mitigation**: Use optimistic locking (e.g., version counter) if needed, but likely overkill for initial implementation. Rely on last-write-wins for now.
  - **Challenge**: Ensuring frontend state updates correctly after mutations.
      - **Mitigation**: Use standard state management practices (e.g., re-fetching list after update/delete, or updating local state carefully).
  - **Challenge**: Existing `PATCH` and `DELETE` endpoints (from PBAC Phase 3, Step 16) might already implement some/all functionality. Need to verify their exact behavior.
      - **Mitigation**: Before implementing, thoroughly review the code for `src/routes/admin/user_admin_routes.py`, `src/services/user_service.py` (specifically `update_user` and any delete logic), and `src/schemas/user_schemas.py`. Adjust the plan based on existing code.
  # Task: User Management System Update: Implement Edit and Delete Functionality

  ## Description
  Enhance the Admin User Management system to allow administrators (with appropriate permissions) to edit existing user details (like name, email, active status, roles) and delete users. Decide and implement a user deletion strategy (soft vs. hard delete).

  ## Complexity
  Level: 3
  Type: Feature

  ## Technology Stack
  - Backend: Python, Flask, SQLAlchemy, Flask-Migrate, Marshmallow, Flask-JWT-Extended
  - Frontend: JavaScript, React, Vite, Material UI (MUI)
  - Database: PostgreSQL
  - API Style: RESTful

  ## Technology Validation Checkpoints
  *(To be completed after planning, potentially in VAN QA mode)*
  - [ ] Project initialization command verified
  - [ ] Required dependencies identified and installed
  - [ ] Build configuration validated
  - [ ] Hello world verification completed
  - [ ] Test build passes successfully

  ## Status
  - [x] Initialization complete (VAN Mode)
  - [ ] Planning complete
  - [ ] Technology validation complete
  - [ ] Backend Implementation
  - [ ] Frontend Implementation
  - [ ] Testing
  - [ ] Documentation

  ## Implementation Plan

  **Phase 1: Backend Implementation (Edit & Delete Logic)**

  1.  **Decision: Soft vs. Hard Delete**
      *   Analyze implications of hard delete (data loss, audit trails) vs. soft delete (data retention, complexity).
      *   **Decision:** Implement **soft delete** by default (using the existing `is_active` flag or adding a dedicated `is_deleted` flag) for data integrity and potential recovery. Add a mechanism for eventual hard deletion if needed (e.g., a separate cleanup process or admin action). For now, focus on soft delete via `is_active`. Deactivating a user will serve as the soft delete mechanism.
  2.  **Database Model (`src/models/user.py`)**
      *   Verify `is_active` flag exists and is suitable for soft delete. (Seems it is already used based on `tasks.md`). No changes likely needed here unless a dedicated flag is preferred. Let's stick with `is_active` for now.
  3.  **User Service (`src/services/user_service.py`)**
      *   Implement `update_user` method:
          *   Modify existing `update_user` to handle updates to all editable fields (name, email, `is_active`, roles). Ensure email uniqueness is checked correctly during updates (ignore self). Password changes should likely be handled separately for security (e.g., requiring current password, separate endpoint). Assume password change is out of scope for *this* task unless specified otherwise.
      *   Implement `delete_user` method:
          *   Implement logic to soft-delete a user (set `is_active = False`).
          *   Prevent self-deletion (admin cannot deactivate their own account via this method).
          *   Consider potential dependencies (e.g., assigned fuel orders - decide if deactivation should be prevented or handled). For now, allow deactivation regardless of assignments.
  4.  **Schemas (`src/schemas/user_schemas.py`)**
      *   Review `UserUpdateRequestSchema`: Ensure it includes all fields intended to be editable (name, email, `is_active`, `role_ids`).
      *   No new schemas needed for delete if using existing `is_active` flag via the update endpoint. If a dedicated DELETE endpoint is added, a simple response schema might be needed.
  5.  **API Routes (`src/routes/admin/user_admin_routes.py`)**
      *   Verify `PATCH /api/admin/users/<id>`: Ensure it correctly uses `UserService.update_user` and handles the updated schema. Seems this already exists (Step 16 in `tasks.md`). Double-check its implementation details.
      *   Verify `DELETE /api/admin/users/<id>`: Ensure it correctly uses `UserService.delete_user` (likely setting `is_active=False`). Seems this also exists (Step 16). Double-check its implementation.
      *   Ensure both endpoints are protected by the correct permission (`MANAGE_USERS`).
  6.  **Testing (Backend)**
      *   Add unit tests for `UserService.update_user` (various fields, email conflict, role changes, activation/deactivation).
      *   Add unit tests for `UserService.delete_user` (soft delete logic, self-delete prevention).
      *   Add integration tests for the PATCH and DELETE API endpoints.

  **Phase 2: Frontend Implementation (UI for Edit & Delete)**

  1.  **User Service (`src/services/UserService.js`)**
      *   Implement `updateUser(userId, userData)` function to call the `PATCH /api/admin/users/<id>` endpoint.
      *   Implement `deleteUser(userId)` function to call the `DELETE /api/admin/users/<id>` endpoint (or the PATCH endpoint if deactivation is done via update).
  2.  **User Management Page (`src/pages/admin/UserManagementPage.jsx`)**
      *   Add "Edit" button/icon to each row in the user table (likely `UserTable.jsx`).
      *   Add "Deactivate/Activate" button/icon (representing soft delete) to each row. Consider changing the label based on current `is_active` status.
      *   Implement logic to open a modal or navigate to a form for editing when "Edit" is clicked.
      *   Implement logic to call `deleteUser` service function when "Deactivate/Activate" is clicked, likely with a confirmation dialog.
      *   Update the user list after successful edit or delete/deactivation.
  3.  **User Form (`src/components/admin/UserForm.jsx`)**
      *   Modify the existing form (currently used for creation?) to support editing.
      *   Pre-populate the form with the selected user's data when editing.
      *   Handle form submission by calling the `updateUser` service function.
      *   Ensure Role selection component handles existing roles correctly.
  4.  **State Management / Context (`src/contexts/AuthContext.tsx` or page state)**
      *   Ensure user list state is updated correctly after edits/deletions.
      *   Check if changes to the logged-in user's own data (if allowed, though maybe restricted) require updating the AuthContext. Restricting self-edit of critical fields like roles/active status via this UI might be prudent.
  5.  **Testing (Frontend)**
      *   Add component tests for `UserForm.jsx` in edit mode.
      *   Add tests for the edit and delete/deactivate buttons/interactions in `UserManagementPage.jsx` or `UserTable.jsx`.
      *   Perform end-to-end tests for the user edit and delete/deactivate flows.

  **Phase 3: Documentation & Finalization**

  1.  **API Documentation**
      *   Ensure OpenAPI/Swagger documentation for the PATCH and DELETE user endpoints accurately reflects request/response schemas and behavior.
  2.  **User Documentation**
      *   Update any admin user guides explaining how to edit and deactivate/activate users.
  3.  **Code Review & Merge**

  ## Creative Phases Required
  - [ ] **UI/UX Design**: Potentially minor. Requires designing the user experience for editing (modal vs. separate page?) and deleting/deactivating (button placement, confirmation dialogs). Low complexity creative phase needed.

  ## Dependencies
  - Existing PBAC implementation (permissions `VIEW_USERS`, `MANAGE_USERS`).
  - Existing User model, service, routes, and schemas.
  - Frontend React components for Admin section.

  ## Challenges & Mitigations
  - **Challenge**: Deciding soft vs. hard delete strategy.
      - **Mitigation**: Decided on soft delete using `is_active` flag for data integrity.
  - **Challenge**: Preventing admins from locking themselves out (deactivating self, removing own MANAGE_USERS role).
      - **Mitigation**: Add specific checks in `UserService` to prevent self-deactivation and potentially restrict role changes for the current user. Frontend UI should also prevent these actions.
  - **Challenge**: Handling concurrent edits (less likely in admin scenario but possible).
      - **Mitigation**: Use optimistic locking (e.g., version counter) if needed, but likely overkill for initial implementation. Rely on last-write-wins for now.
  - **Challenge**: Ensuring frontend state updates correctly after mutations.
      - **Mitigation**: Use standard state management practices (e.g., re-fetching list after update/delete, or updating local state carefully).
  - **Challenge**: Existing `PATCH` and `DELETE` endpoints (from PBAC Phase 3, Step 16) might already implement some/all functionality. Need to verify their exact behavior.
      - **Mitigation**: Before implementing, thoroughly review the code for `src/routes/admin/user_admin_routes.py`, `src/services/user_service.py` (specifically `update_user` and any delete logic), and `src/schemas/user_schemas.py`. Adjust the plan based on existing code.
