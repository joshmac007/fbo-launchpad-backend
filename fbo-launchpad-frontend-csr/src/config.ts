// To access environment variables in Vite, they must be prefixed with VITE_
// Example: VITE_API_URL in your .env file

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Add other global configurations here if needed 