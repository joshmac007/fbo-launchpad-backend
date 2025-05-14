import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // This will resolve to Navbar.tsx

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-background dark:bg-neutral-background">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full py-lg px-lg">
        <Outlet />
      </main>
      <footer className="bg-neutral-surface dark:bg-neutral-surface border-t border-neutral-border dark:border-neutral-border mt-auto">
        <div className="max-w-7xl mx-auto py-md px-lg">
          <p className="text-center text-sm-regular text-neutral-text-secondary dark:text-neutral-text-secondary">
            © {new Date().getFullYear()} FBO LaunchPad. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 