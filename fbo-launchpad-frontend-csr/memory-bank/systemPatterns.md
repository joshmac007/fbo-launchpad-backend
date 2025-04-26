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