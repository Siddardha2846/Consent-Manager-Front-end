import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmModal, Modal } from '../../components/common/Modal';
import { Avatar } from '../../components/common/EmptyState';
import { formatDate } from '../../utils';
import {
  ArrowLeft,
  Building2,
  User,
  FileText,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

const REJECTION_REASONS = [
  'Purpose is not clear to me',
  'Some requested information is not necessary',
  'The access duration is too long',
  'I do not recognize this organization',
  'Other',
];

export function ConsentReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { consents, requests, approveConsent, rejectConsent, addToast, currentPrincipalId } = useApp();

  const consent = consents.find(c => c.id === id);
  const request = consent ? requests.find(r => r.consentId === consent.id) : null;

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  if (!consent) {
    return (
      <div className="max-w-2xl">
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-gray-900">Request not found</h2>
            <p className="text-sm text-gray-500 mt-1">This consent request may no longer exist.</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>
              Go back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (consent.dataPrincipalId !== currentPrincipalId) {
    return (
      <div className="max-w-2xl">
        <Card>
          <div className="text-center py-12">
            <Shield className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-gray-900">Access denied</h2>
            <p className="text-sm text-gray-500 mt-1">This request is not addressed to you.</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>
              Go back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleApprove = async () => {
    setApproveLoading(true);
    await new Promise(r => setTimeout(r, 800));
    approveConsent(consent.id);
    setApproveLoading(false);
    setShowApproveModal(false);
    addToast('Consent approved. Access is now active.', 'success');
    navigate(`/dp/consents/${consent.id}`);
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    setRejectLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const reason = rejectReason === 'Other' && rejectNotes ? rejectNotes : rejectReason;
    rejectConsent(consent.id, reason);
    setRejectLoading(false);
    setShowRejectModal(false);
    addToast('Request rejected.', 'info');
    navigate('/dp/pending');
  };

  const isDecided = consent.status !== 'PENDING';

  return (
    <div className="max-w-2xl space-y-4">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Pending Requests
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Review Data Request</h1>
          <p className="text-sm text-gray-500 mt-0.5">{consent.id}</p>
        </div>
        <StatusBadge status={consent.status} />
      </div>

      {isDecided && (
        <div className={`rounded-lg border px-4 py-3 text-sm flex items-center gap-2 ${
          consent.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
          consent.status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-700' :
          'bg-gray-50 border-gray-200 text-gray-600'
        }`}>
          {consent.status === 'ACTIVE' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {consent.status === 'ACTIVE' ? 'You have approved this request. Access is currently active.' :
           consent.status === 'REJECTED' ? `You rejected this request. Reason: ${consent.rejectionReason}` :
           `This consent is ${consent.status.toLowerCase()}.`}
        </div>
      )}

      {/* Key Information */}
      <Card>
        <div className="space-y-5">
          <InfoRow
            icon={<Building2 className="w-4 h-4 text-gray-400" />}
            label="Who is requesting?"
            value={consent.requesterOrgName}
            sub="Requesting Organization"
          />
          <hr className="border-gray-100" />
          <InfoRow
            icon={<Building2 className="w-4 h-4 text-gray-400" />}
            label="Who owns the data?"
            value={consent.dataOwnerOrgName}
            sub="Data Owner Organization"
          />
          <hr className="border-gray-100" />
          <InfoRow
            icon={<User className="w-4 h-4 text-gray-400" />}
            label="Whose data?"
            value={consent.dataPrincipalName}
            sub="Your data is being requested"
          />
          <hr className="border-gray-100" />
          <InfoRow
            icon={<FileText className="w-4 h-4 text-gray-400" />}
            label="Why is it needed?"
            value={consent.purpose}
            sub={request?.purposeDescription}
          />
          <hr className="border-gray-100" />
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-md bg-gray-50 shrink-0">
              <Shield className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">What information is requested?</p>
              <div className="mt-2 space-y-1.5">
                {consent.fields.map(field => (
                  <div key={field.id} className="flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-800">{field.name}</span>
                      <span className="text-xs text-gray-400 ml-2">({field.category})</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {consent.fields.length} piece{consent.fields.length !== 1 ? 's' : ''} of information requested
              </p>
            </div>
          </div>
          <hr className="border-gray-100" />
          <InfoRow
            icon={<Calendar className="w-4 h-4 text-gray-400" />}
            label="How long?"
            value={request ? `${request.durationDays} days` : 'As specified in request'}
            sub="Access will automatically expire after this period"
          />
        </div>
      </Card>

      {/* Decision */}
      {!isDecided && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Your Decision</h2>
          <p className="text-xs text-gray-500 mb-4">
            Review the information above carefully. Your decision directly controls who can access your data.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setShowRejectModal(true)}
            >
              <XCircle className="w-4 h-4" />
              Reject Request
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={() => setShowApproveModal(true)}
            >
              <CheckCircle className="w-4 h-4" />
              Approve Request
            </Button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            You can revoke this consent at any time after approval.
          </p>
        </Card>
      )}

      {/* Approve Modal */}
      <ConfirmModal
        open={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve this data request?"
        confirmLabel="Confirm Approval"
        cancelLabel="Cancel"
        variant="primary"
        loading={approveLoading}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            You are approving access for <strong>{consent.requesterOrgName}</strong> to the following information:
          </p>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="text-xs text-gray-500 font-medium">Purpose</div>
            <div className="text-sm text-gray-800">{consent.purpose}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="text-xs text-gray-500 font-medium">Fields</div>
            <div className="text-sm text-gray-800">{consent.fields.map(f => f.name).join(', ')}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="text-xs text-gray-500 font-medium">Duration</div>
            <div className="text-sm text-gray-800">{request ? `${request.durationDays} days` : 'As specified'}</div>
          </div>
        </div>
      </ConfirmModal>

      {/* Reject Modal */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject this request?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRejectModal(false)} disabled={rejectLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={!rejectReason}
              loading={rejectLoading}
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please let us know why you are rejecting this request. This helps the requesting organization understand your decision.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <div className="space-y-2">
              {REJECTION_REASONS.map(reason => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reject-reason"
                    value={reason}
                    checked={rejectReason === reason}
                    onChange={() => setRejectReason(reason)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>
          </div>
          {rejectReason === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional notes</label>
              <textarea
                rows={3}
                value={rejectNotes}
                onChange={e => setRejectNotes(e.target.value)}
                placeholder="Describe your reason…"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 rounded-md bg-gray-50 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
