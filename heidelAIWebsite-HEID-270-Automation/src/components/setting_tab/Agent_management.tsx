'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useUser, useOrganization } from '@clerk/nextjs';
import { Users, Mail, UserPlus, UserMinus, Trash2, X } from 'lucide-react';
import { useApi } from "@/lib/session_api";
import { useRole } from '@/contexts/RoleContext';

interface TeamMember {
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  userId?: string;
}

interface InvitedMember {
  id: string; // Invitation id
  name: string;
  email: string;
  role: 'Admin' | 'Member';
}

export const TeamManagement = () => {
  const { user } = useUser();
  const { organization, memberships, invitations } = useOrganization({
    memberships: {
      infinite: true,
      keepPreviousData: true,
    },
    invitations: true,
  });


  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitationsList, setInvitationsList] = useState<InvitedMember[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; member: TeamMember | null; type: 'member' | 'invitation' }>({
    open: false,
    member: null,
    type: 'member'
  });
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  // const [isAdmin, setIsAdmin] = useState(false);
  const { isAdmin } = useRole();
  const [showTooltip, setShowTooltip] = useState(false);
  const api = useApi();

  React.useEffect(() => {
    if (!memberships?.data) return;
    if (!invitations?.data) return;

    // console.log('Memberships data:', memberships.data);
    // const org = memberships.data.map((m)=> m.organization?.maxAllowedMemberships)
    // console.log('Organization from memberships:', org);


    // Invitations mapping
    const inviteMapped: InvitedMember[] = invitations.data.map((inv) => ({
      id: inv.id,
      invitationId: inv.id,
      name: inv.emailAddress || 'Invited User',
      email: inv.emailAddress || 'No Email',
      role: inv.roleName as 'Admin' | 'Member',
    }));

    // Members mapping
    const mapped: TeamMember[] = memberships.data.map((m) => ({

      name: `${m.publicUserData?.firstName ?? ''} ${m.publicUserData?.lastName ?? ''}`.trim() ||
        m.publicUserData?.identifier || 'Unknown',
      email: m.publicUserData?.identifier ?? 'Unknown',
      role: m.roleName as 'Admin' | 'Member',
      userId: m.publicUserData?.userId,
    }));

    setMembers(mapped);
    setInvitationsList(inviteMapped);

    // const checkRole = async () => {
    //   if (organization && user) {
    //     const memberships = await organization.getMemberships();
    //     const membership = memberships.data.find(
    //       (m) => m.publicUserData?.userId === user.id
    //     );
    //     setIsAdmin(membership?.roleName === "Admin");
    //   }
    // };

    // checkRole();
  }, [memberships?.data, invitations?.data, organization, user]);

  const refreshData = async () => {
    if (!organization) return;
    try {
      const membershipsRes = await organization.getMemberships();
      const mapped: TeamMember[] = membershipsRes.data.map((m) => ({
        id: m.id,
        name: `${m.publicUserData?.firstName ?? ''} ${m.publicUserData?.lastName ?? ''}`.trim() ||
          m.publicUserData?.identifier || 'Unknown',
        email: m.publicUserData?.identifier ?? 'Unknown',
        role: m.roleName as 'Admin' | 'Member',
        userId: m.publicUserData?.userId,
      }));
      setMembers(mapped);

      const invitationsRes = await organization.getInvitations();
      const inviteMapped: InvitedMember[] = invitationsRes.data.map((inv) => ({
        id: inv.id,
        name: inv.emailAddress || 'Invited User',
        email: inv.emailAddress || 'No Email',
        role: inv.roleName as 'Admin' | 'Member',
      }));
      setInvitationsList(inviteMapped);
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  };


  const handleInvite = async () => {
    if (!email) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      const response = await api.post("/api/clerk/invite-agent", {
        email_address: email,
        role: "org:member",
        redirect_url: `${window.location.origin}/accept_invitation`,
      });

      // axios-like clients put payload on response.data; don't call data() as a function
      const resData = response?.data ?? response;
      // prefer checking HTTP status when available
      if (response?.status === 200 || resData?.status === 200 || resData?.ok || resData?.success) {
        toast.success('Team member invited successfully!');
        setIsInviteOpen(false);
        setEmail('');
        await refreshData();
      } else {
        throw new Error(resData?.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error("invite error:", error);
      toast.error('Failed to send invitation. Please try again.');
    }
  };

  const handleRemoveMember = (member: TeamMember) => {
    setDeleteDialog({ open: true, member, type: 'member' });
  };

  const handleRevokeInvitation = (invitation: InvitedMember) => {
    setDeleteDialog({ open: true, member: invitation as InvitedMember, type: 'invitation' });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.member) return;

    try {
      if (deleteDialog.type === 'member') {
        const userId = deleteDialog.member.userId;
        if (!userId) throw new Error('No user id provided for member removal');

        const response = await api.delete(`/api/clerk/delete-member?user_id=${userId}`);

        const resData = response?.data ?? response;
        // console.log('delete-member response:', response);
        // console.log('delete-member data:', resData);

        if (response?.status === 200 || resData?.status === 200 || resData?.ok || resData?.success) {
          setMembers((prev) => prev.filter(m => m.userId !== userId));
          toast.success('Member removed successfully');
          await refreshData();
        } else {
          throw new Error(resData?.error || 'Failed to remove member');
        }
      } else {
        const invitationId = (deleteDialog.member as InvitedMember).id;
        const response = await api.post("/api/clerk/revoke-invite", {
          invitation_id: invitationId,
          requesting_user_id: user?.id,
        });

        const resData = response?.data ?? response;

        if (response?.status === 200 || resData?.status === 200 || resData?.ok || resData?.success) {
          toast.success('Invitation revoked successfully');
          setInvitationsList((prev) => prev.filter(i => i.id !== invitationId));
          await refreshData();
        } else {
          throw new Error(resData?.error || 'Failed to revoke invitation');
        }
      }
    } catch (error) {
      console.error("confirmDelete error:", error);
      toast.error('Failed to remove. Please try again.');
    } finally {
      setDeleteDialog({ open: false, member: null, type: 'member' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get max allowed members (from organization or fallback to 5)
  const maxAllowedMemberships =
    organization?.maxAllowedMemberships ??
    (memberships?.data?.[0]?.organization?.maxAllowedMemberships ?? 5);

  const membersCount = members.length;
  const inviteDisabled = membersCount >= maxAllowedMemberships;

  return (
    <div className="w-full min-h-screen bg-white overflow-hidden">
      <div className="w-full max-w-10xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 rounded-lg flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Team Management
              </h1>
              <p className="text-gray-600 text-sm">
                Manage your team members and invite new collaborators
              </p>
            </div>
          </div>
        </div>


        {/* Stats Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Members</p>
              <p className="text-4xl font-semibold text-gray-900">{members.length}</p>
            </div>
            <div
              onMouseEnter={() => inviteDisabled && setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="relative"
            >
              {isAdmin && (
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className={`flex text-black items-center gap-2 bg-gray-200 px-4 py-2.5 rounded-lg transition-colors font-medium ${inviteDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-500 hover:text-white"
                    }`}
                  disabled={inviteDisabled}
                  id="invite-member-btn"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite Member
                </button>
              )}

              {inviteDisabled && showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap">
                  limit of {maxAllowedMemberships} members for this organization.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invite Modal */}
        {isInviteOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-700" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Invite Team Member</h2>
                </div>
                <button onClick={() => setIsInviteOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">Send an invitation to join your organization</p>
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">An invitation will be sent to this email address</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteDialog.open && (
          <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {deleteDialog.type === 'member' ? 'Remove Team Member' : 'Revoke Invitation'}
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                {deleteDialog.type === 'member'
                  ? `Are you sure you want to remove ${deleteDialog.member?.name} from the team? This action cannot be undone.`
                  : `Are you sure you want to revoke the invitation for ${deleteDialog.member?.email}? They will no longer be able to join using this invitation.`}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  id="cancel-delete"
                  onClick={() => setDeleteDialog({ open: false, type: 'member', member: null })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id={deleteDialog.type === 'member' ? "confirm-remove-member" : "confirm-revoke-invitation"}
                  onClick={confirmDelete}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  {deleteDialog.type === 'member' ? 'Remove' : 'Revoke'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs and Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 px-6 py-4 text-center font-medium text-sm uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'members'
                  ? 'border-gray-900 text-gray-900 bg-gray-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Members
                <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">
                  {members.length}
                </span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('invitations')}
                  className={`flex-1 px-6 py-4 text-center font-medium text-sm uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'invitations'
                    ? 'border-gray-900 text-gray-900 bg-gray-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Invitations
                  <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">
                    {invitationsList.length}
                  </span>
                </button>
              )}

            </div>
          </div>

          {/* Members Table */}
          {activeTab === 'members' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Member</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Email</th>
                    {isAdmin && <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {members.length > 0 ? (
                    members.map((member) => (
                      <tr key={member.userId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${getAvatarColor(member.name)} text-white flex items-center justify-center text-sm font-semibold`}>
                              {getInitials(member.name)}
                            </div>
                            <span className="font-medium text-gray-900">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleRemoveMember(member)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-red-200 rounded-lg transition-colors"
                              >
                                <UserMinus className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 3 : 2} className="px-6 py-12 text-center text-gray-500 text-sm">
                        No team members yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Invitations Table */}
          {activeTab === 'invitations' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Invited User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Email</th>
                    {isAdmin && <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {invitationsList.length > 0 ? (
                    invitationsList.map((invitation) => (
                      <tr key={invitation.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${getAvatarColor(invitation.email)} text-white flex items-center justify-center text-sm font-semibold`}>
                              {getInitials(invitation.name)}
                            </div>
                            <span className="font-medium text-gray-900">{invitation.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{invitation.email}</td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-right">
                            <button
                              id={`revoke-invite-${invitation.id}`}
                              onClick={() => handleRevokeInvitation(invitation)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Revoke
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 3 : 2} className="px-6 py-12 text-center text-gray-500 text-sm">
                        No pending invitations
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;