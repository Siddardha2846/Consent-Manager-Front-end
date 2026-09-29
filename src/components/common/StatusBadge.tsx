import React from 'react';
import { cn } from '../../utils';
import type { RequestStatus, ConsentStatus, GrantStatus } from '../../types';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Ban,
  Activity,
  Hourglass,
} from 'lucide-react';

type AnyStatus = RequestStatus | ConsentStatus | GrantStatus;

const STATUS_CONFIG: Record<
  AnyStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  PENDING: {
    label: 'Pending',
    icon: <Clock className="w-3.5 h-3.5" />,
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  CONSENT_REQUESTED: {
    label: 'Consent Requested',
    icon: <Hourglass className="w-3.5 h-3.5" />,
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  APPROVED: {
    label: 'Approved',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    className: 'bg-green-50 text-green-700 ring-green-200',
  },
  ACTIVE: {
    label: 'Active',
    icon: <Activity className="w-3.5 h-3.5" />,
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  REJECTED: {
    label: 'Rejected',
    icon: <XCircle className="w-3.5 h-3.5" />,
    className: 'bg-red-50 text-red-700 ring-red-200',
  },
  REVOKED: {
    label: 'Revoked',
    icon: <Ban className="w-3.5 h-3.5" />,
    className: 'bg-gray-100 text-gray-600 ring-gray-200',
  },
  EXPIRED: {
    label: 'Expired',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    className: 'bg-orange-50 text-orange-700 ring-orange-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: <Ban className="w-3.5 h-3.5" />,
    className: 'bg-gray-100 text-gray-600 ring-gray-200',
  },
};

interface StatusBadgeProps {
  status: AnyStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['PENDING'];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium ring-1 ring-inset rounded-full',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
        config.className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
