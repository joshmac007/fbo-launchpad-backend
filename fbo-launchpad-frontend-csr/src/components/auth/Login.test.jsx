import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import Login from './Login';
import { AuthContext } from '../../contexts/AuthContext';
import { mockApiResponses } from '../../test/utils';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  login: vi.fn(() => Promise.resolve(mockApiResponses.login)),
  getStoredToken: vi.fn(() => null),
  logoutUser: vi.fn(),
  loginUser: vi.fn(() => Promise.resolve(mockApiResponses.login))
}));

describe('Login Component', () => {
  it('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockLogin = vi.fn(() => Promise.resolve());
    
    renderWithProviders(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <Login />
      </AuthContext.Provider>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('displays error message on login failure', async () => {
    const mockLogin = vi.fn(() => Promise.reject(new Error('Invalid credentials')));
    
    renderWithProviders(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <Login />
      </AuthContext.Provider>
    );

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent(/invalid credentials/i);
    });
  });
}); 