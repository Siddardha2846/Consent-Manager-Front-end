import React, { useState, useMemo } from 'react';
import { Activity, Building2, User, Cpu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchInput } from '../../components/common/FormFields';
import { EmptyState } from '../../components/common/EmptyState';
import { timeAgo, formatDate } from '../../utils';
import type { ActivityEvent, RequestStatus, ConsentStatus, GrantStatus } from '../../types';

function getActorIcon(actorType: ActivityEvent['actorType']) {
  switch (actorType) {
    case 'org-user':
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-blue-600" />
        </div>
      );
    case 'data-principal':
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-emerald-600" />
        </div>
      );
    case 'consent-manager':
      return (
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-purple-600" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <Cpu className="w-4 h-4 text-gray-500" />
        </div>
      );
  }
}

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (eventDay.getTime() === today.getTime()) return 'Today';
  if (eventDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return formatDate(dateStr);
}

export default function CMActivity() {
  const { activity } = useApp();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...activity]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .filter((e) => {
        if (!q) return true;
        return (
          e.actor.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          e.actorType.toLowerCase().includes(q)
        );
      });
  }, [activity, search]);

  // Group by date label
  const groups = useMemo(() => {
    const map = new Map<string, ActivityEvent[]>();
    filtered.forEach((event) => {
      const label = getDateLabel(event.timestamp);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(event);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Activity</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Complete audit trail of all platform events.
        </p>
      </div>

      {/* Search */}
      <SearchInput
        className="max-w-xs"
        placeholder="Search by actor, action, target…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Content */}
      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Activity className="w-5 h-5" />}
            title="No activity found"
            description="Try adjusting your search to find events."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map(([dateLabel, events]) => (
            <div key={dateLabel}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {dateLabel}
              </h2>
              <Card padding={false}>
                <div className="divide-y divide-gray-100">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      {getActorIcon(event.actorType)}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <span className="text-sm font-medium text-gray-900">{event.actor}</span>
                          <span className="text-sm text-gray-500">{event.action}</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {event.target}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{timeAgo(event.timestamp)}</span>
                          {event.status && (
                            <StatusBadge
                              status={
                                event.status as RequestStatus | ConsentStatus | GrantStatus
                              }
                              size="sm"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-gray-500">
          {filtered.length} event{filtered.length !== 1 ? 's' : ''} shown
        </p>
      )}
    </div>
  );
}
