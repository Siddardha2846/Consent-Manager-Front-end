import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Mail, Building2, Activity, UserPlus, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard, Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Avatar } from '../../components/common/EmptyState';
import { USERS } from '../../data/mockData';
import { timeAgo } from '../../utils';
import type { RequestStatus, ConsentStatus, GrantStatus } from '../../types';

const ORG_ID = 'org-college-b';

export default function AdminDashboard() {
  const { invitations, activity } = useApp();
  const navigate = useNavigate();

  const orgUsers = USERS.filter((u) => u.organizationId === ORG_ID);
  const activeUsers = orgUsers.filter((u) => u.status === 'ACTIVE');
  const pendingInvitations = invitations.filter(
    (i) => i.organizationId === ORG_ID && i.status === 'PENDING'
  );

  const recentActivity = [...activity]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Organisation Administration</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Welcome back — here's an overview of College B.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={orgUsers.length}
          icon={<Users className="w-4 h-4" />}
          color="blue"
          onClick={() => navigate('/admin/users')}
          trend={{ value: 'College B members', up: undefined }}
        />
        <StatCard
          label="Active Users"
          value={activeUsers.length}
          icon={<UserCheck className="w-4 h-4" />}
          color="green"
          onClick={() => navigate('/admin/users')}
          trend={{ value: `${orgUsers.length - activeUsers.length} inactive`, up: undefined }}
        />
        <StatCard
          label="Pending Invitations"
          value={pendingInvitations.length}
          icon={<Mail className="w-4 h-4" />}
          color="amber"
          onClick={() => navigate('/admin/invitations')}
          trend={{ value: 'Awaiting acceptance', up: undefined }}
        />
        <StatCard
          label="Organisation Status"
          value="Active"
          icon={<Building2 className="w-4 h-4" />}
          color="green"
          onClick={() => navigate('/admin/organization')}
          trend={{ value: 'College B', up: undefined }}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card padding={false}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.map((event) => (
                <div key={event.id} className="flex items-start gap-3 px-5 py-3">
                  <Avatar initials={event.actor.slice(0, 2).toUpperCase()} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {event.actor}
                      </span>
                      <span className="text-sm text-gray-500 truncate">{event.action}</span>
                      <span className="text-sm font-medium text-gray-700 font-mono text-xs">
                        {event.target}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{timeAgo(event.timestamp)}</span>
                      {event.status && (
                        <StatusBadge
                          status={event.status as RequestStatus | ConsentStatus | GrantStatus}
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

        {/* Quick Actions */}
        <div>
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full justify-between"
                onClick={() => navigate('/admin/invitations')}
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Invite User
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-between"
                onClick={() => navigate('/admin/users')}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  View Users
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-between"
                onClick={() => navigate('/admin/organization')}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Organisation Details
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Org Summary */}
          <Card className="mt-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">College B</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="text-gray-900 font-medium">University</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Location</span>
                <span className="text-gray-900 font-medium">Pune, MH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
