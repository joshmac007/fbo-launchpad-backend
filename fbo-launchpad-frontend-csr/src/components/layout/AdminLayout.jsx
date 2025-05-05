import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaTruck, FaUser, FaPlane, FaUsers, FaBars, FaSignOutAlt, FaUserShield, FaKey } from 'react-icons/fa';
import DarkModeToggle from '../common/DarkModeToggle';
import AdminTabBar from './AdminTabBar';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/admin/trucks', label: 'Manage Trucks', icon: <FaTruck /> },
    { to: '/admin/users', label: 'Manage Users', icon: <FaUser /> },
    { to: '/admin/aircraft', label: 'Manage Aircraft', icon: <FaPlane /> },
    { to: '/admin/customers', label: 'Manage Customers', icon: <FaUsers /> },
    { to: '/admin/roles', label: 'Manage Roles', icon: <FaUserShield /> },
    { to: '/admin/permissions', label: 'System Permissions', icon: <FaKey /> },
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`fixed md:static z-30 top-0 left-0 h-full w-64 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} backdrop-blur bg-white/80 dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 rounded-r-2xl md:rounded-none flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xl font-bold tracking-tight text-blue-700 dark:text-yellow-200">Management</span>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <FaBars />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-2 p-4">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium ${isActive ? 'bg-blue-100 text-blue-700 shadow' : 'hover:bg-blue-50 text-gray-700'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg">{link.icon}</span> {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="flex-1">
            <div className="font-semibold text-gray-700 dark:text-yellow-100 text-sm">{user?.name || user?.email || 'User'}</div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-300 hover:text-blue-700 dark:hover:text-yellow-200 mt-1"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800 backdrop-blur shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="text-blue-700 dark:text-yellow-200 text-xl md:hidden"><FaBars /></button>
            <a href="/" className="flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-gray-700 text-blue-600 dark:text-yellow-200 font-medium text-sm transition">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to Dashboard
            </a>
          </div>
          <DarkModeToggle className="ml-4" />
        </header>
        <main className="flex-1 p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">System Management</h1>
          <AdminTabBar />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
