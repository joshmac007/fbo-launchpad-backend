# Lessons Learned

## Frontend Development

### Component Design
- Break down complex UIs into reusable components (e.g., RoleTable, RoleForm, RolePermissionManager)
- Use consistent patterns for forms, tables, and modals across the application
- Implement proper prop types and default props for component reliability

### UI Framework Consistency
- Maintain consistent use of Tailwind CSS across all components
- Avoid mixing different UI frameworks (e.g., Material UI with Tailwind)
- Use standard HTML elements with Tailwind classes instead of UI framework components
- Follow established project patterns for common UI elements:
  - Tables: Use standard HTML table elements with Tailwind classes for consistent styling
  - Loading states: Use custom loading spinners with Tailwind animations
  - Error messages: Use consistent alert styling with Tailwind classes
  - Layout containers: Use max-width utilities and responsive padding
- Document common UI patterns in the codebase for reuse

### State Management
- Keep state close to where it's used (page-level state for CRUD operations)
- Use loading and error states consistently across components
- Clear state and error messages when closing modals or changing views

### API Integration
- Create dedicated service classes for API endpoints
- Group related API calls in service classes (e.g., RoleService for all role-related operations)
- Handle errors consistently across all API calls

### UI/UX Patterns
- Use consistent button placement and styling for actions
- Implement clear feedback for loading and error states
- Provide confirmation dialogs for destructive actions
- Use modals for focused tasks (create/edit/manage permissions)

### Navigation
- Organize admin features in both sidebar and tab navigation
- Use consistent icons and labels across navigation elements
- Maintain visual hierarchy in navigation components

## PBAC Implementation
- Separate role management from permission management
- Use clear, descriptive names for permissions
- Implement granular permission assignment UI
- Consider UX for managing many permissions

## Error Handling
- Provide specific error messages for different failure cases
- Clear error states when retrying operations
- Show loading states during async operations
- Handle edge cases in permission management

## Testing Considerations
- Test CRUD operations for roles
- Verify permission assignment/removal
- Test error handling and loading states
- Validate form validation and submission
- Check modal behavior and state management

## Implementation Patterns

### PBAC Migration Best Practices
- Migration script (05eadf8716a5) demonstrates good practices for complex data migrations:
  - Clear separation of concerns (permissions, roles, user migration)
  - Proper order of operations (create new structures before migrating data)
  - Edge case handling (null values)
  - Use of SQLAlchemy session for complex operations
  - Atomic operations within transactions
  - Clear mapping dictionaries for data transformation
  - Proper cleanup in downgrade path 