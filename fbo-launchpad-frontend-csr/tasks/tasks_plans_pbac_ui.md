# PBAC UI Integration Task Plan (Temporary)

## Objective
Systematically refactor all CSR frontend UI components to dynamically show, hide, or disable UI elements based on the authenticated user's permissions, using the hasPermission(permissionName) helper from AuthContext.

## Chosen Creative Approach: Inline Permission Checks in Each Component

For this PBAC UI integration, we will use **Option 1: Inline Permission Checks in Each Component**.

- In each relevant component or page, import `useAuth` from `AuthContext`.
- Destructure `hasPermission` and `isAuthenticated` from the hook.
- Wrap each sensitive UI element (button, link, menu item, etc.) in a conditional block:
  ```jsx
  {isAuthenticated && hasPermission('PERMISSION_NAME') && (
    // ...element...
  )}
  ```
- For navigation arrays (e.g., sidebar links), filter or map based on permission.
- For MVP, elements will be **hidden** rather than disabled unless UX requires otherwise.
- Permission strings must match backend definitions exactly.
- This approach is explicit, easy to review, and requires minimal refactoring. It is the most pragmatic for the current app size and can be refactored to a more abstract solution if the app grows.

## Steps

1. **Inventory & Permission Mapping**
   - [x] Identify all UI elements (buttons, links, menu items) requiring permission checks in key components and pages.
   - [x] Map each element to its required permission string (matching backend decorators).

2. **Component Refactor**
   - [x] Refactor Navbar and main navigation to hide admin links unless user has permission.
   - [x] Refactor AdminLayout and AdminTabBar to hide tabs/links based on permissions.
   - [x] Refactor DashboardPage and Dashboard component for "Export" and "New Order" buttons.
   - [x] Refactor OrderDetailPage for "Mark as Reviewed" button.
   - [x] Refactor OrderCreatePage for "Submit" button.
   - [x] Refactor FuelOrdersTable for action links (if needed).
   - [x] Refactor all Admin pages (User, Role, Aircraft, Customer, Truck Management) for create/edit/delete buttons.

3. **Error Handling Review**
   - [ ] Ensure 403 errors from API are handled with user-friendly messages.

4. **Testing & Verification**
   - [ ] Manually verify UI adapts correctly for users with different permissions.
   - [ ] Confirm no unauthorized UI elements are visible or interactive.

5. **Documentation & Memory Bank Update**
   - [x] Mark this step as complete in this file and in main tasks_plans.md.
   - [ ] Update active_Context.md to reflect PBAC UI adaptation completion.
   - [ ] Update lessons-learned.md with insights from this integration.
   - [ ] Update error-documentation.md with any new errors or fixes.

## Status
- **Current Step:** Reflection complete. See reflection.md for details.
- **Owner:** AI Assistant (VAN Mode)
- **Notes:** All major refactor steps are complete. Reflection is documented in reflection.md. Follow-up: Consider global error handler for permission errors and further abstraction if app grows. 