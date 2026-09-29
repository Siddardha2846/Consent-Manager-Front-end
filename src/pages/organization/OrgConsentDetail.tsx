import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Building2,
  Target,
  Database,
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  Activity,
  Ban,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { cn, formatDate, formatDateTime } from '../../utils';

// ─── Lifecycle Timeline ──────────────────────────────────────────────────────────

type Step = {
  label: string;
  description: string;
  timestamp?: string;
};

function getStepIndex(status: string): number {
  switch (status) {
    case 'PENDING':
      return 1;
    case 'ACTIVE':
      return 2;
    case 'REVOKED':
    case 'EXPIRED':
    case 'REJECTED':
      return 3;
    default:
      return 0;
  }
}

function Timeline({ steps, currentIndex }: { steps: Step[]; currentIndex: number }) {
  return (
    <div className="relative">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
            {/* Vertical connector */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'absolute left-3.5 top-7 bottom-0 w-px',
                  done ? 'bg-emerald-300' : 'bg-gray-200'
                )}
              />
            )}
            {/* Node */}
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10',
                done
                  ? 'bg-emerald-500 text-white'
                  : active
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-100 text-gray-400'
              )}
            >
              {done ? (
                <CheckCircle className="w-4 h-4" />
              ) : active ? (
                <Activity className="w-4 h-4" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
            </div>
            {/* Content */}
            <div className="flex-1 pt-0.5">
              <p
                className={cn(
                  'text-sm font-medium',
                  done ? 'text-gray-700' : active ? 'text-blue-700' : 'text-gray-400'
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              {step.timestamp && (
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(step.timestamp)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Info section row ────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-900 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function OrgConsentDetail() {
  const { id } = useParams<{ id: string }>();
  const { consents, grants } = useApp();
  const navigate = useNavigate();

  const consent = useMemo(() => consents.find((c) => c.id === id), [consents, id]);
  const grant = useMemo(
    () => grants.find((g) => g.consentId === id && g.status === 'ACTIVE'),
    [grants, id]
  );

  if (!consent) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Shield className="w-5 h-5" />}
          title="Consent not found"
          description="This consent record does not exist or you do not have access to it."
          action={
            <Button variant="secondary" size="sm" onClick={() => navigate('/org/consents')}>
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Consents
            </Button>
          }
        />
      </div>
    );
  }

  // Build timeline steps
  const finalLabel =
    consent.status === 'REVOKED'
      ? 'Consent Revoked'
      : consent.status === 'EXPIRED'
      ? 'Access Expired'
      : consent.status === 'REJECTED'
      ? 'Consent Rejected'
      : 'Revoked / Expired';

  const finalTs =
    consent.revokedAt ?? consent.rejectedAt ?? (consent.status === 'EXPIRED' ? consent.expiryDate : undefined);

  const steps: Step[] = [
    {
      label: 'Request Submitted',
      description: 'Data access request created by College B.',
      timestamp: consent.createdAt,
    },
    {
      label: 'Consent Approved',
      description: `${consent.dataPrincipalName} reviewed and approved the consent.`,
      timestamp: consent.approvedAt,
    },
    {
      label: 'Access Active',
      description: 'Data access grant is live and active.',
      timestamp: consent.approvedAt,
    },
    {
      label: finalLabel,
      description:
        consent.status === 'REVOKED'
          ? consent.revocationReason
            ? `Reason: ${consent.revocationReason}`
            : 'Consent was revoked by the data principal.'
          : consent.status === 'EXPIRED'
          ? 'The consent period has ended.'
          : consent.status === 'REJECTED'
          ? consent.rejectionReason ?? 'Consent was rejected.'
          : 'Consent will end when revoked or expired.',
      timestamp: finalTs,
    },
  ];

  const currentStepIndex = (() => {
    switch (consent.status) {
      case 'PENDING':
        return 0;
      case 'ACTIVE':
        return 2;
      case 'REVOKED':
      case 'EXPIRED':
      case 'REJECTED':
        return 3;
      default:
        return 0;
    }
  })();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{consent.id}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{consent.purpose}</p>
        </div>
        <StatusBadge status={consent.status} />
      </div>

      {/* Info notice: read-only */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>Only the data principal can revoke this consent.</span>
      </div>

      {/* Main info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Parties
          </h3>
          <InfoRow
            icon={<User className="w-4 h-4" />}
            label="Data Principal"
            value={consent.dataPrincipalName}
          />
          <InfoRow
            icon={<Building2 className="w-4 h-4" />}
            label="Data Owner"
            value={consent.dataOwnerOrgName}
          />
          <InfoRow
            icon={<Building2 className="w-4 h-4" />}
            label="Requester"
            value={consent.requesterOrgName}
          />
        </Card>

        <Card>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Duration
          </h3>
          <InfoRow
            icon={<Target className="w-4 h-4" />}
            label="Purpose"
            value={consent.purpose}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4" />}
            label="Start Date"
            value={consent.startDate ? formatDate(consent.startDate) : '—'}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4" />}
            label="Expiry Date"
            value={consent.expiryDate ? formatDate(consent.expiryDate) : '—'}
          />
        </Card>
      </div>

      {/* Fields */}
      <Card>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Requested Fields
        </h3>
        <div className="flex flex-wrap gap-2">
          {consent.fields.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-sm"
            >
              <Database className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-700 font-medium">{f.name}</span>
              <span className="text-gray-400 text-xs">· {f.category}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Active grant section */}
      {consent.status === 'ACTIVE' && grant && (
        <Card>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Active Access Grant
          </h3>
          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800">Grant {grant.id}</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Granted {formatDate(grant.grantedAt)} · Expires {formatDate(grant.expiryDate)}
              </p>
            </div>
            <StatusBadge status={grant.status} size="sm" />
          </div>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Consent Lifecycle
        </h3>
        <Timeline steps={steps} currentIndex={currentStepIndex} />
      </Card>
    </div>
  );
}
