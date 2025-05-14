import React, { InputHTMLAttributes, forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  labelSide?: 'left' | 'right';
  error?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  size?: 'sm' | 'md' | 'lg'; // Visual size of the checkbox square and check icon
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((
  {
    label,
    labelSide = 'right',
    id,
    name,
    checked,
    onChange,
    disabled,
    required,
    error,
    wrapperClassName = '',
    labelClassName = '',
    inputClassName = '',
    size = 'md',
    className = '', // Passed to the hidden input, not typically used for styling the visual part
    ...props
  },
  ref
) => {
  const uniqueId = id || name || React.useId();

  const sizeStyles = {
    sm: {
      square: 'h-4 w-4',
      icon: 'h-2.5 w-2.5',
      label: 'text-sm-regular',
    },
    md: {
      square: 'h-5 w-5',
      icon: 'h-3 w-3',
      label: 'text-sm-regular',
    },
    lg: {
      square: 'h-6 w-6',
      icon: 'h-3.5 w-3.5',
      label: 'text-md-regular',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const checkboxVisual =
    `flex-shrink-0 ${currentSize.square} inline-flex items-center justify-center border rounded transition-colors duration-150 ` +
    (checked
      ? 'bg-primary border-primary text-primary-foreground'
      : 'bg-neutral-surface-default border-neutral-border-strong') +
    (disabled ? ' opacity-50 cursor-not-allowed' : ' cursor-pointer') +
    (error && !checked ? ' border-status-error-border' : '');

  const labelContent = label && (
    <label 
      htmlFor={uniqueId} 
      className={`select-none ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${currentSize.label} ${labelClassName}`.trim()}
    >
      {label} {required && !checked && <span className="text-status-error-text ml-xs">*</span>}
    </label>
  );

  return (
    <div className={`inline-flex items-center gap-sm ${wrapperClassName}`.trim()}>
      {label && labelSide === 'left' && labelContent}
      <div className="relative">
        <input
          type="checkbox"
          id={uniqueId}
          name={name}
          ref={ref}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          required={required} // Native required might not be ideal for custom styled checkboxUX, handled by label span
          className={`absolute opacity-0 w-full h-full cursor-pointer ${inputClassName} ${className}`.trim()} // Hidden but interactive
          {...props}
        />
        <div 
          className={checkboxVisual}
          onClick={() => !disabled && onChange && onChange({ target: { checked: !checked } } as React.ChangeEvent<HTMLInputElement>)} // Simulate click for visual part
          aria-hidden="true" // Since the actual input is handling ARIA
        >
          {checked && <Check className={`${currentSize.icon} stroke-[3]`} />}
        </div>
      </div>
      {label && labelSide === 'right' && labelContent}
      {/* Consider placing error message outside flex for better layout, or adjust wrapper to column for errors below */}
      {/* {error && <p className="mt-xs text-xs-regular text-status-error-text">{error}</p>} Not ideal here, best handled by form field group */}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox; 