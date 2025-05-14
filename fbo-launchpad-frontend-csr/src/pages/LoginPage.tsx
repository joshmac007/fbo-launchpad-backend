import React from 'react';
import Login from '../components/auth/Login'; // Import the refactored Login component

const LoginPage: React.FC = () => {
  // The complex form logic, state, and submission handling are now encapsulated within the Login component.
  // This page component just needs to render it.
  return <Login />;
};

export default LoginPage; 