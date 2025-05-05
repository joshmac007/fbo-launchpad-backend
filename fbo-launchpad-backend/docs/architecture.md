# System Patterns

## Architectural Overview

### 1. Application Structure
```
Flask Application
├── Application Factory
├── Blueprints (Feature Modules)
├── Services (Business Logic)
└── Models (Data Layer)
```

### 2. Request Flow
```
Request → JWT Auth → Role Check → Route Handler → Service → Database
```

## Core Patterns

### 1. Authentication Pattern
```python
# Decorator Chain
@token_required
@require_role(Role1, Role2)
def endpoint():
    pass
```

- JWT token validation
- Role verification
- User status check
- Current user in g.current_user

### 2. Service Pattern
```python
class BaseService:
    def __init__(self, model):
        self.model = model

class UserService(BaseService):
    def get_users(self, filters=None):
        query = self.model.query
        if filters:
            query = self.apply_filters(query, filters)
        return query.paginate()
```

### 3. Response Pattern
```python
{
    "data": [/* items */],
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 100
    },
    "error": null
}
```

### 4. Error Handling Pattern
```python
class APIError(Exception):
    def __init__(self, message, status_code):
        self.message = message
        self.status_code = status_code

@app.errorhandler(APIError)
def handle_api_error(error):
    return jsonify({
        "error": error.message
    }), error.status_code
```

## Database Patterns

### 1. Model Definition
```python
class BaseModel(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
```

### 2. Relationship Patterns
- One-to-Many: User → FuelOrders
- Many-to-One: FuelOrder → Customer
- Many-to-Many: Aircraft ↔ Customers

### 3. Query Patterns
```python
# Base query with joins
query = Model.query.join(Related)

# Filter chain
query = (query
    .filter(Model.field == value)
    .order_by(Model.created_at)
    .paginate())
```

## API Patterns

### 1. URL Structure
```
/api/<resource>/                 # Collection
/api/<resource>/<id>/           # Instance
/api/<resource>/<id>/<action>   # Action
```

### 2. HTTP Methods
- GET: Retrieve
- POST: Create
- PUT: Update (Full)
- PATCH: Update (Partial)
- DELETE: Remove

### 3. Query Parameters
```
?page=1              # Pagination
?per_page=20         # Items per page
?sort=field          # Sorting
?filter[key]=value   # Filtering
```

## Security Patterns

### 1. Permission-Based Access Control (PBAC)
```python
# Permission Check Method
class User(BaseModel):
    roles = db.relationship('Role', secondary='user_roles')

    def has_permission(self, permission_name):
        return any(
            permission.name == permission_name
            for role in self.roles
            for permission in role.permissions
        )

# Permission Decorator
@require_permission('PERMISSION_NAME')
def protected_endpoint():
    pass
```

### 2. Password Handling
```python
class User(BaseModel):
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
```

### 3. Token Pattern
```python
{
    "sub": user_id,
    "exp": expiration_time
}
```

## User Management Patterns

### 1. User Status Management
```python
class User(BaseModel):
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    roles = db.relationship('Role', secondary='user_roles')
    
    def deactivate(self):
        self.is_active = False
        
    def activate(self):
        self.is_active = True
```

### 2. User Creation Pattern
```python
@require_permission('MANAGE_USERS')
def create_user():
    # Validate role IDs exist
    roles = Role.query.filter(Role.id.in_(data['role_ids'])).all()
    if len(roles) != len(data['role_ids']):
        raise ValueError("Invalid role IDs provided")
        
    user = User(
        email=data['email'],
        username=data.get('name', data['email'].split('@')[0]),
        is_active=data.get('is_active', True)
    )
    user.set_password(data['password'])
    user.roles = roles
```

### 3. User Status Check Pattern
```python
def authenticate_user(email, password):
    user = User.query.options(db.selectinload(User.roles)).filter_by(email=email).first()
    if not user or not user.is_active:
        raise ValueError("Invalid credentials or inactive account")
    if not user.check_password(password):
        raise ValueError("Invalid credentials")
    return user
```

### 4. User Management Endpoints
```
# Admin User Management API
GET    /api/admin/users/        # List users (VIEW_USERS)
POST   /api/admin/users/        # Create user (MANAGE_USERS)
GET    /api/admin/users/<id>/   # Get user details (VIEW_USERS)
PATCH  /api/admin/users/<id>/   # Update user (MANAGE_USERS)
DELETE /api/admin/users/<id>/   # Soft delete user (MANAGE_USERS)

# Role Management API
GET    /api/admin/roles/        # List roles (VIEW_ROLES)
POST   /api/admin/roles/        # Create role (MANAGE_ROLES)
PATCH  /api/admin/roles/<id>/   # Update role (MANAGE_ROLES)
DELETE /api/admin/roles/<id>/   # Delete role (MANAGE_ROLES)

# Permission Management API
GET    /api/admin/permissions/  # List permissions (VIEW_PERMISSIONS)
```

## Testing Patterns

### 1. Fixture Pattern
```python
@pytest.fixture
def test_user():
    user = User(
        email="test@example.com",
        role=UserRole.CSR
    )
    user.set_password("password")
    return user
```

### 2. Test Structure
```python
def test_endpoint(client, auth_headers):
    response = client.get(
        "/api/resource",
        headers=auth_headers
    )
    assert response.status_code == 200
```

### 3. Mock Pattern
```python
@patch("service.external_api")
def test_with_mock(mock_api):
    mock_api.return_value = {"data": "test"}
    # Test implementation
```

## Documentation Patterns

### 1. OpenAPI Documentation
```python
"""
---
get:
  summary: Endpoint description
  parameters:
    - name: param
      in: query
      type: string
  responses:
    200:
      description: Success
"""
```

### 2. Code Documentation
```python
def function(param):
    """Short description.

    Detailed description.

    Args:
        param: Parameter description

    Returns:
        Return value description

    Raises:
        ErrorType: Error description
    """
``` 