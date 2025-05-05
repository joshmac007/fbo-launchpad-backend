import React from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * Modern glassmorphic modal with fade/scale animation.
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - children: content
 * - title: optional string
 */
export default function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-fadein"
        onClick={onClose}
        aria-label="Close modal overlay"
      />
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto animate-scalein">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 focus:outline-none text-xl"
          onClick={onClose}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>
        {title && <h2 className="text-xl font-semibold mb-4 text-blue-800">{title}</h2>}
        <div>{children}</div>
      </div>
      <style>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scalein { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .animate-fadein { animation: fadein 0.2s ease; }
        .animate-scalein { animation: scalein 0.2s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
}
