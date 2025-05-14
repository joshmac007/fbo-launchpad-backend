import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { Moon, Sun } from 'lucide-react';
import Button from './Button';

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button
      onClick={toggleDarkMode}
      variant="ghost"
      size="icon"
      className={`rounded-full ${className}`}
      aria-label="Toggle dark mode"
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <Sun size={20} className="text-yellow-400 dark:text-yellow-300" />
      ) : (
        <Moon size={20} className="text-neutral-600 dark:text-neutral-400" />
      )}
    </Button>
  );
};

export default DarkModeToggle;
