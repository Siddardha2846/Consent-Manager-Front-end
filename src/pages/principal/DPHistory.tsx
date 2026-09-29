import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState, Avatar } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../utils';
import { Activity } from 'lucide-react';

type Tab = 'all' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';

export function DPHistory() {
  const { consents, currentPrincipalId } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const myConsents = consents.filter(c => c.dataPrincipalId === currentPrincipalId);
  const past = myConsents.filter(c => c.status !== 'PENDING');

  const displayed =
    activeTab === 'all' ? past :
    activeTab === 'APPROVED' ? past.filter(c => c.status === 'ACTIVE') :
    past.filter(c => c.status === activeTab);

  const tabs: { value: Tab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'APPROVED', label: 'Approved / Active' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'REVOKED', label: 'Revoked' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Consent History</h1>
        <p className="text-sm text-gray-500 mt-0.5">A complete record of all data access decisions you have made.</p>
      </div>

      <Card padding={false}>
        <div className="flex border-b border-gray-200 px-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {displayed.length === 0 ? (
          <EmptyState
            icon={<Activity className="w-5 h-5" />}
            title="No history in this category"
            description="Past consent decisions will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Organization</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Purpose</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fields</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayed.map(consent => (
                  <tr key={consent.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{consent.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar initials={consent.requesterOrgName.slice(0, 2)} size="sm" />
                        <span className="text-gray-900">{consent.requesterOrgName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{consent.purpose}</td>
                    <td className="px-4 py-3 text-gray-500">{consent.fields.length}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {consent.approvedAt ? formatDate(consent.approvedAt) :
                       consent.rejectedAt ? formatDate(consent.rejectedAt) :
                       consent.revokedAt ? formatDate(consent.revokedAt) :
                       formatDate(consent.createdAt)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={consent.status} size="sm" /></td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/dp/consents/${consent.id}`)}
                      >
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
    </div>
  );
}
