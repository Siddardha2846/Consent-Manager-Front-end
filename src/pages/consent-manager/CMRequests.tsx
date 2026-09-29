import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ORGANIZATIONS } from '../../data/mockData';
import type { RequestStatus } from '../../types';
import { SearchInput, Select } from '../../components/common/FormFields';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate, formatDuration, pluralize } from '../../utils';

const ALL_STATUSES: RequestStatus[] = [
  'PENDING',
  'CONSENT_REQUESTED',
  'APPROVED',
  'ACTIVE',
  'REJECTED',
  'REVOKED',
  'EXPIRED',
  'CANCELLED',
];

export default function CMRequests() {
  const navigate = useNavigate();
  const { requests } = useApp();

  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState<string>('All');
  const [orgFilter, setOrg]       = useState<string>('All');

  const orgOptions = useMemo(() => ORGANIZATIONS.map(o => ({ id: o.id, name: o.name })), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return requests.filter(req => {
      const matchesSearch =
        req.id.toLowerCase().includes(q) ||
        req.requesterOrgName.toLowerCase().includes(q) ||
        req.dataOwnerOrgName.toLowerCase().includes(q) ||
        req.dataPrincipalName.toLowerCase().includes(q) ||
        req.purpose.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'All' || req.status === statusFilter;
      const matchesOrg =
        orgFilter === 'All' ||
        req.requesterOrgId === orgFilter ||
        req.dataOwnerOrgId === orgFilter;
      return matchesSearch && matchesStatus && matchesOrg;
    });
  }, [requests, search, statusFilter, orgFilter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Data Requests</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {requests.length} total request{requests.length !== 1 ? 's' : ''} across all organizations
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          placeholder="Search by ID, org, principal, purpose…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sm:w-72"
        />
        <Select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          className="sm:w-52"
        >
          <option value="All">All Statuses</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </Select>
        <Select
          value={orgFilter}
          onChange={e => setOrg(e.target.value)}
          className="sm:w-52"
        >
          <option value="All">All Organizations</option>
          {orgOptions.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Request ID',
                  'Requester Org',
                  'Data Owner Org',
                  'Data Principal',
                  'Purpose',
                  'Fields',
                  'Duration',
                  'Status',
                  'Created',
                  'Actions',
                ].map(col => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-0">
                    <EmptyState
                      icon={<FileText className="w-5 h-5" />}
                      title="No requests found"
                      description="Try adjusting your search or filter criteria."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-blue-700">{req.id}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{req.requesterOrgName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{req.dataOwnerOrgName}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{req.dataPrincipalName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap max-w-[140px] truncate">
                      {req.purpose}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 tabular-nums whitespace-nowrap">
                      {pluralize(req.fields.length, 'field')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {formatDuration(req.durationDays)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/cm/requests/${req.id}`)}
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {filtered.length} of {requests.length} requests
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
