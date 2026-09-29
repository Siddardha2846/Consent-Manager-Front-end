import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { cn, timeAgo } from '../../utils';
import type { Notification } from '../../types';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function notifIcon(type: Notification['type']) {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'error':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
}

function relatedPath(notif: Notification): string | null {
  if (!notif.relatedId || !notif.relatedType) return null;
  switch (notif.relatedType) {
    case 'request':
      return `/org/requests/${notif.relatedId}`;
    case 'consent':
      return `/dp/consents/${notif.relatedId}`;
    case 'grant':
      return `/org/grants/${notif.relatedId}`;
    default:
      return null;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const { notifications, currentRole, currentPrincipalId, markNotificationRead, markAllNotificationsRead, unreadCount } =
    useApp();
  const navigate = useNavigate();

  const filtered = notifications.filter(
    (n) =>
      n.targetRoles.includes(currentRole) ||
      (n.targetPrincipalId && n.targetPrincipalId === currentPrincipalId)
  );

  function handleClick(notif: Notification) {
    markNotificationRead(notif.id);
    const path = relatedPath(notif);
    if (path) navigate(path);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllNotificationsRead}>
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-5 h-5" />}
          title="No notifications"
          description="You're all caught up. Notifications will appear here when there's activity related to your account."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={cn(
                'w-full text-left rounded-lg border px-4 py-3.5 flex items-start gap-3 transition-colors duration-150',
                notif.read
                  ? 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
              )}
            >
              {/* Icon */}
              <div className="mt-0.5 shrink-0">{notifIcon(notif.type)}</div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm font-medium truncate',
                      notif.read ? 'text-gray-700' : 'text-gray-900'
                    )}
                  >
                    {notif.title}
                  </p>
                  <span className="text-xs text-gray-400 shrink-0">{timeAgo(notif.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5 leading-snug">{notif.message}</p>
                {notif.relatedId && (
                  <p className="text-xs text-blue-600 mt-1">
                    {notif.relatedType === 'request'
                      ? `Request ${notif.relatedId}`
                      : notif.relatedType === 'consent'
                      ? `Consent ${notif.relatedId}`
                      : `Grant ${notif.relatedId}`}
                    {' — click to view'}
                  </p>
                )}
              </div>

              {/* Unread dot */}
              {!notif.read && (
                <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
