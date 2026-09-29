import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState, Avatar } from '../../components/common/EmptyState';
import { formatDate } from '../../utils';
import { ShieldCheck, ArrowRight } from 'lucide-react';

type Tab = 'all' | 'ACTIVE' | 'REJECTED' | 'REVOKED' | 'EXPIRED';

export function DPConsents() {
  const { consents, currentPrincipalId } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('ACTIVE');

  const myConsents = consents.filter(c => c.dataPrincipalId === currentPrincipalId);
  const displayed =
    activeTab === 'all' ? myConsents : myConsents.filter(c => c.status === activeTab);

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: 'ACTIVE', label: 'Active', count: myConsents.filter(c => c.status === 'ACTIVE').length },
    { value: 'all', label: 'All', count: myConsents.length },
    { value: 'REVOKED', label: 'Revoked', count: myConsents.filter(c => c.status === 'REVOKED').length },
    { value: 'REJECTED', label: 'Rejected', count: myConsents.filter(c => c.status === 'REJECTED').length },
    { value: 'EXPIRED', label: 'Expired', count: myConsents.filter(c => c.status === 'EXPIRED').length },
  ];

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-lg font-bold text-gray-900">My Consents</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage all consents you have given or been asked about.</p>
      </div>

      <Card padding={false}>
        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.value
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.value ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {displayed.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="w-5 h-5" />}
            title="No consents in this category"
            description="Consents matching this filter will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar initials={consent.requesterOrgName.slice(0, 2)} size="sm" />
                        <span className="font-medium text-gray-900">{consent.requesterOrgName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{consent.purpose}</td>
                    <td className="px-4 py-3 text-gray-500">{consent.fields.length} items</td>
                    <td className="px-4 py-3 text-gray-500">
                      {consent.approvedAt ? formatDate(consent.approvedAt) :
                       consent.rejectedAt ? formatDate(consent.rejectedAt) :
                       formatDate(consent.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={consent.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant={consent.status === 'ACTIVE' ? 'primary' : 'ghost'}
                        onClick={() => navigate(`/dp/consents/${consent.id}`)}
                      >
                        {consent.status === 'ACTIVE' ? 'Manage' : 'View'}
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
