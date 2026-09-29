import React from 'react';
import { Card, StatCard } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ORGANIZATIONS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { Building2, Users, ShieldCheck, FileText, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { formatDate } from '../../utils';

export function AdminOrganization() {
  const { requests, consents } = useApp();
  const org = ORGANIZATIONS.find(o => o.id === 'org-college-b')!;

  const activeRequests = requests.filter(
    r => r.requesterOrgId === 'org-college-b' && (r.status === 'ACTIVE' || r.status === 'CONSENT_REQUESTED')
  ).length;
  const activeConsents = consents.filter(
    c => c.requesterOrgId === 'org-college-b' && c.status === 'ACTIVE'
  ).length;

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Organization Details</h1>
        <p className="text-sm text-gray-500 mt-0.5">Information about College B on the Consent Manager platform.</p>
      </div>

      {/* Org Header Card */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{org.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{org.type}</p>
              </div>
              <StatusBadge status={org.status === 'ACTIVE' ? 'ACTIVE' : 'REVOKED'} />
            </div>
            <p className="text-sm text-gray-600 mt-2">{org.description}</p>
            <p className="text-xs text-gray-400 mt-1">Member since {formatDate(org.joinedDate)}</p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={org.userCount}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Active Requests"
          value={activeRequests}
          icon={<FileText className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          label="Active Consents"
          value={activeConsents}
          icon={<ShieldCheck className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Status"
          value={org.status}
          icon={<Building2 className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Contact Information */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Contact Information</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Email</p>
              <p className="text-sm text-gray-800">{org.contactEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Phone</p>
              <p className="text-sm text-gray-800">{org.contactPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Address</p>
              <p className="text-sm text-gray-800">{org.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Joined Platform</p>
              <p className="text-sm text-gray-800">{formatDate(org.joinedDate)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Platform Note */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
        <p className="text-xs text-blue-700 font-medium">Organization Details</p>
        <p className="text-xs text-blue-600 mt-0.5">
          To update organization information or request status changes, contact the Consent Manager platform administrator.
        </p>
      </div>
    </div>
  );
}
