import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DarkModeToggle from '../common/DarkModeToggle';

const Navbar = () => {
  const { user } = useAuth();
  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm h-16 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-2">
        <span className="text-blue-500 dark:text-yellow-400 font-bold text-lg tracking-tight flex items-center">
          {/* Logo placeholder */}
          <svg className="h-6 w-6 mr-1 text-blue-400 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
          FBO LaunchPad
        </span>
        {/* Admin link will be shown but protected by backend permissions */}
        <Link
          to="/admin/trucks"
          className="ml-6 px-3 py-1 rounded text-blue-700 dark:text-yellow-200 bg-blue-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 text-sm font-medium"
        >
          Admin
        </Link>
      </div>
      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <button className="relative text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-yellow-400 focus:outline-none">
          <span className="sr-only">Notifications</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </button>
        {/* Settings Icon */}
        <button className="text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-yellow-400 focus:outline-none">
          <span className="sr-only">Settings</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" /></svg>
        </button>
        {/* User Dropdown */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-yellow-100">{user?.name || user?.email || 'User'}</span>
          <button className="rounded-full bg-gray-200 dark:bg-gray-700 w-8 h-8 flex items-center justify-center text-gray-500 dark:text-yellow-200">
            {/* User avatar placeholder */}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-2.21 3.58-4 6-4s6 1.79 6 4" /></svg>
          </button>
        </div>
        {/* Logout Button */}
        <button className="ml-4 px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-yellow-100 text-sm font-medium border border-gray-300 dark:border-gray-600" onClick={() => {
          // Implement logout logic or call context
          if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }}>
          Logout
        </button>
        <DarkModeToggle className="ml-4" />
      </div>
    </nav>
  );
};

export default Navbar;
