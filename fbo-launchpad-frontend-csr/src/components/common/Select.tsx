import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  placeholder?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>((
  { 
    options,
    label,
    id,
    name,
    value,
    onChange,
    disabled,
    required,
    error,
    placeholder,
    className = '', 
    wrapperClassName = '',
    labelClassName = '',
    selectClassName = '',
    size = 'md',
    ...restProps
  },
  ref
) => {

  const sizeStyles = {
    sm: 'h-9 text-sm px-sm rounded-sm',
    md: 'h-10 text-sm px-md rounded-md',
    lg: 'h-11 text-base px-md rounded-md',
  };

  const baseSelectStyles =
    'block w-full appearance-none bg-neutral-surface-default border border-neutral-border text-neutral-text-primary placeholder-neutral-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-primary-focus disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out';
  
  const errorStyles = error ? 'border-status-error-border focus:ring-status-error-focus focus:border-status-error-focus' : '';

  return (
    <div className={`w-full ${wrapperClassName}`.trim()}>
      {label && (
        <label 
          htmlFor={id || name} 
          className={`block text-sm-medium text-neutral-text-secondary mb-xs ${labelClassName}`.trim()}
        >
          {label} {required && <span className="text-status-error-text">*</span>}
        </label>
      )}
      <div className="relative w-full">
        <select
          id={id || name}
          name={name}
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            ${baseSelectStyles}
            ${sizeStyles[size]}
            ${errorStyles}
            ${selectClassName}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...restProps}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-sm text-neutral-icon">
          <ChevronDown className="h-md w-md" />
        </div>
      </div>
      {error && <p className="mt-xs text-xs-regular text-status-error-text">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select; 