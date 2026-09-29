import React, { useState, useMemo } from 'react';
import { Activity, User, Cpu, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchInput } from '../../components/common/FormFields';
import { StatusBadge } from '../../components/common/StatusBadge';
import { cn, formatDateTime } from '../../utils';
import type { ActivityEvent } from '../../types';

// ─── Actor badge ─────────────────────────────────────────────────────────────────

function ActorIcon({ type }: { type: ActivityEvent['actorType'] }) {
  switch (type) {
    case 'org-user':
      return <User className="w-3.5 h-3.5 text-blue-500" />;
    case 'data-principal':
      return <Shield className="w-3.5 h-3.5 text-emerald-500" />;
    case 'system':
      return <Cpu className="w-3.5 h-3.5 text-gray-400" />;
    case 'consent-manager':
      return <Activity className="w-3.5 h-3.5 text-purple-500" />;
    default:
      return <User className="w-3.5 h-3.5 text-gray-400" />;
  }
}

function actorLabel(type: ActivityEvent['actorType']): string {
  switch (type) {
    case 'org-user':
      return 'Organization User';
    case 'data-principal':
      return 'Data Principal';
    case 'system':
      return 'System';
    case 'consent-manager':
      return 'Consent Manager';
    default:
      return type;
  }
}

// ─── Date grouping ───────────────────────────────────────────────────────────────

function groupByDate(events: ActivityEvent[]): Map<string, ActivityEvent[]> {
  const groups = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    const date = new Date(event.timestamp).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date)!.push(event);
  }
  return groups;
}

// ─── College B relevance check ───────────────────────────────────────────────────

function isCollegeBEvent(event: ActivityEvent): boolean {
  // Events involving College B org users or related IDs
  const collegeBActors = ['Ananya Krishnan', 'Meera Iyer'];
  const collegeBTargets = ['REQ-1001', 'REQ-1003', 'REQ-1004', 'CST-1001', 'CST-1003', 'CST-1004'];
  return (
    collegeBActors.includes(event.actor) ||
    collegeBTargets.includes(event.targetId)
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function AdminActivity() {
  const { activity } = useApp();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const collegeBActivity = activity.filter(isCollegeBEvent);
    if (!search.trim()) return collegeBActivity;
    const q = search.toLowerCase();
    return collegeBActivity.filter(
      (e) =>
        e.actor.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q) ||
        e.targetType.toLowerCase().includes(q)
    );
  }, [activity, search]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Activity Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Events related to College B — {filtered.length} {filtered.length === 1 ? 'event' : 'events'}
          </p>
        </div>
      </div>

      {/* Search */}
      <SearchInput
        placeholder="Search by actor, action or target…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Timeline */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-5 h-5" />}
          title="No activity found"
          description={
            search
              ? 'No events match your search. Try different keywords.'
              : 'No activity events recorded for College B yet.'
          }
        />
      ) : (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([date, events]) => (
            <div key={date}>
              {/* Date group header */}
              <div className="flex items-center gap-3 mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{date}</p>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Events */}
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-3 shadow-sm"
                  >
                    {/* Actor icon */}
                    <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                      <ActorIcon type={event.actorType} />
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{event.actor}</span>
                        <span className="text-xs text-gray-400">{actorLabel(event.actorType)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{event.action}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded font-mono',
                            event.targetType === 'request'
                              ? 'bg-blue-50 text-blue-600'
                              : event.targetType === 'consent'
                              ? 'bg-emerald-50 text-emerald-600'
                              : event.targetType === 'grant'
                              ? 'bg-purple-50 text-purple-600'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {event.target}
                        </span>
                        {event.status && <StatusBadge status={event.status} size="sm" />}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-gray-400 shrink-0 mt-0.5">
                      {formatDateTime(event.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
