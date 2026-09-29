import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchInput, Select } from '../../components/common/FormFields';
import { formatDate, formatDuration, pluralize } from '../../utils';
import type { RequestStatus } from '../../types';

const ORG_ID = 'org-college-b';

const STATUS_OPTIONS: { label: string; value: '' | RequestStatus }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Consent Requested', value: 'CONSENT_REQUESTED' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Revoked', value: 'REVOKED' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function OrgRequests() {
  const navigate = useNavigate();
  const { requests } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | RequestStatus>('');

  const orgRequests = requests.filter(r => r.requesterOrgId === ORG_ID);

  const filtered = orgRequests.filter(r => {
    const matchesStatus = statusFilter === '' || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.dataPrincipalName.toLowerCase().includes(q) ||
      r.purpose.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pluralize(orgRequests.length, 'request')} from College B
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/org/requests/new')}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Data Request
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <SearchInput
          className="w-64"
          placeholder="Search by ID, principal, purpose…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Select
          className="w-52"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as '' | RequestStatus)}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {sorted.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-5 h-5" />}
            title={search || statusFilter ? 'No matching requests' : 'No data requests yet'}
            description={
              search || statusFilter
                ? 'Try adjusting your search or filter.'
                : "You haven't created any data requests yet."
            }
            action={
              !search && !statusFilter ? (
                <Button variant="primary" size="sm" onClick={() => navigate('/org/requests/new')}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Data Request
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
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
                    Fields
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Duration
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Created
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {req.id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {req.dataPrincipalName}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{req.purpose}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {pluralize(req.fields.length, 'field')}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {formatDuration(req.durationDays)}
                    </td>
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
