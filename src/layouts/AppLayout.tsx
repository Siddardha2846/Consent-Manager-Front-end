import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { ToastContainer } from '../components/common/Toast';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

const ROUTE_TITLES: Record<string, string> = {
  '/cm/dashboard': 'Dashboard',
  '/cm/organizations': 'Organizations',
  '/cm/users': 'Users',
  '/cm/requests': 'Data Requests',
  '/cm/consent-requests': 'Consent Requests',
  '/cm/consents': 'Active Consents',
  '/cm/grants': 'Access Grants',
  '/cm/resources': 'Resources',
  '/cm/activity': 'Activity',
  '/cm/settings': 'Settings',
  '/org/dashboard': 'Dashboard',
  '/org/requests': 'Data Requests',
  '/org/consents': 'Active Consents',
  '/org/grants': 'Access Grants',
  '/org/history': 'Consent History',
  '/dp/dashboard': 'Dashboard',
  '/dp/pending': 'Pending Requests',
  '/dp/consents': 'Active Consents',
  '/dp/history': 'Consent History',
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/invitations': 'Invitations',
  '/admin/organization': 'Organization',
  '/admin/activity': 'Activity',
  '/profile': 'Profile',
  '/notifications': 'Notifications',
};

function getTitle(pathname: string): string {
  // Exact match first
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  // Prefix match for nested routes
  for (const [key, title] of Object.entries(ROUTE_TITLES)) {
    if (pathname.startsWith(key + '/')) return title;
  }
  return 'Consent Manager';
}

export function AppLayout() {
  const location = useLocation();
  const { isLoggedIn } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = getTitle(location.pathname);

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-gray-900/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 shrink-0">
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-gray-500 shadow"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader title={title} onMenuToggle={() => setMobileOpen(v => !v)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
