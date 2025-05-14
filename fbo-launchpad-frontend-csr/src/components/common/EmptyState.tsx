import React, { ReactNode } from 'react';
import Card from './Card'; // Assuming Card can be used for a consistent container, or remove if not desired
import Button, { PolymorphicButtonProps } from './Button'; // For optional action button

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: {
    text: string;
    onClick: () => void;
    buttonProps?: Omit<PolymorphicButtonProps, 'children' | 'onClick'>;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-xl space-y-md ${className}`}>
      {icon && <div className="text-neutral-icon-secondary mb-md">{icon}</div>}
      <h3 className="text-base font-semibold text-neutral-text-primary">{title}</h3>
      {message && <p className="text-sm-regular text-neutral-text-secondary max-w-md">{message}</p>}
      {action && (
        <Button 
          variant="primary" 
          onClick={action.onClick} 
          {...action.buttonProps}
          className={`mt-sm ${action.buttonProps?.className || ''}`.trim()}
        >
          {action.text}
        </Button>
      )}
    </div>
  );
};

export default EmptyState; 