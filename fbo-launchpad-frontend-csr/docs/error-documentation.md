## [Module 1.1] Error Documentation
- Linter warning: File name casing mismatch (authService.js vs AuthService.js). Ensure all imports use the exact file name casing as on disk to avoid errors, especially on case-sensitive file systems.
- Issue resolved: All imports now use standardized casing. See archive for details.

## [PBAC UI Adaptation] Error Documentation
- Potential for permission string mismatches between frontend and backend. Solution: Carefully map and document all permission strings.
- Most API 403 errors are already handled with user-friendly messages. Consider implementing a global error handler for permission errors to further improve UX.
- Edge case: If a user's permissions change during a session, a page reload or context refresh may be required to update visible UI elements. 