import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchInput } from '../../components/common/FormFields';
import { formatDate, pluralize } from '../../utils';

const ORG_ID = 'org-college-b';

type TabValue = 'active' | 'all';

const TABS: { label: string; value: TabValue }[] = [
  { label: 'Active Only', value: 'active' },
  { label: 'All Consents', value: 'all' },
];

export default function OrgConsents() {
  const navigate = useNavigate();
  const { consents } = useApp();

  const [tab, setTab] = useState<TabValue>('active');
  const [search, setSearch] = useState('');

  const orgConsents = consents.filter(c => c.requesterOrgId === ORG_ID);

  const filtered = orgConsents.filter(c => {
    const matchesTab = tab === 'all' || c.status === 'ACTIVE';
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.dataPrincipalName.toLowerCase().includes(q) ||
      c.purpose.toLowerCase().includes(q) ||
      c.dataOwnerOrgName.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consents</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Consent records for College B's data access requests
        </p>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {TABS.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={
                tab === t.value
                  ? 'px-4 py-1.5 text-sm font-medium rounded-md bg-white shadow-sm text-gray-900 transition-all'
                  : 'px-4 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:text-gray-800 transition-all'
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <SearchInput
          className="w-64"
          placeholder="Search consents…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {sorted.length === 0 ? (
          <EmptyState
            icon={<FileCheck className="w-5 h-5" />}
            title={
              tab === 'active' ? 'No active consents' : 'No consents found'
            }
            description={
              search
                ? 'No consents match your search.'
                : tab === 'active'
                ? 'There are no active consents at the moment.'
                : "College B doesn't have any consents yet."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Consent ID
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Data Principal
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Data Owner
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Purpose
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Fields
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Start Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Expiry
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map(consent => (
                  <tr key={consent.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {consent.id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {consent.dataPrincipalName}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{consent.dataOwnerOrgName}</td>
                    <td className="px-5 py-3.5 text-gray-600">{consent.purpose}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {pluralize(consent.fields.length, 'field')}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {formatDate(consent.startDate)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {formatDate(consent.expiryDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={consent.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/org/consents/${consent.id}`)}
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
