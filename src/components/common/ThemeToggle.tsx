import React from 'react';
import { useUser } from '../../context/UserContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useUser();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${className}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
    </button>
  );
};
