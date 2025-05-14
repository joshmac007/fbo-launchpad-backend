import React, { forwardRef, InputHTMLAttributes, ChangeEventHandler, useId } from 'react';

// Define Input specific props
type InputSize = 'md'; // Can be expanded later e.g. 'sm' | 'lg'

interface CustomInputProps {
  size?: InputSize;
  label?: string; // Added label prop
  error?: boolean | string; // Can be boolean or an error message string
  wrapperClassName?: string; // For styling the div that wraps label and input
  labelClassName?: string;
  required?: boolean; // To show asterisk on label
}

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & CustomInputProps;

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      size = 'md', 
      label,
      id,
      name,
      placeholder,
      value,
      onChange,
      disabled = false,
      className = '',
      error = false, // Can be true/false or an error message string
      wrapperClassName = '',
      labelClassName = '',
      required = false,
      ...props 
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || name || generatedId;
    
    const errorMessage = typeof error === 'string' ? error : null;
    const hasError = typeof error === 'boolean' ? error : !!error;

    const baseStyles =
      'w-full font-normal rounded-md transition-all duration-200 ease-in-out';
    const baseColorStyles =
      'bg-neutral-surface-default border border-neutral-border text-neutral-text-primary placeholder-neutral-text-disabled dark:bg-neutral-background-dark dark:text-neutral-text-primary-dark dark:border-neutral-border-dark dark:placeholder-neutral-text-disabled-dark';

    const sizeStylesDefinition = {
      md: 'h-10 px-3 text-sm-regular',
    };

    const interactionStyles =
      'hover:border-primary-hover focus:outline-none focus:border-primary-focus focus:ring-2 focus:ring-primary-focus dark:hover:border-primary-hover-dark dark:focus:border-primary-focus-dark dark:focus:ring-primary-focus-dark';
    
    const errorStateStyles = hasError ? 'border-status-error-border text-status-error-text focus:ring-status-error-focus dark:border-status-error-border-dark dark:text-status-error-text-dark dark:focus:ring-status-error-focus-dark' : '';
    
    const disabledStateStyles = disabled
      ? 'bg-neutral-surface-disabled text-neutral-text-disabled border-neutral-border-disabled opacity-70 cursor-not-allowed dark:bg-neutral-surface-disabled-dark dark:text-neutral-text-disabled-dark dark:border-neutral-border-disabled-dark'
      : '';

    const combinedInputClassName = [
      baseStyles,
      baseColorStyles,
      sizeStylesDefinition[size],
      hasError ? errorStateStyles : (disabled ? '' : interactionStyles),
      disabled ? disabledStateStyles : '',
      className,
    ].filter(Boolean).join(' ').trim();

    return (
      <div className={`w-full ${wrapperClassName}`.trim()}>
        {label && (
          <label 
            htmlFor={inputId} 
            className={`block text-input-label text-neutral-text-secondary mb-xs ${labelClassName}`.trim()}
          >
            {label} {required && <span className="text-status-error-text ml-xs">*</span>}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          name={name} // Ensure name is passed for forms
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required} // Keep native required for basic browser validation if desired
          className={combinedInputClassName}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
          {...props}
        />
        {errorMessage && (
          <p id={`${inputId}-error`} className="mt-xs text-xs-regular text-status-error-text">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 