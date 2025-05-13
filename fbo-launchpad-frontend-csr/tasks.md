# Feature Planning Document: AuthContext Permissions Integration

## Requirements Analysis
- Core Requirements:
  - [ ] Fetch the authenticated user's permissions from `/api/auth/me/permissions` after login and on app load (if token exists).
  - [ ] Store permissions in the AuthContext state.
  - [ ] Provide a `hasPermission(permissionName)` helper in AuthContext for permission checks.
  - [ ] Expose `permissions` and `hasPermission` via the context for use in components.
  - [ ] Clear permissions on logout.
  - [ ] Handle errors gracefully (e.g., log, clear permissions, do not crash app).
- Technical Constraints:
  - [ ] Must use the existing `apiService` for API calls (token handled via interceptor).
  - [ ] Must not break existing AuthContext consumers.
  - [ ] Must be compatible with React Context API and hooks.
  - [ ] Must not introduce security risks (e.g., leaking permissions, improper state).

## Component Analysis
- Affected Components:
  - `src/services/authService.js`
    - Changes needed: Add `getMyPermissions` function.
    - Dependencies: `apiService.js`
  - `src/contexts/AuthContext.jsx`
    - Changes needed: Add permissions state, fetch logic, `hasPermission` helper, update login/logout/useEffect.
    - Dependencies: `authService.js`, `apiService.js`, `jwt.js`
  - All components using `useAuth` (indirectly affected, must be able to use `hasPermission`).

## Design Decisions
- Architecture:
  - [ ] Centralize permissions in AuthContext for global access.
  - [ ] Use a helper function for permission checks to keep component code clean.
  - [ ] Fetch permissions only after successful authentication or on valid token load.
- UI/UX:
  - [ ] No direct UI changes, but components can now conditionally render based on permissions.
- Algorithms:
  - [ ] Simple array lookup for `hasPermission`.
  - [ ] Error handling for failed permission fetches.

## Implementation Strategy
1. Phase 1: Service Layer
   - [ ] Implement `getMyPermissions` in `authService.js`.
2. Phase 2: Context Layer
   - [ ] Add `permissions` state and `fetchUserPermissions` logic to `AuthContext.jsx`.
   - [ ] Update `login`, `logout`, and initial `useEffect` to handle permissions.
   - [ ] Add and expose `hasPermission` helper.
3. Phase 3: Integration & Testing
   - [ ] Test login flow (permissions fetched and set).
   - [ ] Test app load with valid token (permissions fetched and set).
   - [ ] Test logout (permissions cleared).
   - [ ] Test `hasPermission` in a sample component.

## Testing Strategy
- Unit Tests:
  - [ ] Test `getMyPermissions` returns correct data and handles errors.
  - [ ] Test `hasPermission` returns correct boolean.
- Integration Tests:
  - [ ] Test AuthContext with mocked API responses for login, load, and logout.
  - [ ] Test a component using `useAuth().hasPermission`.

## Documentation Plan
- [ ] Update or create documentation for AuthContext API (including `permissions` and `hasPermission`).
- [ ] Document the new permission-checking pattern for frontend components.
- [ ] Update memory files (`tasks.md`, `activeContext.md`, etc.) with plan, status, and lessons learned.

## Creative Phases Required
- [ ] 🎨 UI/UX Design: No (unless permission-based UI needs new design)
- [ ] 🏗️ Architecture Design: No (uses existing context pattern)
- [ ] ⚙️ Algorithm Design: No (simple array lookup)

## Dependencies
- Backend endpoint `/api/auth/me/permissions` must be available and return `{ permissions: [...] }`.
- `apiService.js` must handle token in headers.

## Challenges & Mitigations
- **Challenge:** Backend endpoint may fail or return unexpected data.
  - **Mitigation:** Handle errors gracefully, default to empty permissions.
- **Challenge:** Components may assume permissions are always loaded.
  - **Mitigation:** Expose loading state if needed, document usage.
- **Challenge:** Token expiry or invalidation during fetch.
  - **Mitigation:** Rely on `apiService` interceptor to handle logout/redirect.

## Status
- [x] Initialization complete
- [x] Planning complete
- [ ] Technology validation complete
- [ ] Implementation steps 