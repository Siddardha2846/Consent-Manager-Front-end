import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Eye } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/FormFields';
import { EmptyState, Avatar } from '../../components/common/EmptyState';
import { USERS } from '../../data/mockData';
import { formatDate } from '../../utils';

const ORG_ID = 'org-college-b';

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700 ring-purple-200',
  user: 'bg-blue-50 text-blue-700 ring-blue-200',
  viewer: 'bg-gray-100 text-gray-600 ring-gray-200',
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  INACTIVE: 'bg-gray-100 text-gray-600 ring-gray-200',
  INVITED: 'bg-amber-50 text-amber-700 ring-amber-200',
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const orgUsers = USERS.filter((u) => u.organizationId === ORG_ID);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return orgUsers;
    return orgUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [orgUsers, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage members of College B.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/admin/invitations')}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          Invite User
        </Button>
      </div>

      {/* Search */}
      <SearchInput
        className="max-w-xs"
        placeholder="Search by name, email, role…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <Card padding={false}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-5 h-5" />}
            title="No users found"
            description="Try adjusting your search or invite a new user."
            action={
              <Button variant="primary" size="sm" onClick={() => navigate('/admin/invitations')}>
                <UserPlus className="w-4 h-4 mr-1" />
                Invite User
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={user.initials} size="sm" />
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset capitalize ${
                          ROLE_BADGE[user.role] ?? ROLE_BADGE['user']
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${
                          STATUS_BADGE[user.status] ?? STATUS_BADGE['INACTIVE']
                        }`}
                      >
                        {user.status.charAt(0) + user.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(user.joinedDate)}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-500">
          {filtered.length} user{filtered.length !== 1 ? 's' : ''} in College B
        </p>
      )}
    </div>
  );
}
