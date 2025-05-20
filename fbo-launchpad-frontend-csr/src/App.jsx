import React from 'react';
import { DarkModeProvider } from './context/DarkModeContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FuelOrdersPage from './pages/orders/FuelOrdersPage';
import OrderCreatePage from './pages/OrderCreatePage';
import OrderDetailPage from './pages/OrderDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLayout from './components/layout/AdminLayout';
import TruckManagementPage from './pages/admin/TruckManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AircraftManagementPage from './pages/admin/AircraftManagementPage';
import CustomerManagementPage from './pages/admin/CustomerManagementPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import PermissionListPage from './pages/admin/PermissionListPage';

console.log('App: module loaded');

function App() {
  console.log('App: rendering');
  return (
    <DarkModeProvider>
      <AuthProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-neutral-background text-neutral-text-primary transition-colors duration-300">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/orders" element={<FuelOrdersPage />} />
                  <Route path="/orders/new" element={<OrderCreatePage />} />
                  <Route path="/orders/:orderId" element={<OrderDetailPage />} />
                </Route>

                {/* Admin Section - Protected by backend permissions */}
                <Route element={<AdminLayout />}>
                  <Route path="/admin/trucks" element={<TruckManagementPage />} />
                  <Route path="/admin/users" element={<UserManagementPage />} />
                  <Route path="/admin/aircraft" element={<AircraftManagementPage />} />
                  <Route path="/admin/customers" element={<CustomerManagementPage />} />
                  <Route path="/admin/roles" element={<RoleManagementPage />} />
                  <Route path="/admin/permissions" element={<PermissionListPage />} />
                  <Route path="/admin" element={<Navigate to="/admin/trucks" replace />} />
                </Route>
              </Route>

              {/* 404 catch-all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </SidebarProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
