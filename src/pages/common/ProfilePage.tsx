import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Shield, Building2, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/EmptyState';
import { formatDate } from '../../utils';
import type { Role } from '../../types';

// ─── Per-role profile definitions ───────────────────────────────────────────────

interface ProfileInfo {
  name: string;
  initials: string;
  email: string;
  role: string;
  organization: string;
  memberSince: string;
}

function getProfile(currentRole: Role): ProfileInfo {
  switch (currentRole) {
    case 'org-user':
      return {
        name: 'Ananya Krishnan',
        initials: 'AK',
        email: 'ananya.k@collegeb.edu',
        role: 'Organization User',
        organization: 'College B',
        memberSince: '2025-02-20T00:00:00Z',
      };
    case 'data-principal':
      return {
        name: 'Rahul Kumar',
        initials: 'RK',
        email: 'rahul.kumar@email.com',
        role: 'Data Principal',
        organization: 'College A (student)',
        memberSince: '2024-07-01T00:00:00Z',
      };
    case 'consent-manager':
      return {
        name: 'Platform Administrator',
        initials: 'PA',
        email: 'admin@depa-platform.in',
        role: 'Consent Manager',
        organization: 'DEPA Platform',
        memberSince: '2025-01-01T00:00:00Z',
      };
    case 'org-admin':
      return {
        name: 'Meera Iyer',
        initials: 'MI',
        email: 'meera.i@collegeb.edu',
        role: 'Organization Admin',
        organization: 'College B',
        memberSince: '2025-02-20T00:00:00Z',
      };
  }
}

// ─── Info row ────────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { currentRole, logout } = useApp();
  const navigate = useNavigate();
  const profile = getProfile(currentRole);

  function handleSignOut() {
    logout();
    navigate('/login');
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your account information</p>
      </div>

      {/* Avatar + name card */}
      <Card>
        <div className="flex flex-col items-center py-4 gap-3">
          <Avatar initials={profile.initials} size="lg" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.role}</p>
          </div>
        </div>
      </Card>

      {/* Details card */}
      <Card>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
          Account Details
        </h3>
        <InfoRow
          icon={<User className="w-4 h-4" />}
          label="Full Name"
          value={profile.name}
        />
        <InfoRow
          icon={<Mail className="w-4 h-4" />}
          label="Email Address"
          value={profile.email}
        />
        <InfoRow
          icon={<Shield className="w-4 h-4" />}
          label="Role"
          value={profile.role}
        />
        <InfoRow
          icon={<Building2 className="w-4 h-4" />}
          label="Organization"
          value={profile.organization}
        />
        <InfoRow
          icon={<Calendar className="w-4 h-4" />}
          label="Member Since"
          value={formatDate(profile.memberSince)}
        />
      </Card>

      {/* Sign out */}
      <div className="pt-2">
        <Button variant="danger" className="w-full" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
