# Technical Context

## Development Environment
- Node.js environment
- Vite as build tool and dev server
- React 18+ for UI components
- ESLint for code quality
- Git for version control

## Key Dependencies
- react-router-dom: Client-side routing
- axios: HTTP client for API calls
- Other dependencies to be added as needed

## Frontend Testing Framework
1. Test Environment
   - Vitest as test runner
   - React Testing Library for component testing
   - JSDOM for browser environment simulation
   - Jest-DOM for DOM assertions

2. Test Setup
   - Custom test setup with providers
   - Mock utilities for common data
   - Test utilities for rendering with context

3. Test Coverage
   - Component unit tests
   - Integration tests
   - Coverage reporting (HTML, JSON, text)

4. Running Tests
   ```bash
   npm test           # Run tests in watch mode
   npm run test:ui    # Run tests with UI
   npm run test:coverage # Generate coverage report
   npm run test:watch   # Watch mode with coverage
   ```

## Backend Testing Framework
1. Test Environment
   - pytest and pytest-flask for testing
   - Separate PostgreSQL test database
   - TestingConfig with specific test settings
   - Fixtures for common test scenarios

2. Test Database
   - Isolated test database (fbo_launchpad_test)
   - Automatic table creation/cleanup
   - Transaction rollback after tests

3. Test Fixtures
   - Application context fixture
   - Database session fixture
   - Test client fixture
   - CLI runner fixture
   - User fixtures (CSR, LST, Admin)
   - Authentication header fixtures
   - Entity fixtures (Aircraft, Customer, FuelTruck)

4. Authentication Testing
   - JWT token generation
   - Role-based access testing
   - Token expiration handling

5. Running Tests
   ```bash
   # Inside backend container
   pytest                 # Run all tests
   pytest -v              # Verbose output
   pytest tests/test_*.py # Run specific test files
   pytest -k "test_name"  # Run tests matching pattern
   ```

## API Integration
- RESTful API communication
- Centralized API service configuration
- Token-based authentication
- Interceptors for request/response handling

## File Structure Conventions
1. Components
   - One component per file
   - Named exports for components
   - Organized by feature/type

2. Pages
   - Top-level route components
   - Handle data fetching and state
   - Compose smaller components

3. Services
   - API service configuration
   - Reusable API calls
   - Error handling

4. Contexts
   - Global state management
   - Authentication context
   - Theme context (if needed)

## Development Workflow
1. Local Development
   - `npm run dev` for development server
   - Environment variables in `.env.local`
   - Hot module replacement enabled

2. Building
   - `npm run build` for production build
   - Environment-specific builds
   - Build optimization

3. Testing (to be implemented)
   - Unit tests with Vitest
   - Component testing
   - Integration tests

## Deployment Considerations
- Static file hosting
- Environment variable management
- Build optimization
- Cache management

## Security Implementation
1. Authentication
   - JWT token storage
   - Token refresh mechanism
   - Secure routes

2. API Security
   - HTTPS only
   - Token validation
   - Request/response encryption

3. Data Protection
   - Input validation
   - XSS prevention
   - CSRF protection

## Performance Considerations
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Bundle size optimization 