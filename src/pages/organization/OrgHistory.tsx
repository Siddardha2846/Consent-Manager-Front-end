import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Eye, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { cn, formatDate, pluralize } from '../../utils';
import type { ConsentStatus } from '../../types';

// ─── Types ───────────────────────────────────────────────────────────────────────

type Tab = 'all' | 'approved' | 'rejected' | 'revoked' | 'expired';

const TABS: { key: Tab; label: string; status?: ConsentStatus }[] = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved', status: 'ACTIVE' },
  { key: 'rejected', label: 'Rejected', status: 'REJECTED' },
  { key: 'revoked', label: 'Revoked', status: 'REVOKED' },
  { key: 'expired', label: 'Expired', status: 'EXPIRED' },
];

// ─── Component ──────────────────────────────────────────────────────────────────

export default function OrgHistory() {
  const { consents } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('all');

  // College B consents (requester)
  const collegeBConsents = useMemo(
    () => consents.filter((c) => c.requesterOrgId === 'org-college-b'),
    [consents]
  );

  const filtered = useMemo(() => {
    if (activeTab === 'all') return collegeBConsents;
    const tab = TABS.find((t) => t.key === activeTab);
    return collegeBConsents.filter((c) => c.status === tab?.status);
  }, [collegeBConsents, activeTab]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Consent History</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          All consent records for College B — {pluralize(collegeBConsents.length, 'record')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => {
          const count =
            tab.key === 'all'
              ? collegeBConsents.length
              : collegeBConsents.filter((c) => c.status === tab.status).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150',
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              )}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={cn(
                    'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<History className="w-5 h-5" />}
          title={`No ${activeTab === 'all' ? 'consent records' : `${activeTab} consents`}`}
          description={
            activeTab === 'all'
              ? 'Consent records will appear here once data requests are submitted.'
              : `No consents with ${activeTab} status found.`
          }
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Consent ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Data Principal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Purpose
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Fields
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((consent) => (
                <tr key={consent.id} className="hover:bg-gray-50 transition-colors duration-100">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{consent.id}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {consent.dataPrincipalName}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{consent.purpose}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {consent.fields.slice(0, 2).map((f) => (
                        <span
                          key={f.id}
                          className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                        >
                          {f.name}
                        </span>
                      ))}
                      {consent.fields.length > 2 && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                          +{consent.fields.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatDate(consent.approvedAt ?? consent.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={consent.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/org/consents/${consent.id}`)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record count footer */}
      {filtered.length > 0 && (
        <p className="text-xs text-gray-400">
          Showing {filtered.length} of {collegeBConsents.length} records
        </p>
      )}
    </div>
  );
}
