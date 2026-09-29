import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/FormFields';
import { EmptyState, Avatar } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/Modal';
import { formatDate, timeAgo } from '../../utils';
import { UserPlus, Mail, RefreshCw, X, Send } from 'lucide-react';

export function AdminInvitations() {
  const { invitations, inviteUser, cancelInvitation, resendInvitation, addToast } = useApp();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [emailError, setEmailError] = useState('');
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter to College B invitations
  const myInvitations = invitations.filter(i => i.organizationId === 'org-college-b');

  const handleInvite = async () => {
    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    inviteUser(email, role, 'org-college-b');
    setEmail('');
    setRole('user');
    setEmailError('');
    setLoading(false);
    setShowInviteModal(false);
    addToast(`Invitation sent to ${email}`, 'success');
  };

  const handleResend = (id: string, invEmail: string) => {
    resendInvitation(id);
    addToast(`Invitation resent to ${invEmail}`, 'info');
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    EXPIRED: 'bg-gray-100 text-gray-600 ring-gray-200',
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Invitations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage user invitations for College B.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowInviteModal(true)}>
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </div>

      <Card padding={false}>
        {myInvitations.length === 0 ? (
          <EmptyState
            icon={<Mail className="w-5 h-5" />}
            title="No invitations sent"
            description="Invite team members to join your organization."
            action={
              <Button variant="primary" size="sm" onClick={() => setShowInviteModal(true)}>
                Send Invitation
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Invited By</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myInvitations.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <span className="text-gray-900 font-medium">{inv.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{inv.role}</td>
                    <td className="px-4 py-3 text-gray-500">{inv.invitedBy}</td>
                    <td className="px-4 py-3 text-gray-500">{timeAgo(inv.invitedAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${statusColors[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleResend(inv.id, inv.email)}
                              title="Resend invitation"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Resend
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => setCancelId(inv.id)}
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {inv.status === 'ACCEPTED' && (
                          <span className="text-xs text-gray-400 italic">Accepted</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      <Modal
        open={showInviteModal}
        onClose={() => { setShowInviteModal(false); setEmail(''); setEmailError(''); }}
        title="Invite a New User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowInviteModal(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleInvite} loading={loading}>
              <Send className="w-4 h-4" />
              Send Invitation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            An invitation email will be sent to the user. They can join College B using the invitation link.
          </p>
          <Input
            label="Email address"
            type="email"
            placeholder="user@organization.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(''); }}
            error={emailError}
            required
          />
          <Select
            label="Role"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="user">User — Standard access</option>
            <option value="admin">Administrator — Full access</option>
            <option value="viewer">Viewer — Read-only access</option>
          </Select>
        </div>
      </Modal>

      {/* Cancel Confirm */}
      <ConfirmModal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={() => {
          if (cancelId) {
            cancelInvitation(cancelId);
            addToast('Invitation cancelled.', 'info');
            setCancelId(null);
          }
        }}
        title="Cancel invitation?"
        description="The invitation link will no longer be valid. You can re-invite the user at any time."
        confirmLabel="Cancel Invitation"
        cancelLabel="Keep"
        variant="danger"
      />
    </div>
  );
}
