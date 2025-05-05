# FBO LaunchPad Frontend CSR Project Brief

## Project Overview
FBO LaunchPad is a web platform for managing fuel orders at Fixed Base Operators (FBOs). This is the frontend client-side rendered (CSR) implementation using React and Vite.

## Core Requirements
- Single Page Application (SPA) using React and Vite
- Client-side routing with react-router-dom
- RESTful API integration using Axios
- User authentication and authorization
- Order management functionality
- Responsive and modern UI

## Technical Stack
- React (with Vite)
- React Router for routing
- Axios for API calls
- Environment-based configuration

## Project Structure
```
src/
├── assets/             # Static assets
├── components/         # Reusable UI components
│   └── common/         # General-purpose components
│   └── layout/         # Layout components
├── contexts/          # React Context providers
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── services/          # API services
└── styles/            # Global styles
```

## Core Features
1. User Authentication
   - Login/Logout
   - Token management
   - Protected routes

2. Order Management
   - View orders list
   - Create new orders
   - View order details
   - Update order status

3. Admin Features (to be implemented)
   - User management
   - System configuration
   - Analytics dashboard

## Development Guidelines
- Follow React best practices
- Use functional components and hooks
- Implement proper error handling
- Maintain clean code structure
- Document components and functions
- Use environment variables for configuration

## Security Considerations
- Implement proper authentication
- Secure API calls
- Protected routes
- Token management
- XSS prevention
- CSRF protection 

# System Patterns

## Component Patterns

### Common Components
1. PaginationControls
   - Location: `src/components/common/PaginationControls.jsx`
   - Purpose: Reusable pagination component for lists and grids
   - Props:
     - `paginationData`: Object containing pagination state (page, total_pages, has_prev, has_next, total_items)
     - `onPageChange`: Callback function for page navigation
   - Features:
     - Conditional rendering based on page count
     - Previous/Next navigation
     - Page information display
     - Disabled state handling
     - Accessible button controls

2. ProtectedRoute
   - Location: `src/components/common/ProtectedRoute.jsx`
   - Purpose: Route wrapper for authentication protection
   - Features:
     - Authentication state check
     - Redirect handling
     - Route protection

## Data Fetching Patterns

### Pagination Pattern
1. State Management:
   - Pagination state stored at page level
   - Filters combined with pagination parameters
   - Loading and error states handled globally

2. API Integration:
   - Query parameters for page and per_page
   - Response includes pagination metadata
   - Error handling with state reset

3. User Interaction:
   - Page navigation through PaginationControls
   - Filter changes reset to first page
   - Loading states during transitions

## Component Hierarchy
1. Page Components
   - Manage data fetching
   - Handle state management
   - Compose UI components

2. Feature Components
   - Implement specific functionality
   - Receive data via props
   - Emit events to parent

3. Common Components
   - Reusable across features
   - Controlled via props
   - Consistent styling 