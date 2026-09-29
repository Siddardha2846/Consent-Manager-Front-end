import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchInput, Select } from '../../components/common/FormFields';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils';
import type { GrantStatus } from '../../types';

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Revoked', value: 'REVOKED' },
  { label: 'Expired', value: 'EXPIRED' },
];

export default function CMGrants() {
  const { grants } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return grants.filter((g) => {
      const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
      const matchesSearch =
        !q ||
        g.id.toLowerCase().includes(q) ||
        g.consentId.toLowerCase().includes(q) ||
        g.dataPrincipalName.toLowerCase().includes(q) ||
        g.requesterOrgName.toLowerCase().includes(q) ||
        g.dataOwnerOrgName.toLowerCase().includes(q) ||
        g.purpose.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [grants, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Access Grants</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          View all active and historical access grants across the platform.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          className="flex-1 max-w-xs"
          placeholder="Search by ID, principal, org, purpose…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          className="w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <Card padding={false}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Key className="w-5 h-5" />}
            title="No grants found"
            description="Try adjusting your search or filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Grant ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Consent ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Data Principal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Requester Org
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Data Owner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fields
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Granted Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((grant) => (
                  <tr key={grant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 font-medium">
                      {grant.id}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/cm/consents/${grant.consentId}`)}
                        className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                      >
                        {grant.consentId}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{grant.dataPrincipalName}</td>
                    <td className="px-4 py-3 text-gray-700">{grant.requesterOrgName}</td>
                    <td className="px-4 py-3 text-gray-700">{grant.dataOwnerOrgName}</td>
                    <td className="px-4 py-3 text-gray-700">{grant.purpose}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
                        {grant.fields.length} field{grant.fields.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(grant.grantedAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(grant.expiryDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={grant.status as GrantStatus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-500">
          Showing {filtered.length} of {grants.length} grant{grants.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
