import React from 'react';
import { Outlet } from 'react-router-dom';
// import Navbar from './Navbar'; // Comment out Navbar
import Sidebar from './Sidebar'; // Import Sidebar
import { useSidebar } from '../../contexts/SidebarContext'; // Import useSidebar
import { Menu as HamburgerIcon } from 'lucide-react'; // For hamburger

const MainLayout: React.FC = () => {
  const { isSidebarOpen, isMobileView, openSidebar, closeSidebar } = useSidebar(); // Get sidebar state

  // UPDATED sidebar widths: 208px open, 54px closed
  const mainContentMarginLeft = !isMobileView && isSidebarOpen ? '208px' : (!isMobileView && !isSidebarOpen ? '54px' : '0px');

  return (
    <div className="min-h-screen flex flex-col bg-neutral-background dark:bg-neutral-background">
      {/* <Navbar /> */}
      <Sidebar />
      
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
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-neutral-surface text-neutral-text-primary md:hidden shadow-lg"
          aria-label="Open sidebar"
        >
          <HamburgerIcon size={24} />
        </button>
      )}

      <main 
        className="flex-1 py-lg px-lg animate-page-enter transition-all duration-300 ease-in-out overflow-x-hidden"
        style={{
          marginLeft: mainContentMarginLeft,
          width: `calc(100% - ${mainContentMarginLeft})`,
        }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
      <footer className="bg-neutral-background dark:bg-neutral-background border-t border-neutral-border dark:border-neutral-border mt-auto">
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