import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Building2,
  User,
  Target,
  Clock,
  ListChecks,
  CheckCircle2,
  Circle,
  Check,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatDateTime, formatDuration } from '../../utils';
import type { RequestStatus } from '../../types';

// ─── Lifecycle Stage Definition ──────────────────────────────────────────────

type LifecycleStage = {
  key: RequestStatus | 'AWAITING_DECISION';
  label: string;
  description: string;
};

const LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    key: 'PENDING',
    label: 'Request Created',
    description: 'Data request submitted by the organization.',
  },
  {
    key: 'CONSENT_REQUESTED',
    label: 'Consent Requested',
    description: 'Consent request sent to the data principal.',
  },
  {
    key: 'AWAITING_DECISION',
    label: 'Awaiting Decision',
    description: 'Waiting for the data principal to approve or reject.',
  },
  {
    key: 'APPROVED',
    label: 'Consent Approved',
    description: 'Data principal approved the request.',
  },
  {
    key: 'ACTIVE',
    label: 'Access Active',
    description: 'Access grant is active and data is accessible.',
  },
];

// Determine order index for a given status
function getStatusOrder(status: RequestStatus): number {
  const map: Record<RequestStatus | string, number> = {
    PENDING: 0,
    CONSENT_REQUESTED: 1,
    AWAITING_DECISION: 2,
    APPROVED: 3,
    ACTIVE: 4,
    EXPIRED: 4,
    REVOKED: 4,
    REJECTED: 2,
    CANCELLED: 0,
  };
  return map[status] ?? 0;
}

