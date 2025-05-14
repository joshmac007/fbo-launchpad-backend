import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button'; // Import the common Button
import { AlertTriangle } from 'lucide-react'; // Optional: for an icon

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-background-subtle text-center p-lg">
      <AlertTriangle className="h-3xl w-3xl text-status-warning-icon mb-md" /> {/* Larger icon */}
      <h1 className="text-3xl-strong text-neutral-text-primary mb-sm">
        404 - Page Not Found
      </h1>
      <p className="text-lg-regular text-neutral-text-secondary mb-lg max-w-md">
        Sorry, the page you are looking for does not exist or may have been moved.
      </p>
      <Button 
        as={Link} 
        to="/dashboard" // Assuming /dashboard is the primary landing spot after login
        variant="primary"
        size="lg"
      >
        Return to Dashboard
      </Button>
    </div>
  );
};

export default NotFoundPage; 