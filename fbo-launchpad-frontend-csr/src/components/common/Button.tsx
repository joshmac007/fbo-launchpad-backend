import React, { ReactNode, MouseEventHandler, ElementType } from 'react';
import { Loader2 } from 'lucide-react'; // Import Loader2

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
  isLoading?: boolean; // Added isLoading
  icon?: React.ReactElement; // Keep it simple: a ReactElement is expected for icons
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
  isLoading = false, // Added isLoading
  icon, // Added icon
  type = 'button',
  className = '',
  ...props
}: PolymorphicButtonProps<C>) => {
  const Component = as || 'button';

  const finalDisabled = disabled || isLoading; // Button is disabled if explicitly disabled or loading

  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-background dark:focus:ring-offset-neutral-background-dark motion-safe:hover:translate-y-[-2px] motion-safe:active:translate-y-[1px]';

  const sizeStyles = {
    xs: 'h-8 px-3 text-xs',
    sm: 'h-10 px-4 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
    icon: 'h-10 w-10 text-sm', // For icon-only buttons, content will be centered
  };
  
  const iconSizeClass = {
    xs: 'h-3.5 w-3.5',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    icon: 'h-5 w-5', // Icon size for icon-only buttons
  };
  
  const currentIconSize = iconSizeClass[size] || iconSizeClass.md;
  
  let hasVisibleChildren = false;
  if (children) {
    React.Children.forEach(children, (child) => {
      if (child !== null && child !== undefined && typeof child !== 'boolean') {
        if (typeof child === 'string' && child.trim() === '') {
          // empty string, ignore for margin purposes
        } else {
          hasVisibleChildren = true;
        }
      }
    });
  }

  // Define a class for the span that will wrap the icon to control its size and margin
  const iconContainerClassName = `${currentIconSize} ${hasVisibleChildren ? 'mr-xs' : ''} inline-flex items-center justify-center`;

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-primary dark:bg-primary-dark dark:text-primary-foreground-dark dark:hover:bg-primary-dark-hover dark:focus:ring-primary-dark',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-neutral-border focus:ring-secondary dark:bg-secondary-dark dark:text-secondary-foreground-dark dark:border-neutral-border-dark dark:hover:bg-secondary-dark-hover dark:focus:ring-secondary-dark',
    link: 'text-primary underline-offset-4 hover:underline focus:ring-primary dark:text-primary-dark dark:focus:ring-primary-dark',
    outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground focus:ring-ring dark:border-input-dark dark:hover:bg-accent-dark dark:hover:text-accent-foreground-dark dark:focus:ring-ring-dark',
    ghost: 'hover:bg-accent hover:text-accent-foreground focus:ring-ring dark:hover:bg-accent-dark dark:hover:text-accent-foreground-dark dark:focus:ring-ring-dark',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive dark:focus:ring-destructive-dark',
    success: 'bg-status-success-surface text-status-success-text hover:bg-status-success-surface/90 border border-status-success-border focus:ring-status-success-text dark:focus:ring-status-success-text-dark',
  };
  
  const trulyDisabledStyles = finalDisabled ? 'opacity-50 cursor-not-allowed' : '';
  const actualDisabled = Component === 'button' ? finalDisabled : undefined;

  return (
    <Component
      type={Component === 'button' ? type : undefined}
      onClick={onClick}
      disabled={actualDisabled}
      className={`
        ${baseStyles}
        ${sizeStyles[size] || sizeStyles.md} 
        ${variantStyles[variant] || variantStyles.primary}
        ${trulyDisabledStyles}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {isLoading && (
        <span className={iconContainerClassName}>
          <Loader2 className={`animate-spin ${currentIconSize}`} /> 
        </span>
      )}
      {!isLoading && icon && React.isValidElement(icon) && (
        <span className={iconContainerClassName}>
          {icon}
        </span>
      )}
      {children}
    </Component>
  );
};

export default Button; 