import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock AuthService
vi.mock('../services/authService', () => ({
  loginUser: vi.fn(async () => ({ token: 'mocktoken' })),
  logoutUser: vi.fn(),
  getStoredToken: vi.fn(() => 'mocktoken'),
  getMyPermissions: vi.fn(async () => ['perm.read', 'perm.write'])
}));

// Mock decodeJWT
vi.mock('../utils/jwt', () => ({
  decodeJWT: vi.fn(() => ({ id: 1, email: 'test@example.com' }))
}));

const TestComponent = () => {
  const { isAuthenticated, user, permissions, hasPermission, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="user">{user ? user.email : 'none'}</div>
      <div data-testid="permissions">{permissions.join(',')}</div>
      <div data-testid="can-read">{hasPermission('perm.read') ? 'yes' : 'no'}</div>
      <div data-testid="can-admin">{hasPermission('perm.admin') ? 'yes' : 'no'}</div>
      <button onClick={() => login('test@example.com', 'pw')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext permissions', () => {
  it('fetches and checks permissions after login', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial state: should fetch permissions on mount
    await waitFor(() => expect(getByTestId('auth').textContent).toBe('yes'));
    expect(getByTestId('user').textContent).toBe('test@example.com');
    expect(getByTestId('permissions').textContent).toContain('perm.read');
    expect(getByTestId('can-read').textContent).toBe('yes');
    expect(getByTestId('can-admin').textContent).toBe('no');

    // Simulate logout
    act(() => {
      getByText('Logout').click();
    });
    await waitFor(() => expect(getByTestId('auth').textContent).toBe('no'));
    expect(getByTestId('permissions').textContent).toBe('');
    expect(getByTestId('can-read').textContent).toBe('no');

    // Simulate login
    act(() => {
      getByText('Login').click();
    });
    await waitFor(() => expect(getByTestId('auth').textContent).toBe('yes'));
    expect(getByTestId('permissions').textContent).toContain('perm.read');
    expect(getByTestId('can-read').textContent).toBe('yes');
  });
}); 