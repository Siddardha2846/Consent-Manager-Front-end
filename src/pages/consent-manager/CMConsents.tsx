import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchInput, Select } from '../../components/common/FormFields';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils';
import type { ConsentStatus } from '../../types';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Revoked', value: 'REVOKED' },
  { label: 'Expired', value: 'EXPIRED' },
];

export default function CMConsents() {
  const { consents } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return consents.filter((c) => {
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.dataPrincipalName.toLowerCase().includes(q) ||
        c.requesterOrgName.toLowerCase().includes(q) ||
        c.dataOwnerOrgName.toLowerCase().includes(q) ||
        c.purpose.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [consents, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Active Consents</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Monitor all consent records across the platform.
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
            icon={<FileCheck className="w-5 h-5" />}
            title="No consents found"
            description="Try adjusting your search or filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
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
                    Data Owner Org
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fields
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((consent) => (
                  <tr key={consent.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 font-medium">
                      {consent.id}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{consent.dataPrincipalName}</td>
                    <td className="px-4 py-3 text-gray-700">{consent.requesterOrgName}</td>
                    <td className="px-4 py-3 text-gray-700">{consent.dataOwnerOrgName}</td>
                    <td className="px-4 py-3 text-gray-700">{consent.purpose}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
                        {consent.fields.length} field{consent.fields.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(consent.startDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(consent.expiryDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={consent.status as ConsentStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/cm/consents/${consent.id}`)}
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
      </Card>

      {/* Count */}
      {filtered.length > 0 && (
        <p className="text-xs text-gray-500">
          Showing {filtered.length} of {consents.length} consent{consents.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
