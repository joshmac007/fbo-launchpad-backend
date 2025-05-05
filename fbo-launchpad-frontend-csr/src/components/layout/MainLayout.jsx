import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DarkModeToggle from '../common/DarkModeToggle';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 md:px-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} FBO LaunchPad. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 