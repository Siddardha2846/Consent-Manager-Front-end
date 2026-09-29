import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Avatar } from '../../components/common/EmptyState';
import { formatDate, formatDateTime } from '../../utils';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Circle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

type LifecycleStep = {
  label: string;
  description: string;
  statuses: string[];
  timestamp?: string;
};

export function CMRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, consents, grants } = useApp();

  const request = requests.find(r => r.id === id);
  const consent = request?.consentId ? consents.find(c => c.id === request.consentId) : null;
  const grant = consent ? grants.find(g => g.consentId === consent.id) : null;

  if (!request) {
    return (
      <div className="max-w-3xl">
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-gray-900">Request not found</h2>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/cm/requests')}>
              Back to Requests
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Build lifecycle steps
  const steps: LifecycleStep[] = [
    {
      label: 'Request Created',
      description: `Request submitted by ${request.requesterName} from ${request.requesterOrgName}`,
      statuses: ['CONSENT_REQUESTED', 'APPROVED', 'ACTIVE', 'REJECTED', 'REVOKED', 'EXPIRED', 'CANCELLED'],
      timestamp: request.createdAt,
    },
    {
      label: 'Consent Requested',
      description: `Consent request sent to ${request.dataPrincipalName}`,
      statuses: ['CONSENT_REQUESTED', 'APPROVED', 'ACTIVE', 'REJECTED', 'REVOKED', 'EXPIRED'],
      timestamp: request.status !== 'PENDING' ? request.createdAt : undefined,
    },
    {
      label: 'Awaiting Decision',
      description: 'Data principal reviewing the request',
      statuses: ['CONSENT_REQUESTED', 'APPROVED', 'ACTIVE', 'REJECTED', 'REVOKED', 'EXPIRED'],
    },
    {
      label: 'Consent Decision',
      description:
        request.status === 'REJECTED'
          ? `Rejected by ${request.dataPrincipalName}`
          : consent?.status === 'ACTIVE' || consent?.status === 'REVOKED' || consent?.status === 'EXPIRED'
          ? `Approved by ${request.dataPrincipalName}`
          : 'Pending decision',
      statuses: ['APPROVED', 'ACTIVE', 'REJECTED', 'REVOKED', 'EXPIRED'],
      timestamp: consent?.approvedAt ?? consent?.rejectedAt,
    },
    {
      label: 'Access Active',
      description: grant ? `Access grant ${grant.id} is active` : 'Access will become active after consent',
      statuses: ['ACTIVE', 'REVOKED', 'EXPIRED'],
      timestamp: grant?.grantedAt,
    },
    {
      label: 'Revoked / Expired',
      description:
        request.status === 'REVOKED'
          ? 'Consent was revoked by the data principal'
          : request.status === 'EXPIRED'
          ? 'Access period has ended'
          : 'Active until expiry or revocation',
      statuses: ['REVOKED', 'EXPIRED'],
      timestamp: consent?.revokedAt ?? request.expiryDate,
    },
  ];

  const currentStepIndex = (() => {
    switch (request.status) {
      case 'PENDING': return 0;
      case 'CONSENT_REQUESTED': return 2;
      case 'APPROVED':
      case 'ACTIVE': return 4;
      case 'REJECTED': return 3;
      case 'REVOKED':
      case 'EXPIRED': return 5;
      default: return 0;
    }
  })();

  return (
    <div className="max-w-3xl space-y-4">
      {/* Back */}
      <button
        onClick={() => navigate('/cm/requests')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Data Requests
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-gray-900">{request.id}</h1>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Created {formatDateTime(request.createdAt)}</p>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request Information */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Request Information</h2>
          <div className="space-y-3">
            <InfoField label="Requester" value={request.requesterName} sub={request.requesterOrgName} />
            <InfoField label="Data Owner" value={request.dataOwnerOrgName} />
            <InfoField label="Data Principal" value={request.dataPrincipalName} />
            <InfoField label="Purpose" value={request.purpose} sub={request.purposeDescription} />
            <InfoField
              label="Duration"
              value={`${request.durationDays} days`}
              sub={
                request.startDate && request.expiryDate
                  ? `${formatDate(request.startDate)} – ${formatDate(request.expiryDate)}`
                  : undefined
              }
            />
            {request.rejectionReason && (
              <InfoField label="Rejection Reason" value={request.rejectionReason} />
            )}
          </div>
        </Card>

        {/* Requested Fields */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Requested Information</h2>
          <div className="space-y-2">
            {request.fields.map(field => (
              <div key={field.id} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-800">{field.name}</span>
                  <span className="text-xs text-gray-400 ml-2">· {field.category}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-50">
            {request.fields.length} field{request.fields.length !== 1 ? 's' : ''} requested
          </p>
        </Card>
      </div>

      {/* Consent & Grant links */}
      {(consent || grant) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {consent && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Linked Consent</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Consent ID</span>
                  <button
                    className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1"
                    onClick={() => navigate(`/cm/consents/${consent.id}`)}
                  >
                    {consent.id} <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <StatusBadge status={consent.status} size="sm" />
                </div>
                {consent.approvedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Approved</span>
                    <span className="text-xs text-gray-800">{formatDate(consent.approvedAt)}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
          {grant && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Access Grant</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Grant ID</span>
                  <span className="text-xs font-mono text-gray-800">{grant.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <StatusBadge status={grant.status} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Expires</span>
                  <span className="text-xs text-gray-800">{formatDate(grant.expiryDate)}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Lifecycle Timeline */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-800 mb-5">Request Lifecycle</h2>
        <div className="relative">
          {steps.map((step, i) => {
            const isCompleted = request.status === 'REJECTED'
              ? i <= (i === 3 ? 3 : currentStepIndex) && step.statuses.includes(request.status) && i < currentStepIndex
              : i < currentStepIndex && step.statuses.includes(request.status);
            const isCurrent = i === currentStepIndex;
            const isFuture = i > currentStepIndex;
            const isNegative = request.status === 'REJECTED' && i === 3;

            return (
              <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className={`absolute left-[13px] top-7 bottom-0 w-0.5 ${
                    i < currentStepIndex ? 'bg-blue-200' : 'bg-gray-100'
                  }`} />
                )}

                {/* Circle */}
                <div className="shrink-0 z-10">
                  {isCompleted ? (
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  ) : isCurrent ? (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-offset-2 ${
                      isNegative || request.status === 'REJECTED'
                        ? 'bg-red-100 ring-red-400'
                        : 'bg-blue-100 ring-blue-500'
                    }`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        isNegative || request.status === 'REJECTED' ? 'bg-red-500' : 'bg-blue-600'
                      }`} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${
                    isFuture ? 'text-gray-400' : isCurrent ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isFuture ? 'text-gray-300' : 'text-gray-500'}`}>
                    {step.description}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(step.timestamp)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function InfoField({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}
