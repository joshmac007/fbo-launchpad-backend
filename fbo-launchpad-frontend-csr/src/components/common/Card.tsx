import React, { HTMLAttributes, ReactNode } from 'react';

// Define Card specific props
type CardPaddingSize = 'sm' | 'md' | 'lg' | 'none';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  padding?: CardPaddingSize;
}

const Card: React.FC<CardProps> = ({
  children,
  padding = 'lg',
  className = '',
  ...props
}) => {
  const baseStyles =
    'bg-neutral-background border border-neutral-border rounded-lg dark:bg-neutral-surface dark:border-neutral-surface transition-transform duration-200 ease-in-out';

  const paddingStyles: Record<CardPaddingSize, string> = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    none: '',
  };

  const combinedClassName = [
    baseStyles,
    paddingStyles[padding],
    className,
  ].filter(Boolean).join(' ').trim();

  return (
    <div
      className={combinedClassName}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 