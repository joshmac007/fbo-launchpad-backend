import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function DarkModeToggle({ className = '' }) {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`flex items-center gap-2 px-3 py-1 rounded-full border border-transparent hover:border-blue-400 transition bg-gray-100 dark:bg-gray-800 dark:text-yellow-200 text-gray-700 shadow ${className}`}
      aria-label="Toggle dark mode"
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <FaSun className="text-yellow-300" />
      ) : (
        <FaMoon className="text-blue-600" />
      )}
      <span className="hidden md:inline text-sm font-medium">
        {darkMode ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
