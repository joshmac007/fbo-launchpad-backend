# FBO LaunchPad Backend Testing Documentation

## Overview

This document provides comprehensive documentation for the FBO LaunchPad backend test suite. The test suite uses pytest and is designed to test authentication, fuel order management, and related functionality.

## Test Structure

### Directory Layout
```
fbo-launchpad-backend/
├── tests/
│   ├── conftest.py         # Test fixtures and configuration
│   ├── test_auth.py        # Authentication tests
│   ├── test_models.py      # Database model tests
│   └── test_routes.py      # API route tests
```

## Test Configuration

### Test Environment Setup (`conftest.py`)

The test environment is configured in `conftest.py` with the following key settings:

1. **Application Configuration**
   ```python
   app.config['TESTING'] = True
   app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
   app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
   app.config['SECRET_KEY'] = 'test-secret-key'
   ```

2. **Database Setup**
   - Uses SQLite in-memory database for tests
   - Tables are created and dropped for each test
   - Required tables: users, aircraft, customers, fuel_trucks, fuel_orders

### Test Fixtures

#### User Fixtures
1. **test_csr_user**
   - Role: CSR (Customer Service Representative)
   - Email: testcsr@example.com
   - Password: csrpass

2. **test_lst_user**
   - Role: LST (Line Service Technician)
   - Email: testlst@example.com
   - Password: csrpass

3. **test_admin_user**
   - Role: Admin
   - Email: testadmin@example.com
   - Password: password123

4. **test_inactive_user**
   - Role: CSR
   - Email: inactive@example.com
   - Password: inactivepass
   - Status: inactive

#### Resource Fixtures
1. **test_aircraft**
   - Tail Number: N12345
   - Type: Test Aircraft

2. **test_customer**
   - Name: Test Customer
   - Email: customer@example.com

3. **test_fuel_truck**
   - Truck Number: TRUCK001
   - Fuel Type: Jet A
   - Capacity: 5000.0

#### Authentication Fixtures
- **auth_headers**: Generates JWT tokens for different user roles
- Token payload includes: user ID, role, and expiration (1 hour)

## Test Suites

### 1. Authentication Tests (`test_auth.py`)

#### Registration Tests
```python
test_register_success()
test_register_missing_fields()
test_register_invalid_email()
test_register_duplicate_email()
```

Expected Behavior:
- New users are registered with LST role by default
- Username is generated from email (part before @)
- Duplicate emails are rejected
- Password is hashed before storage

#### Login Tests
```python
test_login_success()
test_login_incorrect_password()
test_login_nonexistent_email()
test_login_missing_fields()
test_login_inactive_user()
```

Expected Behavior:
- Successful login returns JWT token
- Invalid credentials return 401
- Inactive users cannot login
- Missing fields return 400

### 2. Fuel Order Tests (`test_routes.py`)

#### Order Management
```python
test_create_fuel_order()
test_get_fuel_orders()
test_update_fuel_order_status()
test_complete_fuel_order()
```

Expected Behavior:
- Orders require authentication
- CSR can create and review orders
- LST can update order status
- Complete flow: Dispatch → Acknowledge → En Route → Fueling → Complete → Review

## Authentication Requirements

### JWT Token Format
```python
{
    'sub': user.id,
    'role': user.role.value,
    'exp': datetime.utcnow() + timedelta(hours=1)
}
```

### Password Configuration
- All test users except specified use 'csrpass'
- Passwords are hashed using Werkzeug's password hashing
- Method: 'pbkdf2:sha256'

## Running Tests

### Basic Test Run
```bash
python -m pytest tests/ -v
```

### Run Specific Test File
```bash
python -m pytest tests/test_auth.py -v
```

### Run Specific Test
```bash
python -m pytest tests/test_auth.py::test_register_success -v
```

## Common Issues and Solutions

1. **SQLAlchemy Deprecation Warnings**
   - Warning about `Query.get()` being deprecated
   - Future update should use `Session.get()`

2. **JSON Serialization**
   - Enums must be converted to their values before JSON serialization
   - Use `enum_value.value` when returning in API responses

3. **Password Handling**
   - Always use `set_password()` method to hash passwords
   - Use `check_password()` method to verify passwords

## Test Dependencies

Required packages (from requirements.txt):
```
Flask==3.0.2
Flask-Cors==5.0.1
Flask-Migrate==4.0.5
Flask-SQLAlchemy==3.1.1
PyJWT>=2.0.0,<3.0.0
pytest==8.0.2
pytest-env==1.1.3
pytest-flask==1.3.0
```

## Best Practices

1. **Database Operations**
   - Always use test database (SQLite in memory)
   - Clean up after each test
   - Use transactions for data modifications

2. **Authentication**
   - Always verify token validation
   - Check role-based access
   - Validate inactive user states

3. **Test Isolation**
   - Each test should be independent
   - Use fresh fixtures for each test
   - Clean up any created resources

## Maintenance Notes

1. **Adding New Tests**
   - Follow existing patterns
   - Include both success and failure cases
   - Document expected behavior

2. **Updating Fixtures**
   - Maintain password consistency
   - Update auth_headers when adding roles
   - Keep test data realistic but simple

3. **Error Handling**
   - Verify error messages match frontend expectations
   - Include appropriate HTTP status codes

---

## Common JWT & Auth Pitfalls (for AI & Developers)

### 1. JWT Subject (`sub`) Type Mismatch
- Flask-JWT-Extended requires the `identity` (which becomes the JWT `sub` claim) to be a string. If you pass an integer (e.g., user ID), decoding will fail with `Subject must be a string`.
- **Solution:** Always use `create_access_token(identity=str(user.id))`.

### 2. Wrong Secret Key for JWT
- Flask-JWT-Extended uses `JWT_SECRET_KEY` for signing tokens, not `SECRET_KEY`.
- **Solution:** Always decode tokens with `JWT_SECRET_KEY` and ensure both creation and validation use the same key.

### 3. Algorithm Mismatch
- The default algorithm is `HS256`, but if you override it, you must specify the same in both token creation and decoding.
- **Solution:** Set `JWT_ALGORITHM = 'HS256'` in your config and use it everywhere.

### 4. Custom Decorators vs Flask-JWT-Extended
- If you use custom decorators (e.g., `token_required`), make sure they decode tokens using the correct secret and algorithm, and handle the `sub` claim as a string.
- **Solution:** Align custom logic with Flask-JWT-Extended's defaults. Prefer using `@jwt_required()` if possible.

### 5. In-Memory SQLite and Contexts
- When testing with SQLite in-memory, all DB setup, user creation, login, and API calls must happen in the same app context. Otherwise, the DB state will not persist.
- **Solution:** Wrap the entire test in `with app.app_context(): ...`.

### 6. Test Payload Schema Mismatch
- API tests must send all required fields as per the actual endpoint schema. Missing or extra fields cause 400 errors.
- **Solution:** Always check the API schema and update test payloads accordingly.

### 7. Legacy SQLAlchemy Warnings
- `Query.get()` is deprecated in SQLAlchemy 2.x. Use `Session.get()` instead.
- **Solution:** Update ORM calls to avoid warnings in future upgrades.

---

**Following these practices will save hours of debugging for both humans and AI!**
   - Log sufficient debug information 