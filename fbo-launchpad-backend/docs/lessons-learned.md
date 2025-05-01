PBAC Migration Lessons (2025-05-02):
- When seeding roles and permissions in Alembic, always insert roles after permissions, then use a session to fetch IDs for mapping in association tables (role_permissions).
- Use op.bulk_insert for initial data, but fetch IDs with a session for correct mapping.
- Ensure downgrade reverses all seeded data in the correct order (role_permissions, then roles, then permissions).
- (2025-05-03) Always migrate user role assignments to the new user_roles table before dropping the old users.role column. Ensure downgrade deletes all user_roles links for reversibility and data integrity.
- (2025-05-04) When reordering Alembic migration steps, always perform all data migration logic that depends on old columns before dropping those columns. Define all session and table objects before use in any migration step to avoid UnboundLocalError or similar issues.
- (2025-05-05) Encapsulating permission-checking logic as a method on the User model (has_permission) keeps authorization logic close to the data and improves code readability and maintainability. Using SQLAlchemy's dynamic relationships and filter_by for permission checks is efficient and leverages the ORM's ability to generate optimized SQL EXISTS queries. This pattern is recommended for future PBAC or RBAC implementations.
- (2025-05-06) When implementing permission-based decorators, always check for authentication context (g.current_user) before permission checks, and return clear error codes/messages for both missing context (500) and permission denial (403). Remove obsolete role-based decorators to avoid confusion. This pattern ensures robust, maintainable route protection.

## Authentication System Implementation

### Best Practices
1. **Rate Limiting**
   - Implement rate limiting per endpoint rather than globally
   - Use separate stores for different endpoints
   - Reset limits on successful attempts
   - Make rate limiting configurable for testing

2. **Permission Management**
   - Use request-level caching for performance
   - Implement proper cache invalidation
   - Use SQLAlchemy EXISTS for efficient queries
   - Test permission inheritance thoroughly

3. **Testing**
   - Reset stateful components (like rate limiters) between tests
   - Test edge cases in authentication flows
   - Verify permission caching behavior
   - Include performance benchmarks

4. **Error Handling**
   - Provide specific error messages for each failure case
   - Include retry-after headers for rate limiting
   - Handle database errors gracefully
   - Log authentication failures appropriately

5. **Security**
   - Never store plaintext passwords
   - Use strong hashing algorithms (PBKDF2-SHA256)
   - Implement proper token expiration
   - Validate all input fields

### Architectural Decisions
1. **Permission Caching**
   - Chose request-level caching over global caching
   - Used Flask's `g` object for automatic cleanup
   - Implemented efficient permission checking with EXISTS

2. **Role System**
   - Used many-to-many relationships for flexibility
   - Implemented role inheritance
   - Made roles extensible for future changes

3. **Rate Limiting**
   - Per-endpoint stores for fine-grained control
   - IP-based limiting for security
   - Configurable windows and attempts
