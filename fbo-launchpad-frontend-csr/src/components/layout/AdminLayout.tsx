import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Truck, Users, Plane, Building, Menu, LogOut, UserCog, KeyRound, X, ChevronLeft, ShieldCheck
} from 'lucide-react';
import DarkModeToggle from '../common/DarkModeToggle';
// AdminTabBar import removed
import { useAuth } from '../../contexts/AuthContext';

interface NavLinkItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  requiredPermission: string;
}

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { user, logout, isAuthenticated, hasPermission } = useAuth();
  const navigate = useNavigate();

  const navLinks: NavLinkItem[] = [
    { to: '/admin/trucks', label: 'Manage Trucks', icon: <Truck size={18} />, requiredPermission: 'MANAGE_TRUCKS' },
    { to: '/admin/users', label: 'Manage Users', icon: <Users size={18} />, requiredPermission: 'MANAGE_USERS' },
    { to: '/admin/aircraft', label: 'Manage Aircraft', icon: <Plane size={18} />, requiredPermission: 'MANAGE_AIRCRAFT' },
    { to: '/admin/customers', label: 'Manage Customers', icon: <Building size={18} />, requiredPermission: 'MANAGE_CUSTOMERS' },
    { to: '/admin/roles', label: 'Manage Roles', icon: <UserCog size={18} />, requiredPermission: 'MANAGE_ROLES' },
    { to: '/admin/permissions', label: 'System Permissions', icon: <ShieldCheck size={18} />, requiredPermission: 'VIEW_ADMIN' }, // Assuming VIEW_ADMIN covers this, adjust if specific permission exists
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-background dark:bg-neutral-background transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={`fixed md:static z-30 top-0 left-0 h-full w-64 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
                  bg-neutral-surface dark:bg-neutral-surface shadow-md border-r border-neutral-border dark:border-neutral-border rounded-r-lg md:rounded-none flex flex-col`}
      >
        <div className="flex items-center justify-between px-lg py-md border-b border-neutral-border dark:border-neutral-border">
          <span className="text-lg font-semibold text-primary dark:text-primary">Management</span>
          <button 
            className="md:hidden text-neutral-text-secondary hover:text-primary dark:hover:text-primary" 
            onClick={() => setSidebarOpen(false)} 
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-sm p-md">
          {navLinks.map(link => (
            isAuthenticated && hasPermission(link.requiredPermission) && (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-md px-md py-sm rounded-md transition-colors text-sm-medium ${
                    isActive 
                      ? 'bg-primary-light text-primary dark:text-primary shadow-sm'
                      : 'text-neutral-text-primary dark:text-neutral-text-primary hover:bg-neutral-surface-hover dark:hover:bg-neutral-surface-hover hover:text-primary dark:hover:text-primary'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {link.icon} <span className="ml-xs">{link.label}</span>
              </NavLink>
            )
          ))}
        </nav>
        <div className="p-md border-t border-neutral-border dark:border-neutral-border flex items-center gap-md">
          <div className="flex-1">
            <div className="text-sm font-normal text-neutral-text-primary dark:text-neutral-text-primary truncate">
              {user?.identity?.name || user?.identity?.username || user?.email || 'User'}
            </div>
            {user?.user_claims?.role?.name && (
              <div className="text-xs font-medium text-neutral-text-secondary dark:text-neutral-text-secondary">
                {user.user_claims.role.name}
              </div>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-xs text-xs-regular text-neutral-text-secondary hover:text-status-error dark:hover:text-status-error mt-xxs transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header 
          className="flex items-center justify-between px-md py-sm 
                     bg-neutral-surface/80 dark:bg-neutral-surface/80 backdrop-blur 
                     shadow-sm border-b border-neutral-border dark:border-neutral-border sticky top-0 z-20"
        >
          <div className="flex items-center gap-md">
            <button 
              onClick={() => setSidebarOpen(true)} 
              aria-label="Open sidebar" 
              className="text-primary dark:text-primary text-xl md:hidden hover:text-primary-hover dark:hover:text-primary-hover"
            >
              <Menu size={24} />
            </button>
            <NavLink
              to="/dashboard"
              className="flex items-center gap-xs px-sm py-xs rounded-md 
                         hover:bg-neutral-surface-hover dark:hover:bg-neutral-surface-hover text-primary dark:text-primary 
                         text-sm-medium transition-colors"
            >
              <ChevronLeft size={16} />
              Back to Dashboard
            </NavLink>
          </div>
          <DarkModeToggle />
        </header>
        <main className="flex-1 p-lg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 