import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  FileText,
  CheckSquare,
  ShieldCheck,
  Key,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/Card';
import { Avatar } from '../../components/common/EmptyState';
import { timeAgo } from '../../utils';
import { ORGANIZATIONS } from '../../data/mockData';

// ─── Lifecycle Step ─────────────────────────────────────────────────────────────

interface LifecycleStep {
  label: string;
  color: string;
  textColor: string;
  ringColor: string;
}

const LIFECYCLE_STEPS: LifecycleStep[] = [
  { label: 'Request Created',    color: 'bg-gray-100',     textColor: 'text-gray-700',    ringColor: 'ring-gray-200' },
  { label: 'Consent Requested',  color: 'bg-blue-50',      textColor: 'text-blue-700',    ringColor: 'ring-blue-200' },
  { label: 'Decision Pending',   color: 'bg-amber-50',     textColor: 'text-amber-700',   ringColor: 'ring-amber-200' },
  { label: 'Approved',           color: 'bg-green-50',     textColor: 'text-green-700',   ringColor: 'ring-green-200' },
  { label: 'Active',             color: 'bg-emerald-50',   textColor: 'text-emerald-700', ringColor: 'ring-emerald-200' },
  { label: 'Revoked / Expired',  color: 'bg-orange-50',    textColor: 'text-orange-700',  ringColor: 'ring-orange-200' },
];

// ─── Bar Chart Colors ────────────────────────────────────────────────────────────

const STATUS_CHART_COLORS: Record<string, string> = {
  ACTIVE:            '#059669',
  CONSENT_REQUESTED: '#2563eb',
  PENDING:           '#d97706',
  APPROVED:          '#16a34a',
  REJECTED:          '#dc2626',
  REVOKED:           '#6b7280',
  EXPIRED:           '#ea580c',
  CANCELLED:         '#9ca3af',
};

// ─── Actor Avatar Color ─────────────────────────────────────────────────────────

function actorInitials(actor: string): string {
  return actor
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function CMDashboard() {
  const navigate = useNavigate();
  const { requests, consents, grants, activity } = useApp();

  // Computed stats
  const pendingRequests   = useMemo(() => requests.filter(r => r.status === 'PENDING').length, [requests]);
  const consentPending    = useMemo(() => consents.filter(c => c.status === 'PENDING').length, [consents]);
  const activeConsents    = useMemo(() => consents.filter(c => c.status === 'ACTIVE').length, [consents]);
  const activeGrants      = useMemo(() => grants.filter(g => g.status === 'ACTIVE').length, [grants]);

  // Chart data: requests grouped by status
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of requests) {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
    }
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [requests]);

  // Recent activity: last 5 events
  const recentActivity = useMemo(
    () => [...activity].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5),
    [activity]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of the consent management ecosystem</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Organizations"
          value={ORGANIZATIONS.length}
          icon={<Building2 className="w-5 h-5" />}
          color="blue"
          onClick={() => navigate('/cm/organizations')}
        />
        <StatCard
          label="Active Users"
          value={8}
          icon={<Users className="w-5 h-5" />}
          color="purple"
          onClick={() => navigate('/cm/organizations')}
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests}
          icon={<FileText className="w-5 h-5" />}
          color="amber"
          onClick={() => navigate('/cm/requests')}
        />
        <StatCard
          label="Pending Consents"
          value={consentPending}
          icon={<CheckSquare className="w-5 h-5" />}
          color="amber"
          onClick={() => navigate('/cm/consent-requests')}
        />
        <StatCard
          label="Active Consents"
          value={activeConsents}
          icon={<ShieldCheck className="w-5 h-5" />}
          color="green"
          onClick={() => navigate('/cm/consents')}
        />
        <StatCard
          label="Active Grants"
          value={activeGrants}
          icon={<Key className="w-5 h-5" />}
          color="green"
          onClick={() => navigate('/cm/grants')}
        />
      </div>

      {/* Consent Lifecycle Overview */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Consent Lifecycle Overview</h2>
        <div className="flex items-center flex-wrap gap-2">
          {LIFECYCLE_STEPS.map((step, idx) => (
            <React.Fragment key={step.label}>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-inset ${step.color} ${step.textColor} ${step.ringColor}`}
              >
                {step.label}
              </span>
              {idx < LIFECYCLE_STEPS.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Every data request flows through these lifecycle stages before granting or terminating access.
        </p>
      </div>

      {/* Lower grid: Activity + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Recent Activity
            </h2>
            <span className="text-xs text-gray-400">Last 5 events</span>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map(event => (
                <li key={event.id} className="flex items-start gap-3">
                  <Avatar initials={actorInitials(event.actor)} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 leading-snug">
                      <span className="font-medium">{event.actor}</span>{' '}
                      <span className="text-gray-600">{event.action}</span>{' '}
                      <span className="font-medium text-blue-700">{event.target}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(event.timestamp)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Requests by Status Chart */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Requests by Status</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No request data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tickFormatter={s =>
                    s === 'CONSENT_REQUESTED' ? 'C.REQ' : s.charAt(0) + s.slice(1).toLowerCase()
                  }
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{
                    fontSize: 12,
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: number) => [value, 'Requests']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {chartData.map(entry => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_CHART_COLORS[entry.status] ?? '#9ca3af'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
