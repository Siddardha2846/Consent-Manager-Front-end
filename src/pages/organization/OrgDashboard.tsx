import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Hourglass,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils';

const ORG_ID = 'org-college-b';

export default function OrgDashboard() {
  const navigate = useNavigate();
  const { requests } = useApp();

  const myRequests = requests.filter(r => r.requesterOrgId === ORG_ID);
  const total = myRequests.length;
  const pending = myRequests.filter(r => r.status === 'CONSENT_REQUESTED').length;
  const active = myRequests.filter(r => r.status === 'ACTIVE' || r.status === 'APPROVED').length;
  const expired = myRequests.filter(r => r.status === 'EXPIRED').length;

  const recent = [...myRequests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Ananya</h1>
          <p className="text-sm text-gray-500 mt-0.5">College B · Manage your data access requests</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/org/requests/new')}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Data Request
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My Requests"
          value={total}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
          onClick={() => navigate('/org/requests')}
        />
        <StatCard
          label="Pending Consent"
          value={pending}
          icon={<Hourglass className="w-5 h-5" />}
          color="amber"
          onClick={() => navigate('/org/requests')}
        />
        <StatCard
          label="Approved / Active"
          value={active}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          onClick={() => navigate('/org/consents')}
        />
        <StatCard
          label="Recently Expired"
          value={expired}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Recent Requests */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Recent Data Requests</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/org/requests')}>
            View all
          </Button>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-5 h-5" />}
            title="No data requests yet"
            description="You haven't created any data requests yet."
            action={
              <Button variant="primary" size="sm" onClick={() => navigate('/org/requests/new')}>
                <Plus className="w-4 h-4 mr-1" />
                Create Data Request
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Request ID
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Data Principal
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Purpose
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {req.id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-gray-800">{req.dataPrincipalName}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{req.purpose}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(req.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/org/requests/${req.id}`)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
