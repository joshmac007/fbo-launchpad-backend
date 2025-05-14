import React, { ReactNode, MouseEventHandler, ElementType } from 'react';

// Define Button variants and sizes as string literal types
type ButtonVariant = 'primary' | 'secondary' | 'link' | 'outline' | 'ghost' | 'destructive' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

// Define the main props interface
interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  [key: string]: any; // Allow other props like aria-label
}

// For polymorphic 'as' prop
export type PolymorphicButtonProps<C extends ElementType = 'button'> = BaseButtonProps & {
  as?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof BaseButtonProps>;

const Button = <C extends ElementType = 'button'>({ // Generic C for the component type
  as,
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}: PolymorphicButtonProps<C>) => {
  const Component = as || 'button';

  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-background dark:focus:ring-offset-neutral-background-dark';

  const sizeStyles = {
    xs: 'h-8 px-3 text-xs',
    sm: 'h-10 px-4 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
    icon: 'h-10 w-10 text-sm',
  };

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover hover:-translate-y-px focus:ring-primary dark:bg-primary-dark dark:text-primary-foreground-dark dark:hover:bg-primary-dark-hover dark:focus:ring-primary-dark',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-neutral-border focus:ring-secondary dark:bg-secondary-dark dark:text-secondary-foreground-dark dark:border-neutral-border-dark dark:hover:bg-secondary-dark-hover dark:focus:ring-secondary-dark',
    link: 'text-primary underline-offset-4 hover:underline focus:ring-primary dark:text-primary-dark dark:focus:ring-primary-dark',
    outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground focus:ring-ring dark:border-input-dark dark:hover:bg-accent-dark dark:hover:text-accent-foreground-dark dark:focus:ring-ring-dark',
    ghost: 'hover:bg-accent hover:text-accent-foreground focus:ring-ring dark:hover:bg-accent-dark dark:hover:text-accent-foreground-dark dark:focus:ring-ring-dark',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive dark:focus:ring-destructive-dark',
    success: 'bg-status-success-surface text-status-success-text hover:bg-status-success-surface/90 border border-status-success-border focus:ring-status-success-text dark:focus:ring-status-success-text-dark',
  };
  
  const trulyDisabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
  // For actual button elements, the disabled attribute handles behavior.
  // For other elements (like 'a' rendered via 'as'), it might just be a visual style.
  const actualDisabled = Component === 'button' ? disabled : undefined;

  return (
    <Component
      type={Component === 'button' ? type : undefined}
      onClick={onClick}
      disabled={actualDisabled} // Use actualDisabled for the attribute
      className={`
        ${baseStyles}
        ${sizeStyles[size] || sizeStyles.md} 
        ${variantStyles[variant] || variantStyles.primary}
        ${trulyDisabledStyles} // Apply visual disabled styles regardless
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button; 