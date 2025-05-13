## [Module 1.1] Lessons Learned
- Centralizing permission fetching and checking in AuthContext simplifies permission management and ensures consistent access control throughout the app.
- Exposing a hasPermission helper via context makes permission checks easy and declarative in components.
- Archiving process complete: All documentation for Module 1.1 is cross-referenced in the archive and reflection files.

## [PBAC UI Adaptation] Lessons Learned
- Inline permission checks using hasPermission and isAuthenticated are explicit, easy to review, and maintainable for the current app size.
- Centralizing permission logic in context reduces duplication and potential for errors.
- This approach can be refactored to a more abstract solution (e.g., HOC or render prop) if the app grows.
- Manual testing with different permission sets is essential to catch missing or incorrect checks.
- Documenting permission logic and usage patterns helps onboard new developers and maintain consistency. 