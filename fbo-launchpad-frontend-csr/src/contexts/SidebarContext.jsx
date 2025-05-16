import React, { createContext, useState, useContext, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
  // Default to true (open) for desktop, false (closed) for mobile initially.
  // This will be determined by a screen size check.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isMobileView, setIsMobileView] = useState(false);

  const checkScreenWidth = () => {
    const mobileBreakpoint = 768; // Example breakpoint for md screens in Tailwind
    const isMobile = window.innerWidth < mobileBreakpoint;
    setIsMobileView(isMobile);
    // Set initial sidebar state based on screen width
    // If it's mobile, start closed. If desktop, start open (or retain previous state if appropriate).
    // For simplicity, let's make it start closed on mobile and open on desktop on initial load/resize.
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true); // Or some other logic to remember user preference on desktop
    }
  };

  useEffect(() => {
    checkScreenWidth(); // Check on initial mount
    window.addEventListener('resize', checkScreenWidth);
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // A way to specifically open the sidebar (e.g., for hamburger on mobile)
  const openSidebar = () => setIsSidebarOpen(true);
  // A way to specifically close the sidebar (e.g., when clicking overlay on mobile)
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, isMobileView, openSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}; 