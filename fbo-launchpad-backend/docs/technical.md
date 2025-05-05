# Technical Context

## Technology Stack

### Core Framework
- **Flask** (v3.0.2): Main web framework
- **Flask-SQLAlchemy** (v3.1.1): ORM for database operations
- **Flask-Migrate** (v4.0.5): Database migration management
- **Flask-CORS** (v5.0.1): CORS support for frontend integration

### Authentication & Security
- **PyJWT** (v2.10.0): JWT token handling
- **Werkzeug**: Password hashing (pbkdf2:sha256)

### API Documentation
- **APISpec**: OpenAPI specification generation
- **Marshmallow**: Schema validation and serialization

### Testing
- **pytest**: Test framework
- **pytest-flask**: Flask testing utilities
- **pytest-env**: Environment variable management for tests

## Project Structure
```
fbo-launchpad-backend/
├── src/
│   ├── models/        # Database models
│   ├── routes/        # API endpoints
│   ├── schemas/       # Request/response schemas
│   ├── services/      # Business logic
│   └── utils/         # Shared utilities
├── tests/            # Test suite
└── memory-bank/      # Project documentation
```

## Key Design Patterns

### 1. Model-View-Service
- **Models**: Database schema definitions
- **Views**: Route handlers (controllers)
- **Services**: Business logic implementation

### 2. Repository Pattern
- Database operations abstracted in service layer
- Models define schema and relationships
- Services handle complex queries and transactions

### 3. Factory Pattern
- Application factory for Flask app creation
- Configurable environment settings
- Extension initialization

### 4. Decorator Pattern
- Authentication middleware (@token_required)
- Role-based access control (@require_role)
- Request validation

## Database Schema

### Core Tables
1. **users**
   - Authentication credentials
   - Many-to-many relationship to roles (user_roles)
   - Status tracking

2. **roles**
   - Role name and description
   - Many-to-many relationship to permissions (role_permissions)
   - Many-to-many relationship to users (user_roles)

3. **permissions**
   - Permission key (name) and description
   - Many-to-many relationship to roles (role_permissions)

4. **role_permissions** (association table)
   - Links roles.id and permissions.id

5. **user_roles** (association table)
   - Links users.id and roles.id

6. **fuel_orders**
   - Order details
   - Status tracking
   - Timestamps for workflow stages

7. **customers**
   - Customer information
   - Billing details

8. **aircraft**
   - Aircraft details
   - Maintenance records

9. **fuel_trucks**
   - Equipment tracking
   - Fuel type compatibility

## API Structure

### Authentication
- JWT-based token system
- 1-hour token expiration
- Role information embedded in token

### Request/Response Format
- JSON for all endpoints
- Consistent error response structure
- Pagination for list endpoints

### Error Handling
- HTTP status codes for different scenarios
- Detailed error messages
- Validation error formatting

## Development Workflow

### 1. Code Organization
- Modular blueprint structure
- Clear separation of concerns
- Consistent file naming

### 2. Testing Strategy
- Unit tests for services
- Integration tests for API
- Fixtures for common test data

### 3. Documentation
- OpenAPI/Swagger specs
- Inline code documentation
- Memory bank maintenance

## Deployment Considerations

### Environment Configuration
- Development: SQLite
- Testing: In-memory SQLite
- Production: PostgreSQL

### Security Measures
- CORS configuration
- Password hashing
- Token validation
- Role enforcement

### Performance
- Query optimization
- Connection pooling
- Proper indexing
- Caching strategy (future)

## Authentication System

### Overview
The authentication system uses JWT (JSON Web Tokens) for stateless authentication with Flask-JWT-Extended. It implements:
- Rate limiting per endpoint and IP address
- Permission-based access control (PBAC)
- Request-level permission caching
- Role-based user management

### Components

1. **User Model** (`src/models/user.py`)
- Handles user data and authentication
- Implements password hashing with `werkzeug.security`
- Provides permission checking with request-level caching
- Manages role relationships through SQLAlchemy

2. **Role System** (`src/models/role.py`)
- Defines user roles (Admin, CSR, LST)
- Manages role-permission relationships
- Implements role inheritance

3. **Authentication Routes** (`src/routes/auth_routes.py`)
- `/auth/register`: User registration with validation
- `/auth/login`: User login with rate limiting
- Default role assignment (CSR)
- JWT token generation and validation

### Security Features

1. **Rate Limiting**
- Separate stores for login and register endpoints
- 5 attempts per minute per IP address
- Automatic reset on successful attempts
- Configurable window and attempt limits

2. **Permission Caching**
- Request-scoped caching using Flask's `g` object
- Automatic cache invalidation between requests
- Efficient permission checking with SQLAlchemy EXISTS

3. **Password Security**
- PBKDF2-SHA256 password hashing
- Secure password validation
- No plaintext password storage

### Configuration
```python
JWT_SECRET_KEY=<secure-key>
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hour
RATE_LIMIT_ATTEMPTS=5
RATE_LIMIT_WINDOW=60  # seconds
```