function stageStatus(
  stage: LifecycleStage,
  requestStatus: RequestStatus
): 'completed' | 'current' | 'future' | 'terminal-bad' {
  const order = getStatusOrder(requestStatus);
  const stageMap: Record<string, number> = {
    PENDING: 0,
    CONSENT_REQUESTED: 1,
    AWAITING_DECISION: 2,
    APPROVED: 3,
    ACTIVE: 4,
  };
  const stageOrder = stageMap[stage.key] ?? 0;

  if (requestStatus === 'REJECTED' && stage.key === 'AWAITING_DECISION') return 'terminal-bad';
  if (requestStatus === 'REVOKED' && stage.key === 'ACTIVE') return 'terminal-bad';
  if (requestStatus === 'EXPIRED' && stage.key === 'ACTIVE') return 'completed';

  if (stageOrder < order) return 'completed';
  if (stageOrder === order) return 'current';
  return 'future';
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OrgRequestDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { requests } = useApp();

  const request = requests.find(r => r.id === id);

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
        <h2 className="text-base font-semibold text-gray-700">Request not found</h2>
        <p className="text-sm text-gray-500 mt-1">
          The request <span className="font-mono">{id}</span> does not exist.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/org/requests')}>
          Back to Requests
        </Button>
      </div>
    );
  }

  const effectiveStages =
    request.status === 'REVOKED'
      ? [...LIFECYCLE_STAGES, { key: 'REVOKED' as RequestStatus, label: 'Revoked', description: 'Consent was revoked.' }]
      : request.status === 'EXPIRED'
      ? [...LIFECYCLE_STAGES, { key: 'EXPIRED' as RequestStatus, label: 'Expired', description: 'Access period has ended.' }]
      : request.status === 'REJECTED'
      ? [...LIFECYCLE_STAGES, { key: 'REJECTED' as RequestStatus, label: 'Rejected', description: 'Data principal rejected the request.' }]
      : LIFECYCLE_STAGES;

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/org/requests')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Requests
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 font-mono">{request.id}</h1>
          <StatusBadge status={request.status} />
          <span className="text-sm text-gray-400 ml-auto">
            Created {formatDate(request.createdAt)}
          </span>
        </div>
      </div>

      {/* Rejection banner */}
      {request.status === 'REJECTED' && request.rejectionReason && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-700 mb-0.5">Request Rejected</p>
            <p className="text-red-600">{request.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Request Information */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            Request Information
          </h2>
          <dl className="space-y-3.5">
            <DetailRow
              icon={<Building2 className="w-3.5 h-3.5" />}
              label="Requester"
              value={`${request.requesterName} · ${request.requesterOrgName}`}
            />
            <DetailRow
              icon={<Building2 className="w-3.5 h-3.5" />}
              label="Data Owner"
              value={request.dataOwnerOrgName}
            />
            <DetailRow
              icon={<User className="w-3.5 h-3.5" />}
              label="Data Principal"
              value={request.dataPrincipalName}
            />
            <DetailRow
              icon={<Target className="w-3.5 h-3.5" />}
              label="Purpose"
              value={request.purpose}
            />
            <div className="text-xs text-gray-500 pl-5 -mt-1">{request.purposeDescription}</div>
            <DetailRow
              icon={<Clock className="w-3.5 h-3.5" />}
              label="Duration"
              value={formatDuration(request.durationDays)}
            />
            {request.startDate && (
              <DetailRow
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Start Date"
                value={formatDate(request.startDate)}
              />
            )}
            {request.expiryDate && (
              <DetailRow
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Expiry Date"
                value={formatDate(request.expiryDate)}
              />
            )}
            {request.consentId && (
              <DetailRow
                icon={<Activity className="w-3.5 h-3.5" />}
                label="Consent ID"
                value={
                  <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                    {request.consentId}
                  </span>
                }
              />
            )}
          </dl>
        </Card>

        {/* Right: Requested Fields */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-blue-600" />
            Requested Fields
            <span className="ml-auto text-xs font-normal text-gray-400">
              {request.fields.length} fields
            </span>
          </h2>
          {request.fields.length === 0 ? (
            <p className="text-sm text-gray-400">No fields specified.</p>
          ) : (
            (() => {
              const byCategory = request.fields.reduce<Record<string, typeof request.fields>>(
                (acc, f) => {
                  if (!acc[f.category]) acc[f.category] = [];
                  acc[f.category].push(f);
                  return acc;
                },
                {}
              );
              return (
                <div className="space-y-4">
                  {Object.entries(byCategory).map(([cat, fields]) => (
                    <div key={cat}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {cat}
                      </p>
                      <ul className="space-y-1.5">
                        {fields.map(f => (
                          <li key={f.id} className="flex items-start gap-2 text-sm">
                            <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-medium text-gray-800">{f.name}</span>
                              <span className="text-gray-400 mx-1.5">·</span>
                              <span className="text-gray-500 text-xs">{f.description}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </Card>
      </div>

      {/* Lifecycle Timeline */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Lifecycle Timeline
        </h2>
        <div className="relative pl-5">
          {effectiveStages.map((stage, idx) => {
            const s = stageStatus(stage as LifecycleStage, request.status);
            const isLast = idx === effectiveStages.length - 1;

            let dotClass = '';
            let dotContent: React.ReactNode = null;
            if (s === 'completed') {
              dotClass = 'bg-emerald-500 border-emerald-500';
              dotContent = <Check className="w-3 h-3 text-white" />;
            } else if (s === 'current') {
              dotClass = 'bg-blue-500 border-blue-500';
              dotContent = <span className="w-2 h-2 rounded-full bg-white" />;
            } else if (s === 'terminal-bad') {
              dotClass = 'bg-red-500 border-red-500';
              dotContent = <span className="w-2 h-2 rounded-full bg-white" />;
            } else {
              dotClass = 'bg-white border-gray-300';
              dotContent = <Circle className="w-2 h-2 text-gray-300" />;
            }

            const textColor =
              s === 'completed'
                ? 'text-gray-700'
                : s === 'current'
                ? 'text-blue-700'
                : s === 'terminal-bad'
                ? 'text-red-700'
                : 'text-gray-400';

            // Approximate timestamps
            let timestamp = '';
            if (s === 'completed' || s === 'current') {
              if (stage.key === 'PENDING' || stage.key === 'CONSENT_REQUESTED') {
                timestamp = formatDateTime(request.createdAt);
              } else if (stage.key === 'APPROVED' || stage.key === 'ACTIVE') {
                if (request.startDate) timestamp = formatDateTime(request.startDate);
              } else if (stage.key === 'REJECTED') {
                if (request.updatedAt) timestamp = formatDateTime(request.updatedAt);
              } else if (stage.key === 'EXPIRED' || stage.key === 'REVOKED') {
                if (request.updatedAt) timestamp = formatDateTime(request.updatedAt);
              }
            }

            return (
              <div key={`${stage.key}-${idx}`} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Vertical line */}
                {!isLast && (
                  <div className="absolute left-[-4px] top-5 bottom-0 w-0.5 bg-gray-200" />
                )}

                {/* Dot */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 relative z-10 ml-[-10px] ${dotClass}`}
                >
                  {dotContent}
                </div>

                {/* Content */}
                <div className="flex-1 pb-1">
                  <p className={`text-sm font-semibold ${textColor}`}>{stage.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stage.description}</p>
                  {timestamp && (
                    <p className="text-xs text-gray-400 mt-0.5">{timestamp}</p>
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

// ─── Detail Row Helper ────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <span className="text-gray-500 w-28 shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}
