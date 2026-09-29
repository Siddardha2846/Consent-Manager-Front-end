import React from 'react';
import { Key } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate, pluralize } from '../../utils';

const ORG_ID = 'org-college-b';

export default function OrgGrants() {
  const { grants } = useApp();

  const orgGrants = grants.filter(g => g.requesterOrgId === ORG_ID);

  const sorted = [...orgGrants].sort(
    (a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime()
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Access Grants</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Data access grants issued to College B
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {sorted.length === 0 ? (
          <EmptyState
            icon={<Key className="w-5 h-5" />}
            title="No access grants"
            description="College B doesn't have any access grants yet. Grants are created when a data principal approves a consent request."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Grant ID
                  </th>
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
                    Granted Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Expiry
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map(grant => (
                  <tr key={grant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {grant.id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                        {grant.consentId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {grant.dataPrincipalName}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{grant.dataOwnerOrgName}</td>
                    <td className="px-5 py-3.5 text-gray-600">{grant.purpose}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {pluralize(grant.fields.length, 'field')}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(grant.grantedAt)}</td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(grant.expiryDate)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={grant.status} size="sm" />
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
