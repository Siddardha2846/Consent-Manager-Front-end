import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ORGANIZATIONS, USERS } from '../../data/mockData';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Avatar, EmptyState } from '../../components/common/EmptyState';
import { formatDate, timeAgo } from '../../utils';
import type { OrgType } from '../../types';

// ─── Type Badge ─────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<OrgType, string> = {
  University: 'bg-blue-50 text-blue-700 ring-blue-200',
  Hospital:   'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Insurance:  'bg-purple-50 text-purple-700 ring-purple-200',
  Government: 'bg-amber-50 text-amber-700 ring-amber-200',
  Corporate:  'bg-gray-100 text-gray-700 ring-gray-200',
};

function OrgTypeBadge({ type }: { type: OrgType }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
      {type}
    </span>
  );
}

// ─── Tab type ───────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'users' | 'requests' | 'consents';

// ─── Component ──────────────────────────────────────────────────────────────────

export default function CMOrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, consents } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const org = ORGANIZATIONS.find(o => o.id === id);
  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-gray-500 text-sm mb-4">Organization not found.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/cm/organizations')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Organizations
        </Button>
      </div>
    );
  }

  const orgUsers    = USERS.filter(u => u.organizationId === id);
  const orgRequests = requests.filter(r => r.requesterOrgId === id || r.dataOwnerOrgId === id);
  const orgConsents = consents.filter(c => c.requesterOrgId === id || c.dataOwnerOrgId === id);

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview',  label: 'Overview' },
    { key: 'users',     label: 'Users',    count: orgUsers.length },
    { key: 'requests',  label: 'Requests', count: orgRequests.length },
    { key: 'consents',  label: 'Consents', count: orgConsents.length },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/cm/organizations')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Organizations
      </Button>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-gray-900">{org.name}</h1>
              <OrgTypeBadge type={org.type} />
              <StatusBadge status={org.status === 'ACTIVE' ? 'ACTIVE' : 'REVOKED'} size="sm" />
            </div>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">{org.description}</p>
          </div>
          <div className="text-xs text-gray-400 shrink-0">
            Joined {formatDate(org.joinedDate)}
          </div>
        </div>

        {/* Contact + Stats two-col */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contact</p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <a href={`mailto:${org.contactEmail}`} className="text-blue-600 hover:underline">{org.contactEmail}</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              {org.contactPhone}
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              {org.address}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              Last active {timeAgo(org.lastActivity)}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">{org.userCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">Users</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">{org.activeRequests}</p>
              <p className="text-xs text-gray-500 mt-0.5">Requests</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">{org.activeConsents}</p>
              <p className="text-xs text-gray-500 mt-0.5">Consents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Organization Details</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">ID</dt>
                <dd className="font-medium text-gray-900 font-mono text-xs">{org.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Type</dt>
                <dd><OrgTypeBadge type={org.type} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd><StatusBadge status={org.status === 'ACTIVE' ? 'ACTIVE' : 'REVOKED'} size="sm" /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Joined</dt>
                <dd className="text-gray-900">{formatDate(org.joinedDate)}</dd>
              </div>
            </dl>
          </Card>
          <Card>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity Summary</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total Users</dt>
                <dd className="font-semibold text-gray-900">{org.userCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Active Requests</dt>
                <dd className="font-semibold text-gray-900">{org.activeRequests}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Active Consents</dt>
                <dd className="font-semibold text-gray-900">{org.activeConsents}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last Activity</dt>
                <dd className="text-gray-900">{timeAgo(org.lastActivity)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Last Active'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orgUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-0">
                    <EmptyState icon={<Users className="w-5 h-5" />} title="No users in this organization" />
                  </td>
                </tr>
              ) : (
                orgUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={user.initials} size="sm" />
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ring-1 ring-gray-200 ring-inset capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status === 'ACTIVE' ? 'ACTIVE' : user.status === 'INVITED' ? 'PENDING' : 'REVOKED'} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(user.joinedDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{timeAgo(user.lastActive)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Request ID', 'Requester', 'Data Owner', 'Purpose', 'Status', 'Created'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orgRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-0">
                    <EmptyState icon={<FileText className="w-5 h-5" />} title="No requests for this organization" />
                  </td>
                </tr>
              ) : (
                orgRequests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/cm/requests/${req.id}`)}>
                    <td className="px-4 py-3 text-sm font-mono font-medium text-blue-700">{req.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{req.requesterOrgName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{req.dataOwnerOrgName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{req.purpose}</td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} size="sm" /></td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(req.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'consents' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Consent ID', 'Data Principal', 'Requester', 'Data Owner', 'Purpose', 'Status', 'Created'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orgConsents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-0">
                    <EmptyState icon={<ShieldCheck className="w-5 h-5" />} title="No consents for this organization" />
                  </td>
                </tr>
              ) : (
                orgConsents.map(consent => (
                  <tr key={consent.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/cm/consents/${consent.id}`)}>
                    <td className="px-4 py-3 text-sm font-mono font-medium text-blue-700">{consent.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{consent.dataPrincipalName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{consent.requesterOrgName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{consent.dataOwnerOrgName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{consent.purpose}</td>
                    <td className="px-4 py-3"><StatusBadge status={consent.status} size="sm" /></td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(consent.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
