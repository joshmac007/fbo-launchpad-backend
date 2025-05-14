import React, { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  // Add any other specific props, e.g., for custom styling or behavior
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, name, id, error, className, ...props }, ref) => {
    const baseClasses =
      'block w-full px-sm py-xs text-sm-regular text-neutral-text-primary dark:text-neutral-text-primary-dark '
      + 'bg-neutral-surface dark:bg-neutral-surface-alt border border-neutral-border-strong dark:border-neutral-border-dark rounded-md shadow-xs '
      + 'placeholder-neutral-text-disabled dark:placeholder-neutral-text-disabled-dark '
      + 'focus:ring-primary-focus focus:border-primary-focus dark:focus:ring-primary-focus-dark dark:focus:border-primary-focus-dark '
      + 'disabled:bg-neutral-surface-disabled dark:disabled:bg-neutral-surface-disabled-dark disabled:text-neutral-text-disabled dark:disabled:text-neutral-text-disabled-dark disabled:cursor-not-allowed '
      + 'transition-colors duration-150 ease-in-out';

    const errorClasses = error ? 'border-status-error-border dark:border-status-error-border-dark' : 'border-neutral-border-strong dark:border-neutral-border-dark';
    const finalId = id || name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={finalId} className="block text-sm-medium text-neutral-text-secondary dark:text-neutral-text-secondary-dark mb-xs">
            {label}
          </label>
        )}
        <textarea
          id={finalId}
          name={name}
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${className || ''}`}
          {...props}
        />
        {error && (
          <p className="mt-xs text-sm-regular text-status-error-text dark:text-status-error-text-dark">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea; 