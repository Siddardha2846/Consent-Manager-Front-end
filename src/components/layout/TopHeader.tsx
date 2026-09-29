import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { cn, timeAgo } from '../../utils';
import type { Role } from '../../types';
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  Check,
  RotateCcw,
  AlertTriangle,
  User,
  LogOut,
  Monitor,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../common/Button';

const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: 'consent-manager', label: 'Consent Manager', description: 'Platform administrator' },
  { value: 'org-user', label: 'Organization User', description: 'Ananya Krishnan · College B' },
  { value: 'data-principal', label: 'Data Principal', description: 'Rahul Kumar' },
  { value: 'org-admin', label: 'Org Administrator', description: 'Meera Iyer · College B' },
];

interface TopHeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export function TopHeader({ title, onMenuToggle }: TopHeaderProps) {
  const { currentRole, setRole, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, resetDemoData, addToast } = useApp();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRoleSwitcher(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentRoleLabel = ROLE_OPTIONS.find(r => r.value === currentRole)?.label ?? '';

  const handleRoleSwitch = (role: Role) => {
    setRole(role);
    setShowRoleSwitcher(false);
    const routes: Record<Role, string> = {
      'consent-manager': '/cm/dashboard',
      'org-user': '/org/dashboard',
      'data-principal': '/dp/dashboard',
      'org-admin': '/admin/dashboard',
    };
    navigate(routes[role]);
    addToast(`Switched to ${ROLE_OPTIONS.find(r => r.value === role)?.label}`, 'info');
  };

  const visibleNotifications = notifications.filter(
    n => n.targetRoles.includes(currentRole)
  ).slice(0, 8);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3">
      {/* Mobile Menu */}
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Title */}
      <h1 className="text-sm font-semibold text-gray-900 flex-1 truncate">{title}</h1>

      {/* Search */}
      <div className="hidden md:block">
        {showSearch ? (
          <input
            autoFocus
            type="search"
            placeholder="Search requests, consents, organizations…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onBlur={() => { if (!searchQuery) setShowSearch(false); }}
            className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 border border-gray-200 rounded-md hover:border-gray-300 hover:text-gray-600 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search…</span>
          </button>
        )}
      </div>

      {/* Demo Mode Switcher */}
      <div ref={roleRef} className="relative">
        <button
          onClick={() => setShowRoleSwitcher(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          aria-label="Switch demo role"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Demo:</span>
          <span>{currentRoleLabel}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {showRoleSwitcher && (
          <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-blue-50">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Presentation Demo Mode</p>
              <p className="text-xs text-blue-600 mt-0.5">Switch roles to simulate different user experiences</p>
            </div>
            <div className="py-1">
              {ROLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleRoleSwitch(opt.value)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                    currentRole === opt.value && 'bg-blue-50'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    currentRole === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  )}>
                    {opt.label.slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.description}</p>
                  </div>
                  {currentRole === opt.value && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              {confirmReset ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">Reset all demo data to initial state?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="flex-1 text-xs py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        resetDemoData();
                        setConfirmReset(false);
                        setShowRoleSwitcher(false);
                        addToast('Demo data has been reset.', 'info');
                      }}
                      className="flex-1 text-xs py-1.5 bg-red-600 rounded text-white hover:bg-red-700"
                    >
                      Reset Data
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset Demo Data
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setShowNotifications(v => !v)}
          className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
          aria-label={`${unreadCount} unread notifications`}
        >
          <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {visibleNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications</p>
                </div>
              ) : (
                visibleNotifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      setShowNotifications(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors',
                      !notif.read && 'bg-blue-50/50'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      )}
                      <div className={cn(!notif.read ? '' : 'ml-3.5')}>
                        <p className="text-xs font-medium text-gray-900">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100">
              <button
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
              >
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div ref={profileRef} className="relative">
        <button
          onClick={() => setShowProfile(v => !v)}
          className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
            {currentRole === 'data-principal' ? 'RK' : currentRole === 'org-user' ? 'AK' : currentRole === 'org-admin' ? 'MI' : 'CM'}
          </div>
        </button>
        {showProfile && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
            <button
              onClick={() => { navigate('/profile'); setShowProfile(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User className="w-4 h-4" /> Profile
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
