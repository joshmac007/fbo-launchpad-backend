# Error Documentation

This document records the major failure points encountered in the FBO LaunchPad project and how they were resolved.

## 1. PostCSS Plugin Loading Failure
**Symptoms:**
- Build-time error in Vite: `Failed to load PostCSS config: Cannot find module '@tailwindcss/postcss'`.

**Cause:**
- Incorrect plugin key in `postcss.config.cjs` (`'@tailwindcss/postcss'` instead of `'tailwindcss'`).

**Resolution:**
1. Updated `postcss.config.cjs` to:
   ```js
   module.exports = {
     plugins: {
       'postcss-nesting': {},
       'tailwindcss': {},
       autoprefixer: {},
     }
   }
   ```
2. Installed missing dependencies:
   ```bash
   npm install -D tailwindcss postcss autoprefixer postcss-nesting
   ```

---

## 2. `process is not defined` in Vite
**Symptoms:**
- Runtime error in console: `ReferenceError: process is not defined` in `useOrders.ts`.

**Cause:**
- Frontend code was accessing `process.env` directly in a Vite project.

**Resolution:**
1. Switched to Vite-specific environment access:
   ```ts
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
   ```
2. Added `src/vite-env.d.ts` for TypeScript definitions:
   ```ts
   /// <reference types="vite/client" />
   interface ImportMetaEnv {
     readonly VITE_API_BASE_URL: string;
   }
   interface ImportMeta { readonly env: ImportMetaEnv }
   ```
3. Created `.env` in the frontend root with:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

---

## 3. Network Error Fetching Orders
**Symptoms:**
- Frontend error: `Error Loading orders: Network Error` when calling `/orders` endpoint.

**Causes & Resolutions:**
- **Backend not running:** Started Flask server:
  ```bash
  cd fbo-launchpad-backend
  flask run --port 5001
  ```
- **Port mismatch:** Updated frontend environment or backend run port to match (e.g., `5001`).
- **Authentication missing:** Ensured login flow stores JWT in `localStorage` under `token` and included in request headers.

---

## 4. Other Common Issues
- **CORS Errors:** If present, configure Flask-CORS in the backend:
  ```py
  from flask_cors import CORS
  app = Flask(__name__)
  CORS(app, resources={r"/api/*": {"origins": "*"}})
  ```
- **Invalid JSON Responses:** Ensure backend API returns valid JSON with `data` field.

---

## 5. Alembic Migration Ordering and Session/Table Definition Issues (PBAC Phase 1)
**Symptoms:**
- Migration failed with `psycopg2.errors.UndefinedColumn: column users.role does not exist`.
- Migration failed with `UnboundLocalError: local variable 'session' referenced before assignment` and `UnboundLocalError: local variable 'roles_table_id' referenced before assignment`.

**Causes:**
- Attempted to read from `users.role` after dropping the column in the same migration script.
- Referenced session and table objects before they were defined due to reordering of migration steps.

**Resolution:**
1. Reordered migration logic to perform all data migration from `users.role` before dropping the column.
2. Moved session and table object definitions to before any use in the migration function.
3. Confirmed migration runs successfully and all data is migrated as intended.

---

## Authentication System Issues

### Circular Import Resolution
**Issue**: Circular imports between user, role, and permission models.
**Solution**: Use relative imports and move relationship tables to separate modules.
```python
# Before (problematic):
from src.models.user import User
from src.models.role import Role

# After (fixed):
from ..models.role_permission import role_permissions
```

### Rate Limiting in Tests
**Issue**: Rate limiting interfering with tests.
**Solution**: 
1. Added `reset_rate_limits()` function
2. Created autouse fixture to reset between tests
```python
@pytest.fixture(autouse=True)
def reset_rate_limiting():
    reset_rate_limits()
    yield
```

### Permission Cache Issues
**Issue**: Permission cache not properly invalidating between requests.
**Solution**:
1. Made cache request-scoped using Flask's `g` object
2. Added proper cache key format
3. Implemented automatic invalidation between requests
```python
cache_key = f'user_{self.id}_perm_{permission_name}'
if has_request_context():
    if not hasattr(g, '_permission_cache'):
        g._permission_cache = {}
```

### Role Assignment
**Issue**: Role assignment not working properly during registration.
**Solution**: 
1. Fixed role relationship in User model
2. Properly queried default role before assignment
3. Used list assignment for roles
```python
default_role = Role.query.filter_by(name='Customer Service Representative').first()
user.roles = [default_role]
```

### Missing Field Validation
**Issue**: Register endpoint not properly validating all required fields.
**Solution**: Added proper validation using Marshmallow schemas
```python
class RegisterRequestSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=8))
    name = fields.String(required=False)
```

---

## CORS Configuration

### Issue: CORS Preflight Errors (April 2025)
**Problem**: Preflight OPTIONS requests to backend endpoints were resulting in 404 Not Found errors.

**Root Cause**: 
1. Multiple CORS initializations in the codebase (both in `app.py` and `__init__.py`)
2. Deprecated assignment settings endpoint still being imported but not implemented

**Resolution**:
1. Removed duplicate CORS initialization from `__init__.py`
2. Verified correct CORS configuration in `app.py`:
   ```python
   CORS(
       app,
       resources={
           r"/api/*": {
               "origins": "*",  # Allow all origins in development
               "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
               "allow_headers": [
                   "Content-Type",
                   "Authorization",
                   "X-Requested-With",
                   "Accept",
                   "Origin",
                   "Access-Control-Request-Method",
                   "Access-Control-Request-Headers"
               ],
               "expose_headers": ["Content-Type", "Authorization"],
               "supports_credentials": True,
               "max_age": 3600  # Cache preflight requests for 1 hour
           }
       }
   )
   ```
3. Removed import of deprecated assignment settings routes

**Note**: The `/api/admin/assignment-settings` endpoint is deprecated and has been removed as of April 2025. Any frontend code attempting to access this endpoint should be updated.

---

*Document last updated: YYYY-MM-DD*
