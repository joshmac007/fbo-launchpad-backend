import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';
import { useDarkMode } from '../../context/DarkModeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  ChevronLeft,
  Menu,
  LayoutDashboard,
  Fuel,
  Settings as SettingsIcon,
  UserCircle,
  LogOut,
  Moon,
  Sun,
  Users,
} from 'lucide-react';

// Reusable NavItem component for cleaner code
const NavItem = ({ to, icon: Icon, children, actionComponent: ActionComponent, onClick }) => {
  const { isSidebarOpen } = useSidebar();
  const baseClasses = `flex items-center gap-md rounded-md transition-colors duration-150 ease-in-out text-caption text-neutral-text-primary`;
  const layoutClasses = isSidebarOpen ? 'px-md py-3' : 'px-sm py-3 justify-center'; // Increased py for more vertical space
  const hoverClasses = 'hover:bg-neutral-background-hover hover:text-primary';
  
  const activeLinkClasses = ({ isActive }) => 
    `${baseClasses} ${layoutClasses} ${hoverClasses} ${isActive ? 'bg-primary-light text-primary font-medium [&_svg]:text-primary' : '[&_svg]:text-neutral-text-secondary'}`;

  if (to) {
    return (
      <NavLink
        to={to}
        className={activeLinkClasses}
        title={!isSidebarOpen ? children : ''}
      >
        <Icon size={20} className="flex-shrink-0" />
        {isSidebarOpen && <span className="truncate whitespace-nowrap">{children}</span>}
      </NavLink>
    );
  }

  // For non-link items like Dark Mode toggle
  return (
    <div
      className={`${baseClasses} ${layoutClasses} ${hoverClasses} cursor-pointer [&_svg]:text-neutral-text-secondary`}
      title={!isSidebarOpen ? children : ''}
      onClick={onClick}
    >
      <Icon size={20} className="flex-shrink-0" />
      {isSidebarOpen && (
        <span className="truncate whitespace-nowrap flex-1">{children}</span>
      )}
      {isSidebarOpen && ActionComponent && !onClick && <ActionComponent />}
    </div>
  );
};

const SidebarComponent = () => {
  const { isSidebarOpen, toggleSidebar, isMobileView, closeSidebar } = useSidebar();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const handleAdminSettingsClick = () => {
    navigate('/admin');
    if (isMobileView) {
      closeSidebar();
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col 
                 bg-neutral-surface text-neutral-text-primary
                 transition-all duration-300 ease-in-out 
                 ${isSidebarOpen ? 'w-[240px]' : 'w-[68px]'} // Adjusted width to better match Flup style
                 ${isMobileView && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}`
      }
    >
      {/* Top Section: Logo and Toggle Button */}
      <div className={`flex items-center h-[68px] shrink-0 ${isSidebarOpen ? 'px-lg' : 'px-md justify-center'}`}>
        {isSidebarOpen && (
          <div className="text-lg font-bold text-primary flex-grow">
            FBO LP
          </div>
        )}
        {!isMobileView && (
          <button
            onClick={toggleSidebar}
            className="p-xs rounded-md hover:bg-neutral-background-hover text-neutral-text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
          </button>
        )}
        {isMobileView && isSidebarOpen && (
           <button
            onClick={closeSidebar}
            className="p-xs rounded-md hover:bg-neutral-background-hover text-neutral-text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary-light md:hidden ml-auto"
            aria-label='Close sidebar'
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className={`flex-1 flex flex-col gap-lg overflow-y-auto ${isSidebarOpen ? 'px-lg py-md' : 'px-md py-md'}`}>
        {/* Main Navigation Section */}
        <div>
          {isSidebarOpen && (
            <h3 className="pt-sm pb-sm text-[11px] font-semibold text-neutral-text-secondary uppercase tracking-wider">
              Main
            </h3>
          )}
          <div className={`flex flex-col ${isSidebarOpen ? 'gap-xs' : 'gap-sm'}`}>
            <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
            <NavItem to="/orders" icon={Fuel}>Fuel Orders</NavItem>
          </div>
        </div>

        {/* Preferences Section (for Dark Mode Toggle) */}
        <div>
          {isSidebarOpen && (
            <h3 className="pt-md pb-sm text-[11px] font-semibold text-neutral-text-secondary uppercase tracking-wider">
              Preferences
            </h3>
          )}
          <div className={`flex flex-col ${isSidebarOpen ? 'gap-xs' : 'gap-sm'}`}>
            <NavItem 
              icon={darkMode ? Sun : Moon} 
              onClick={toggleDarkMode}
            >
              Dark mode
            </NavItem>
          </div>
        </div>
        
        {/* Admin Navigation Section */}
        <div className={isSidebarOpen ? 'mt-xs' : 'mt-sm'}>
          {isSidebarOpen && (
            <h3 className="pt-md pb-sm text-[11px] font-semibold text-neutral-text-secondary uppercase tracking-wider">
              Administration
            </h3>
          )}
          <div className={`flex flex-col ${isSidebarOpen ? 'gap-xs' : 'gap-sm'}`}>
            <NavItem 
              icon={SettingsIcon} 
              onClick={handleAdminSettingsClick}
            >
              Settings
            </NavItem>
            <NavItem to="/admin/users" icon={Users}>
              Users Management
            </NavItem>
          </div>
        </div>
      </nav>

      {/* User Profile & Logout Section */}
      <div className={`mt-auto border-t border-neutral-border ${isSidebarOpen ? 'p-lg' : 'p-md pt-md pb-md'}`}>
        {isSidebarOpen ? (
          <>
            <div className="flex items-center gap-sm">
              <UserCircle size={40} className="text-neutral-text-primary flex-shrink-0" />
              <div className="flex-1 truncate">
                <div className="text-small font-semibold text-neutral-text-primary truncate">User Name</div>
                <div className="text-caption text-neutral-text-secondary truncate">Administrator</div>
              </div>
            </div>
            <button 
              className={`flex items-center gap-md w-full mt-sm px-md py-3 rounded-md text-tiny text-neutral-text-secondary hover:bg-neutral-background-hover hover:text-primary [&_svg]:text-neutral-text-secondary [&_svg]:hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary-light`}
              title="Logout"
              aria-label="Logout"
              onClick={handleLogout}
            >
              <LogOut size={20} className="flex-shrink-0" />
              <span className="truncate whitespace-nowrap">Log out</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-md">
            <UserCircle size={28} className="text-neutral-text-primary flex-shrink-0" title="Profile" />
            <button 
              className={`p-sm rounded-md hover:bg-red-100/20 dark:hover:bg-red-800/20 text-neutral-text-secondary hover:text-status-error focus:outline-none focus:ring-2 focus:ring-red-500/50`}
              title="Logout"
              aria-label="Logout"
              onClick={handleLogout}
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarComponent; 