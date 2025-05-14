import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { renderWithProviders } from '../../test/utils';
import Login from './Login';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { mockApiResponses } from '../../test/utils';

vi.mock('../../services/authService', () => ({
  login: vi.fn(() => Promise.resolve(mockApiResponses.login)),
  getStoredToken: vi.fn(() => null),
  logoutUser: vi.fn(),
  loginUser: vi.fn(() => Promise.resolve(mockApiResponses.login))
}));

// Define a base mock context value that satisfies AuthContextType
const mockAuthContextValue: AuthContextType = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
  permissions: [],
  hasPermission: () => false,
  loadingAuth: false,
};

describe('Login Component', () => {
  it('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument(); // Changed from /username/i
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockLogin = vi.fn((email, password) => Promise.resolve()); // Added parameters to mockLogin
    
    renderWithProviders(
      // Provide a complete AuthContextType object
      <AuthContext.Provider value={{ ...mockAuthContextValue, login: mockLogin }}>
        <Login />
      </AuthContext.Provider>
    );

    const emailInput = screen.getByLabelText(/email address/i); // Changed from /username/i
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } }); // Used a valid email format
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser@example.com', 'password123');
    });
  });

  it('displays error message on login failure', async () => {
    const mockLogin = vi.fn((email, password) => Promise.reject(new Error('Invalid credentials'))); // Added parameters
    
    renderWithProviders(
      <AuthContext.Provider value={{ ...mockAuthContextValue, login: mockLogin }}>
        <Login />
      </AuthContext.Provider>
    );
    
    // Fill in the form to enable the button if it has validation tied to input values, though current Login.tsx doesn't seem to disable based on empty inputs explicitly beyond the default `required` HTML5 attr.
    const emailInput = screen.getByLabelText(/email address/i); 
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent(/invalid credentials/i);
      expect(mockLogin).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
    });
  });
}); 