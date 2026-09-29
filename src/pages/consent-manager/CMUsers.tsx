import React, { useState, useMemo } from 'react';
import { Users, Search } from 'lucide-react';
import { USERS, ORGANIZATIONS } from '../../data/mockData';
import { Avatar, EmptyState } from '../../components/common/EmptyState';
import { SearchInput, Select } from '../../components/common/FormFields';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, timeAgo, pluralize } from '../../utils';
import type { UserStatus, UserRole } from '../../types';

// ─── Role badge ──────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<UserRole, { label: string; className: string }> = {
    admin: { label: 'Admin', className: 'bg-purple-50 text-purple-700 ring-purple-200' },
    user: { label: 'User', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
    viewer: { label: 'Viewer', className: 'bg-gray-100 text-gray-600 ring-gray-200' },
  };
  const cfg = map[role] ?? map.viewer;
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── User status badge ────────────────────────────────────────────────────────────

function UserStatusBadge({ status }: { status: UserStatus }) {
  const map: Record<UserStatus, { label: string; className: string }> = {
    ACTIVE: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
    INACTIVE: { label: 'Inactive', className: 'bg-gray-100 text-gray-600 ring-gray-200' },
    INVITED: { label: 'Invited', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  };
  const cfg = map[status];
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function CMUsers() {
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = useMemo(() => {
    return USERS.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.organizationName.toLowerCase().includes(q);
      const matchesOrg = !orgFilter || u.organizationId === orgFilter;
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesOrg && matchesRole;
    });
  }, [search, orgFilter, roleFilter]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pluralize(USERS.length, 'user')} across all organizations
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">{filtered.length} shown</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchInput
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="w-48"
        >
          <option value="">All Organizations</option>
          {ORGANIZATIONS.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </Select>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-36"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="viewer">Viewer</option>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-5 h-5" />}
          title="No users found"
          description="No users match your current filters. Try adjusting the search or filters."
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Organization
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={user.initials} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{user.organizationName}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.joinedDate)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{timeAgo(user.lastActive)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-xs text-gray-400">
          Showing {filtered.length} of {USERS.length} users
        </p>
      )}
    </div>
  );
}
