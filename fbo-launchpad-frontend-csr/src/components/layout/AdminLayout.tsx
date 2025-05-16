import React from 'react';
import { Outlet } from 'react-router-dom';
// Removed imports related to old sidebar: Menu, LogOut, UserCog, KeyRound, X, ChevronLeft, ShieldCheck, NavLinkItem, useAuth, useState, useNavigate
// import DarkModeToggle from '../common/DarkModeToggle'; // Assuming DarkModeToggle might be part of new global sidebar or App header if one exists

import Sidebar from './Sidebar'; // Import the new global Sidebar
import { useSidebar } from '../../contexts/SidebarContext'; // Import useSidebar
import { Menu as HamburgerIcon } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { isSidebarOpen, isMobileView, openSidebar, closeSidebar } = useSidebar();

  // UPDATED sidebar widths: 208px open, 54px closed
  const mainContentMarginLeft = !isMobileView && isSidebarOpen ? '208px' : (!isMobileView && !isSidebarOpen ? '54px' : '0px');

  // All logic for navLinks, handleLogout, and user display from the old sidebar
  // will be moved to the global SidebarComponent in a later phase.

  return (
    <div className="min-h-screen flex flex-col bg-neutral-background dark:bg-neutral-background"> {/* CHANGED to bg-neutral-background */}
      <Sidebar /> {/* Render the new global sidebar */}
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobileView && isSidebarOpen && (
        <div 
          onClick={closeSidebar} 
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          aria-label="Close sidebar overlay"
        ></div>
      )}

      {/* Hamburger Menu Button - Only visible on mobile */}
      {isMobileView && (
        <button 
          onClick={openSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-neutral-surface text-neutral-text-primary md:hidden shadow-lg" /* CHANGED hamburger to bg-neutral-surface */
          aria-label="Open sidebar"
        >
          <HamburgerIcon size={24} />
        </button>
      )}
      
      {/* Main Content - old topbar and old sidebar are removed */}
      <main 
        className="flex-1 max-w-full w-full transition-all duration-300 ease-in-out overflow-x-hidden" // Added overflow-x-hidden from previous fix attempt, keeping it.
        style={{
          marginLeft: mainContentMarginLeft,
          width: `calc(100% - ${mainContentMarginLeft})`, // Explicitly set width
        }}
      >
        <div className="w-full p-lg"> {/* Wrapper for content, p-lg for consistency */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout; 