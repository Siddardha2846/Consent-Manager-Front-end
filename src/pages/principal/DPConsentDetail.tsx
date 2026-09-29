import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmModal } from '../../components/common/Modal';
import { formatDate, formatDateTime } from '../../utils';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Shield,
  ChevronRight,
  AlertTriangle,
  Ban,
} from 'lucide-react';

export function DPConsentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { consents, requests, grants, revokeConsent, addToast, currentPrincipalId } = useApp();

  const consent = consents.find(c => c.id === id);
  const request = consent ? requests.find(r => r.consentId === consent.id) : null;
  const grant = consent ? grants.find(g => g.consentId === consent.id) : null;

  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);

  if (!consent) {
    return (
      <div className="max-w-2xl">
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-gray-900">Consent not found</h2>
            <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>
              Go back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleRevoke = async () => {
    setRevokeLoading(true);
    await new Promise(r => setTimeout(r, 800));
    revokeConsent(consent.id, revokeReason || 'Revoked by data principal');
    setRevokeLoading(false);
    setShowRevokeModal(false);
    addToast('Consent revoked. Access has been terminated.', 'warning');
    navigate('/dp/consents');
  };

  const isActive = consent.status === 'ACTIVE';

  return (
    <div className="max-w-2xl space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Consent Details</h1>
          <p className="text-sm text-gray-500 mt-0.5">{consent.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={consent.status} />
        </div>
      </div>

      {/* Consent Information */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Consent Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Requesting Organization</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{consent.requesterOrgName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Data Owner</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{consent.dataOwnerOrgName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Purpose</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{consent.purpose}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Status</p>
              <div className="mt-0.5">
                <StatusBadge status={consent.status} size="sm" />
              </div>
            </div>
          </div>

          {consent.status === 'ACTIVE' && (
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Access Start</p>
                <p className="text-sm text-gray-900 mt-0.5">{formatDate(consent.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Access Expires</p>
                <p className="text-sm text-gray-900 mt-0.5">{formatDate(consent.expiryDate)}</p>
              </div>
            </div>
          )}

          {consent.approvedAt && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Approved on</p>
              <p className="text-sm text-gray-900 mt-0.5">{formatDateTime(consent.approvedAt)}</p>
            </div>
          )}

          {consent.revokedAt && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Revoked on</p>
              <p className="text-sm text-gray-900 mt-0.5">{formatDateTime(consent.revokedAt)}</p>
              {consent.revocationReason && (
                <p className="text-xs text-gray-500 mt-0.5">Reason: {consent.revocationReason}</p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Approved Fields */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Information Being Shared</h2>
        <div className="space-y-2">
          {consent.fields.map(field => (
            <div key={field.id} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 last:border-0">
              <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-800">{field.name}</span>
                <span className="text-xs text-gray-400 ml-2">·</span>
                <span className="text-xs text-gray-400 ml-1">{field.category}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-50">
          {consent.fields.length} item{consent.fields.length !== 1 ? 's' : ''} of information authorized for sharing
        </p>
      </Card>

      {/* Access Grant Info */}
      {grant && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Access Grant</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 font-medium">Grant ID</p>
              <p className="text-sm text-gray-800 mt-0.5 font-mono text-xs">{grant.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Grant Status</p>
              <div className="mt-0.5"><StatusBadge status={grant.status} size="sm" /></div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Granted On</p>
              <p className="text-sm text-gray-800 mt-0.5">{formatDate(grant.grantedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Expires</p>
              <p className="text-sm text-gray-800 mt-0.5">{formatDate(grant.expiryDate)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Revoke Action */}
      {isActive && (
        <Card>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-50 shrink-0">
              <Ban className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">Revoke Consent</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Revoking this consent will immediately end {consent.requesterOrgName}'s permission to access your data.
                This action cannot be undone.
              </p>
              <Button
                variant="danger"
                size="sm"
                className="mt-3"
                onClick={() => setShowRevokeModal(true)}
              >
                <Ban className="w-3.5 h-3.5" />
                Revoke Consent
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Revoke Modal */}
      <ConfirmModal
        open={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        onConfirm={handleRevoke}
        title="Revoke this consent?"
        confirmLabel="Revoke Consent"
        cancelLabel="Cancel"
        variant="danger"
        loading={revokeLoading}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Revoking this consent will immediately end all data-sharing permissions for this request.{' '}
            <strong>{consent.requesterOrgName}</strong> will no longer have access to your data.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Organization</span>
              <span className="font-medium text-gray-800">{consent.requesterOrgName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Purpose</span>
              <span className="font-medium text-gray-800">{consent.purpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fields</span>
              <span className="font-medium text-gray-800">{consent.fields.length} items</span>
            </div>
            {consent.expiryDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Current Expiry</span>
                <span className="font-medium text-gray-800">{formatDate(consent.expiryDate)}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Reason (optional)
            </label>
            <input
              type="text"
              value={revokeReason}
              onChange={e => setRevokeReason(e.target.value)}
              placeholder="e.g., No longer needed"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}
