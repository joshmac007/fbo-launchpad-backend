import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Custom render function that includes providers
export function renderWithProviders(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  return {
    ...render(
      <BrowserRouter>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </BrowserRouter>
    ),
  };
}

// Mock JWT token for testing
export const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IkNTUiIsImlhdCI6MTUxNjIzOTAyMn0.L7PwspUjKJ8hpHRU7ANHAWoILqYYykTaAh4E0E6-h9c';

// Mock user data
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'CSR',
  name: 'Test User'
};

// Mock API response data
export const mockApiResponses = {
  login: {
    token: mockToken,
    user: mockUser
  },
  orders: {
    data: [
      {
        id: 1,
        status: 'PENDING',
        customer: 'Test Customer',
        aircraft: 'N12345',
        fuelType: 'Jet A',
        quantity: 1000,
        createdAt: '2024-02-20T12:00:00Z'
      }
    ],
    total: 1,
    page: 1,
    perPage: 10
  }
}; 