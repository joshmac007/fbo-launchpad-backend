import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modern glassmorphic modal with fade/scale animation.
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - children: content
 * - title: optional string
 * - className: optional string for the modal content container
 * - overlayClassName: optional string for the overlay
 * - hideCloseButton: boolean
 * - size: optional string for modal width (sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, full)
 */

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string; 
  overlayClassName?: string; 
  hideCloseButton?: boolean; 
  size?: ModalSize;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  overlayClassName = '',
  hideCloseButton = false,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className={`absolute inset-0 bg-neutral-900/50 dark:bg-black/70 backdrop-blur-sm animate-fadein ${overlayClassName}`}
        onClick={onClose}
        aria-label="Close modal overlay"
      />
      <div 
        className={`relative bg-neutral-surface/90 dark:bg-neutral-surface/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-full ${sizeStyles[size]} mx-auto animate-scalein border border-neutral-border dark:border-neutral-border ${className}`}
      >
        {!hideCloseButton && (
          <button
            className="absolute top-3 right-3 text-neutral-text-secondary hover:text-primary dark:text-neutral-text-secondary dark:hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark rounded-md p-1 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        )}
        {title && (
          <h2 
            id="modal-title"
            className="text-xl font-semibold mb-4 text-neutral-text-primary dark:text-neutral-text-primary"
          >
            {title}
          </h2>
        )}
        <div>{children}</div>
      </div>
      <style>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scalein { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .animate-fadein { animation: fadein 0.2s ease; }
        .animate-scalein { animation: scalein 0.2s cubic-bezier(.4,0,.2,1); }

        @media (prefers-reduced-motion: reduce) {
          .animate-fadein,
          .animate-scalein {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
