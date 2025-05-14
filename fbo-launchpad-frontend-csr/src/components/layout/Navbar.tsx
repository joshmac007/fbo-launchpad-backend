import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DarkModeToggle from '../common/DarkModeToggle';
import Button from '../common/Button';
import { Rocket, Bell, Settings, UserCircle2, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, hasPermission, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout(); // Use logout from AuthContext
      navigate('/login'); // Navigate after logout
    }
  };

  return (
    <nav className="w-full bg-neutral-surface dark:bg-neutral-surface-alt border-b border-neutral-border dark:border-neutral-border-dark shadow-sm h-16 flex items-center justify-between px-lg z-50">
      <div className="flex items-center gap-md">
        <Link to="/dashboard" className="flex items-center gap-xs text-primary dark:text-primary-dark hover:opacity-80 transition-opacity">
          <Rocket className="h-6 w-6" />
          <span className="font-bold text-xl tracking-tight">
            FBO LaunchPad
          </span>
        </Link>
        
        {isAuthenticated && hasPermission('VIEW_ADMIN_NAV') && (
          <Button 
            variant="outline" 
            size="sm"
            as={Link} 
            to="/admin"
            className="ml-md"
          >
            Admin Panel
          </Button>
        )}
      </div>

      <div className="flex items-center gap-md">
        <Button variant="ghost" size="icon" className="text-neutral-text-secondary hover:text-primary dark:hover:text-primary" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-neutral-text-secondary hover:text-primary dark:hover:text-primary" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-sm border-l border-neutral-border dark:border-neutral-border pl-md">
          <UserCircle2 className="h-6 w-6 text-neutral-text-secondary" />
          <div className="text-sm">
            <div className="font-normal text-neutral-text-primary dark:text-neutral-text-primary">{user?.identity?.name || user?.identity?.username || user?.email || 'User'}</div>
            {user?.user_claims?.role?.name && <div className="text-xs font-medium text-neutral-text-secondary dark:text-neutral-text-secondary">{user.user_claims.role.name}</div>}
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLogout}
          icon={<LogOut className="h-4 w-4"/>}
        >
          Logout
        </Button>
        
        <DarkModeToggle />
      </div>
    </nav>
  );
};

export default Navbar; 