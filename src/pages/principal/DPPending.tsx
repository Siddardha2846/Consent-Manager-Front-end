import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState, Avatar } from '../../components/common/EmptyState';
import { formatDate } from '../../utils';
import { CheckSquare, Shield, Calendar, FileText } from 'lucide-react';

export function DPPending() {
  const { consents, requests, currentPrincipalId } = useApp();
  const navigate = useNavigate();

  const pending = consents.filter(
    c => c.dataPrincipalId === currentPrincipalId && c.status === 'PENDING'
  );

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Pending Requests</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          These organizations are requesting access to your data. Review each request carefully before deciding.
        </p>
      </div>

      {pending.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CheckSquare className="w-5 h-5" />}
            title="No pending requests"
            description="You have no data requests waiting for your decision. When organizations request access to your data, they will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map(consent => {
            const req = requests.find(r => r.consentId === consent.id);
            return (
              <Card key={consent.id} padding={false}>
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3">
                      <Avatar initials={consent.requesterOrgName.slice(0, 2)} size="lg" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{consent.requesterOrgName}</p>
                        <p className="text-xs text-gray-500">is requesting access to your data</p>
                        <div className="flex items-center gap-1 mt-1">
                          <StatusBadge status="PENDING" size="sm" />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate(`/dp/review/${consent.id}`)}
                    >
                      Review Request
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Purpose</p>
                      <p className="text-sm text-gray-800 mt-0.5 font-medium">{consent.purpose}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Data Owner</p>
                      <p className="text-sm text-gray-800 mt-0.5">{consent.dataOwnerOrgName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Fields</p>
                      <p className="text-sm text-gray-800 mt-0.5">{consent.fields.length} item{consent.fields.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Duration</p>
                      <p className="text-sm text-gray-800 mt-0.5">{req ? `${req.durationDays} days` : '—'}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400">
                      Requested {req ? formatDate(req.createdAt) : '—'} · {consent.id}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
