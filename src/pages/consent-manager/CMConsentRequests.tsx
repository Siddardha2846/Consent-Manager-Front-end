import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, ExternalLink, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ORGANIZATIONS } from '../../data/mockData';
import { Select } from '../../components/common/FormFields';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate, pluralize, timeAgo } from '../../utils';

export default function CMConsentRequests() {
  const navigate = useNavigate();
  const { consents } = useApp();

  const [orgFilter, setOrg] = useState<string>('All');

  const pendingConsents = useMemo(
    () => consents.filter(c => c.status === 'PENDING'),
    [consents]
  );

  const orgOptions = useMemo(
    () => ORGANIZATIONS.map(o => ({ id: o.id, name: o.name })),
    []
  );

  const filtered = useMemo(() => {
    if (orgFilter === 'All') return pendingConsents;
    return pendingConsents.filter(
      c => c.requesterOrgId === orgFilter || c.dataOwnerOrgId === orgFilter
    );
  }, [pendingConsents, orgFilter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pending Consent Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pendingConsents.length} consent request{pendingConsents.length !== 1 ? 's' : ''} awaiting data principal decision
          </p>
        </div>
        {pendingConsents.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">{pendingConsents.length} pending</span>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select
          value={orgFilter}
          onChange={e => setOrg(e.target.value)}
          className="w-56"
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
                  'Consent ID',
                  'Data Principal',
                  'Requester',
                  'Data Owner',
                  'Purpose',
                  'Fields',
                  'Requested',
                  'Status',
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
                  <td colSpan={9} className="px-4 py-0">
                    <EmptyState
                      icon={<CheckSquare className="w-5 h-5" />}
                      title="No pending consent requests"
                      description={
                        orgFilter !== 'All'
                          ? 'No pending consents for the selected organization.'
                          : 'All consent requests have been actioned.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(consent => (
                  <tr key={consent.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-blue-700">{consent.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {consent.dataPrincipalName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {consent.dataOwnerOrgName}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {consent.requesterOrgName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {consent.dataOwnerOrgName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap max-w-[140px] truncate">
                      {consent.purpose}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 tabular-nums whitespace-nowrap">
                      {pluralize(consent.fields.length, 'field')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      <div>
                        <p>{formatDate(consent.createdAt)}</p>
                        <p className="text-xs text-gray-400">{timeAgo(consent.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={consent.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/cm/consents/${consent.id}`)}
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
              Showing {filtered.length} of {pendingConsents.length} pending consent{pendingConsents.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
