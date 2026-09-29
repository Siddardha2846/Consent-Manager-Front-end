import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils';
import type { Role } from '../../types';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  ShieldCheck,
  Key,
  Building2,
  Users,
  Activity,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  UserCircle,
  Database,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  'consent-manager': [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, to: '/cm/dashboard' },
    { label: 'Organizations', icon: <Building2 className="w-4 h-4" />, to: '/cm/organizations' },
    { label: 'Users', icon: <Users className="w-4 h-4" />, to: '/cm/users' },
    { label: 'Data Requests', icon: <FileText className="w-4 h-4" />, to: '/cm/requests' },
    { label: 'Consent Requests', icon: <CheckSquare className="w-4 h-4" />, to: '/cm/consent-requests' },
    { label: 'Active Consents', icon: <ShieldCheck className="w-4 h-4" />, to: '/cm/consents' },
    { label: 'Access Grants', icon: <Key className="w-4 h-4" />, to: '/cm/grants' },
    { label: 'Resources', icon: <Database className="w-4 h-4" />, to: '/cm/resources' },
    { label: 'Activity', icon: <Activity className="w-4 h-4" />, to: '/cm/activity' },
    { label: 'Settings', icon: <Settings className="w-4 h-4" />, to: '/cm/settings' },
  ],
  'org-user': [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, to: '/org/dashboard' },
    { label: 'Data Requests', icon: <FileText className="w-4 h-4" />, to: '/org/requests' },
    { label: 'Active Consents', icon: <ShieldCheck className="w-4 h-4" />, to: '/org/consents' },
    { label: 'Access Grants', icon: <Key className="w-4 h-4" />, to: '/org/grants' },
    { label: 'Consent History', icon: <Activity className="w-4 h-4" />, to: '/org/history' },
  ],
  'data-principal': [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, to: '/dp/dashboard' },
    { label: 'Pending Requests', icon: <CheckSquare className="w-4 h-4" />, to: '/dp/pending' },
    { label: 'Active Consents', icon: <ShieldCheck className="w-4 h-4" />, to: '/dp/consents' },
    { label: 'Consent History', icon: <Activity className="w-4 h-4" />, to: '/dp/history' },
  ],
  'org-admin': [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, to: '/admin/dashboard' },
    { label: 'Users', icon: <Users className="w-4 h-4" />, to: '/admin/users' },
    { label: 'Invitations', icon: <CheckSquare className="w-4 h-4" />, to: '/admin/invitations' },
    { label: 'Organization', icon: <Building2 className="w-4 h-4" />, to: '/admin/organization' },
    { label: 'Activity', icon: <Activity className="w-4 h-4" />, to: '/admin/activity' },
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  'consent-manager': 'Consent Manager',
  'org-user': 'Organization User',
  'data-principal': 'Data Principal',
  'org-admin': 'Org Administrator',
};

const ROLE_CONTEXTS: Record<Role, string> = {
  'consent-manager': 'Platform Admin',
  'org-user': 'College B',
  'data-principal': 'Rahul Kumar',
  'org-admin': 'College B',
};

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const { currentRole, setRole } = useApp();
  const navigate = useNavigate();
  const navItems = NAV_BY_ROLE[currentRole];

  const handleRoleChange = (role: Role) => {
    setRole(role);
    const firstNav = NAV_BY_ROLE[role][0];
    navigate(firstNav.to);
    onClose?.();
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-white border-r border-gray-200',
        mobile ? 'w-full h-full' : 'w-60 shrink-0 h-screen sticky top-0'
      )}
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Consent Manager</p>
            <p className="text-[10px] text-gray-400 leading-tight">DEPA Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-100',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User / Profile */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
            {ROLE_CONTEXTS[currentRole].slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{ROLE_CONTEXTS[currentRole]}</p>
            <p className="text-[10px] text-gray-400">{ROLE_LABELS[currentRole]}</p>
          </div>
          <NavLink to="/profile" className="text-gray-400 hover:text-gray-600">
            <UserCircle className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
