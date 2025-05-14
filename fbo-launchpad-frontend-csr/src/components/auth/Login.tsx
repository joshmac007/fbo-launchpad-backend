import React, { useState, useContext, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { login } = useContext(AuthContext) as AuthContextType;
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-background p-xl">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit} noValidate className="space-y-lg p-lg">
          <h1 className="text-page-title text-neutral-text-primary text-center mb-xl">
            Welcome Back
          </h1>
          <div className="space-y-xs">
            <label htmlFor="email" className="block text-input-label text-neutral-text-secondary">Email Address</label>
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-xs">
            <label htmlFor="password" className="block text-sm-medium text-neutral-text-secondary">Password</label>
            <Input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div role="alert" className="p-sm border border-status-error-border bg-status-error-surface text-status-error-text text-sm-regular rounded-md">
              {error}
            </div>
          )}
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isSubmitting} 
            className="w-full mt-xl"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login; 