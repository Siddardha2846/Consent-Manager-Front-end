import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Building2,
  Calendar,
  Clock,
  FileCheck,
  Key,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatDateTime } from '../../utils';
import type { ConsentStatus, GrantStatus } from '../../types';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {icon && <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className="text-sm text-gray-900 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

interface TimelineEventProps {
  label: string;
  date: string | undefined;
  active: boolean;
  last?: boolean;
}

function TimelineEvent({ label, date, active, last = false }: TimelineEventProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full border-2 mt-0.5 shrink-0 ${
            active
              ? 'border-blue-600 bg-blue-600'
              : date
              ? 'border-gray-400 bg-gray-400'
              : 'border-gray-300 bg-white'
          }`}
        />
        {!last && (
          <div className={`w-px flex-1 mt-1 ${date ? 'bg-gray-300' : 'bg-gray-200'}`} />
        )}
      </div>
      <div className="pb-5">
        <p className={`text-sm font-medium ${active ? 'text-blue-700' : date ? 'text-gray-900' : 'text-gray-400'}`}>
          {label}
        </p>
        {date ? (
          <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(date)}</p>
        ) : (
          <p className="text-xs text-gray-400 mt-0.5">Not yet</p>
        )}
      </div>
    </div>
  );
}

export default function CMConsentDetail() {
  const { id } = useParams<{ id: string }>();
  const { consents, grants } = useApp();
  const navigate = useNavigate();

  const consent = consents.find((c) => c.id === id);
  const grant = grants.find((g) => g.consentId === id);

  if (!consent) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/cm/consents')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Consents
        </Button>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Consent record not found.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/cm/consents')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Consents
        </Button>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <h1 className="text-xl font-semibold text-gray-900 font-mono">{consent.id}</h1>
          <StatusBadge status={consent.status as ConsentStatus} />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {consent.purpose} · Read-only oversight view
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Consent Info */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-gray-400" />
            Consent Information
          </h2>
          <div>
            <InfoRow
              label="Data Principal"
              value={consent.dataPrincipalName}
              icon={<User className="w-4 h-4" />}
            />
            <InfoRow
              label="Requester Organisation"
              value={consent.requesterOrgName}
              icon={<Building2 className="w-4 h-4" />}
            />
            <InfoRow
              label="Data Owner Organisation"
              value={consent.dataOwnerOrgName}
              icon={<Building2 className="w-4 h-4" />}
            />
            <InfoRow
              label="Purpose"
              value={consent.purpose}
              icon={<ChevronRight className="w-4 h-4" />}
            />
            <InfoRow
              label="Approved Date"
              value={formatDateTime(consent.approvedAt ?? '')}
              icon={<Calendar className="w-4 h-4" />}
            />
            <InfoRow
              label="Start Date"
              value={formatDate(consent.startDate)}
              icon={<Clock className="w-4 h-4" />}
            />
            <InfoRow
              label="Expiry Date"
              value={formatDate(consent.expiryDate)}
              icon={<Clock className="w-4 h-4" />}
            />
            {consent.rejectionReason && (
              <InfoRow
                label="Rejection Reason"
                value={
                  <span className="text-red-600">{consent.rejectionReason}</span>
                }
              />
            )}
            {consent.revocationReason && (
              <InfoRow
                label="Revocation Reason"
                value={
                  <span className="text-orange-600">{consent.revocationReason}</span>
                }
              />
            )}
          </div>
        </Card>

        {/* Right: Fields + Grant */}
        <div className="space-y-4">
          {/* Approved Fields */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-gray-400" />
              Approved Fields ({consent.fields.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {consent.fields.map((field) => (
                <div key={field.id} className="flex flex-col">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200">
                    {field.name}
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5 px-1">{field.category}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Access Grant */}
          {grant && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-400" />
                Access Grant
              </h2>
              <div>
                <InfoRow
                  label="Grant ID"
                  value={<span className="font-mono text-xs">{grant.id}</span>}
                />
                <InfoRow
                  label="Grant Status"
                  value={<StatusBadge status={grant.status as GrantStatus} size="sm" />}
                />
                <InfoRow label="Granted At" value={formatDateTime(grant.grantedAt)} />
                <InfoRow label="Expires" value={formatDate(grant.expiryDate)} />
                {grant.revokedAt && (
                  <InfoRow label="Revoked At" value={formatDateTime(grant.revokedAt)} />
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Lifecycle Timeline */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          Consent Lifecycle
        </h2>
        <div className="pl-2">
          <TimelineEvent
            label="Request Created"
            date={consent.createdAt}
            active={false}
          />
          <TimelineEvent
            label="Consent Sent to Principal"
            date={consent.createdAt}
            active={false}
          />
          {consent.status === 'ACTIVE' && (
            <TimelineEvent
              label="Consent Approved"
              date={consent.approvedAt}
              active={true}
            />
          )}
          {consent.status === 'REJECTED' && (
            <TimelineEvent
              label="Consent Rejected"
              date={consent.rejectedAt}
              active={true}
            />
          )}
          {consent.status === 'REVOKED' && (
            <>
              <TimelineEvent
                label="Consent Approved"
                date={consent.approvedAt}
                active={false}
              />
              <TimelineEvent
                label="Consent Revoked"
                date={consent.revokedAt}
                active={true}
              />
            </>
          )}
          {consent.status === 'PENDING' && (
            <TimelineEvent
              label="Awaiting Principal Response"
              date={undefined}
              active={true}
            />
          )}
          {grant && (
            <TimelineEvent
              label="Access Grant Issued"
              date={grant.grantedAt}
              active={false}
            />
          )}
          <TimelineEvent
            label="Expiry"
            date={consent.expiryDate}
            active={false}
            last={true}
          />
        </div>
      </Card>
    </div>
  );
}
