import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ExternalLink } from 'lucide-react';
import { ORGANIZATIONS } from '../../data/mockData';
import type { OrgType, OrgStatus } from '../../types';
import { SearchInput, Select } from '../../components/common/FormFields';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, timeAgo } from '../../utils';

// ─── Type-badge helper ───────────────────────────────────────────────────────────

const TYPE_COLORS: Record<OrgType, string> = {
  University: 'bg-blue-50 text-blue-700 ring-blue-200',
  Hospital:   'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Insurance:  'bg-purple-50 text-purple-700 ring-purple-200',
  Government: 'bg-amber-50 text-amber-700 ring-amber-200',
  Corporate:  'bg-gray-100 text-gray-700 ring-gray-200',
};

function OrgTypeBadge({ type }: { type: OrgType }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}
    >
      {type}
    </span>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function CMOrganizations() {
  const navigate = useNavigate();

  const [search, setSearch]     = useState('');
  const [typeFilter, setType]   = useState<string>('All');
  const [statusFilter, setStatus] = useState<string>('All');

  const filtered = useMemo(() => {
    return ORGANIZATIONS.filter(org => {
      const matchesSearch =
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.type.toLowerCase().includes(search.toLowerCase());
      const matchesType   = typeFilter === 'All'   || org.type   === typeFilter;
      const matchesStatus = statusFilter === 'All' || org.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Organizations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {ORGANIZATIONS.length} registered organization{ORGANIZATIONS.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          placeholder="Search by name or type…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sm:w-64"
        />
        <Select
          value={typeFilter}
          onChange={e => setType(e.target.value)}
          className="sm:w-44"
        >
          <option value="All">All Types</option>
          <option value="University">University</option>
          <option value="Hospital">Hospital</option>
          <option value="Insurance">Insurance</option>
          <option value="Government">Government</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          className="sm:w-44"
        >
          <option value="All">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Organization',
                  'Type',
                  'Status',
                  'Users',
                  'Active Requests',
                  'Active Consents',
                  'Last Activity',
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
                  <td colSpan={8} className="px-4 py-0">
                    <EmptyState
                      icon={<Building2 className="w-5 h-5" />}
                      title="No organizations found"
                      description="Try adjusting your search or filter criteria."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(org => (
                  <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{org.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{org.contactEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <OrgTypeBadge type={org.type} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={org.status === 'ACTIVE' ? 'ACTIVE' : 'REVOKED'} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 tabular-nums">{org.userCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 tabular-nums">{org.activeRequests}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 tabular-nums">{org.activeConsents}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{timeAgo(org.lastActivity)}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/cm/organizations/${org.id}`)}
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        View Details
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
              Showing {filtered.length} of {ORGANIZATIONS.length} organizations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
