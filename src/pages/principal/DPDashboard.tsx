import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState, Avatar } from '../../components/common/EmptyState';
import { formatDate, timeAgo } from '../../utils';
import { CheckSquare, ShieldCheck, Clock, AlertTriangle, FileText, ArrowRight } from 'lucide-react';

export function DPDashboard() {
  const { consents, requests, currentPrincipalId } = useApp();
  const navigate = useNavigate();

  const myConsents = consents.filter(c => c.dataPrincipalId === currentPrincipalId);
  const myRequests = requests.filter(r => r.dataPrincipalId === currentPrincipalId);

  const pending = myConsents.filter(c => c.status === 'PENDING');
  const active = myConsents.filter(c => c.status === 'ACTIVE');
  const revoked = myConsents.filter(c => c.status === 'REVOKED');
  const expiringSoon = myConsents.filter(c => {
    if (c.status !== 'ACTIVE' || !c.expiryDate) return false;
    const diff = new Date(c.expiryDate).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 3600 * 1000;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Your Data, Your Control</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review who is requesting access to your data and manage your consents.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Pending Requests"
          value={pending.length}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          onClick={() => navigate('/dp/pending')}
        />
        <StatCard
          label="Active Consents"
          value={active.length}
          icon={<ShieldCheck className="w-5 h-5" />}
          color="green"
          onClick={() => navigate('/dp/consents')}
        />
        <StatCard
          label="Revoked"
          value={revoked.length}
          icon={<CheckSquare className="w-5 h-5" />}
          color="gray"
          onClick={() => navigate('/dp/history')}
        />
        <StatCard
          label="Expiring Soon"
          value={expiringSoon.length}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          onClick={() => navigate('/dp/consents')}
        />
      </div>

      {/* Pending Requests requiring action */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Requests Requiring Your Decision</h2>
            <p className="text-xs text-gray-500 mt-0.5">Review these requests and decide whether to approve or reject them.</p>
          </div>
          {pending.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => navigate('/dp/pending')}>
              View all
            </Button>
          )}
        </div>
        {pending.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="w-5 h-5" />}
            title="No pending requests"
            description="You have no data requests waiting for your decision."
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {pending.slice(0, 3).map(consent => {
              const req = requests.find(r => r.consentId === consent.id);
              return (
                <div key={consent.id} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar initials={consent.requesterOrgName.slice(0, 2)} size="md" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{consent.requesterOrgName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Purpose: <span className="font-medium text-gray-700">{consent.purpose}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {consent.fields.length} field{consent.fields.length !== 1 ? 's' : ''} requested
                        {req && ` · ${req.durationDays} days`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status="PENDING" size="sm" />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/dp/review/${consent.id}`)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              );
            })}
            {pending.length > 3 && (
              <div className="px-5 py-3 text-center">
                <button
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => navigate('/dp/pending')}
                >
                  View {pending.length - 3} more request{pending.length - 3 !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Active Consents */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Active Consents</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dp/consents')}>
            View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
        {active.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="w-5 h-5" />}
            title="No active consents"
            description="Approved data requests will appear here as active consents."
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {active.slice(0, 3).map(consent => (
              <div key={consent.id} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <Avatar initials={consent.requesterOrgName.slice(0, 2)} size="md" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{consent.requesterOrgName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{consent.purpose}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Expires: {formatDate(consent.expiryDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status="ACTIVE" size="sm" />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/dp/consents/${consent.id}`)}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
