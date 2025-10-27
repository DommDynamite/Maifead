import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToastStore } from '../stores/toastStore';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9375rem;
`;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'success' }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $variant, theme }) => {
    if ($variant === 'danger') {
      return `
        background: ${theme.colors.error};
        color: white;
        &:hover {
          opacity: 0.9;
        }
      `;
    }
    if ($variant === 'success') {
      return `
        background: ${theme.colors.success};
        color: white;
        &:hover {
          opacity: 0.9;
        }
      `;
    }
    return `
      background: ${theme.colors.primary};
      color: white;
      &:hover {
        opacity: 0.9;
      }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const Td = styled.td`
  padding: 0.75rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;

  ${({ $status, theme }) => {
    if ($status === 'active') {
      return `
        background: ${theme.colors.success}20;
        color: ${theme.colors.success};
      `;
    }
    if ($status === 'pending') {
      return `
        background: ${theme.colors.warning}20;
        color: ${theme.colors.warning};
      `;
    }
    if ($status === 'banned') {
      return `
        background: ${theme.colors.error}20;
        color: ${theme.colors.error};
      `;
    }
    return '';
  }}
`;

const RoleBadge = styled.span<{ $role: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SmallButton = styled.button<{ $variant?: 'danger' | 'success' }>`
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $variant, theme }) => {
    if ($variant === 'danger') {
      return `
        background: ${theme.colors.error}20;
        color: ${theme.colors.error};
        &:hover {
          background: ${theme.colors.error}30;
        }
      `;
    }
    if ($variant === 'success') {
      return `
        background: ${theme.colors.success}20;
        color: ${theme.colors.success};
        &:hover {
          background: ${theme.colors.success}30;
        }
      `;
    }
    return `
      background: ${theme.colors.primary}20;
      color: ${theme.colors.primary};
      &:hover {
        background: ${theme.colors.primary}30;
      }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const InviteCodesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InviteCodeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const InviteCode = styled.code`
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary}10;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
`;

const InviteCodeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InviteCodeMeta = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: 'admin' | 'user';
  status: 'active' | 'pending' | 'banned';
  createdAt: Date;
}

interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  usedBy: string | null;
  createdAt: Date;
  usedAt: Date | null;
  expiresAt: Date | null;
  inviteUrl?: string;
}

export const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [users, setUsers] = useState<User[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (!user || user.role !== 'admin') {
      navigate('/profile');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResponse, codesResponse] = await Promise.all([
        api.getUsers(),
        api.getInviteCodes(),
      ]);
      setUsers(usersResponse.users);
      setInviteCodes(codesResponse.inviteCodes);
    } catch (error) {
      console.error('Error loading admin data:', error);
      addToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await api.approveUser(userId);
      addToast('User approved successfully', 'success');
      await loadData();
    } catch (error) {
      console.error('Error approving user:', error);
      addToast('Failed to approve user', 'error');
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      await api.banUser(userId);
      addToast('User banned successfully', 'success');
      await loadData();
    } catch (error) {
      console.error('Error banning user:', error);
      addToast('Failed to ban user', 'error');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await api.unbanUser(userId);
      addToast('User unbanned successfully', 'success');
      await loadData();
    } catch (error) {
      console.error('Error unbanning user:', error);
      addToast('Failed to unban user', 'error');
    }
  };

  const handleGenerateInviteCode = async () => {
    try {
      await api.generateInviteCode();
      addToast('Invite code generated successfully', 'success');
      await loadData();
    } catch (error) {
      console.error('Error generating invite code:', error);
      addToast('Failed to generate invite code', 'error');
    }
  };

  const handleDeleteInviteCode = async (codeId: string) => {
    try {
      await api.deleteInviteCode(codeId);
      addToast('Invite code deleted successfully', 'success');
      await loadData();
    } catch (error) {
      console.error('Error deleting invite code:', error);
      addToast('Failed to delete invite code', 'error');
    }
  };

  const handleCopyInviteLink = (inviteUrl: string) => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      addToast('Invite link copied to clipboard', 'success');
    }).catch(() => {
      addToast('Failed to copy invite link', 'error');
    });
  };

  const pendingUsers = users.filter((u) => u.status === 'pending');
  const activeUsers = users.filter((u) => u.status === 'active');
  const bannedUsers = users.filter((u) => u.status === 'banned');
  const unusedInviteCodes = inviteCodes.filter((c) => !c.usedBy);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Admin Panel</PageTitle>
        <PageDescription>
          Manage users, approve signups, and generate invite codes
        </PageDescription>
      </PageHeader>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>Pending Signups ({pendingUsers.length})</SectionTitle>
          </SectionHeader>
          <Table>
            <Thead>
              <Tr>
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Display Name</Th>
                <Th>Signed Up</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pendingUsers.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.username}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.displayName}</Td>
                  <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <ActionButtons>
                      <SmallButton
                        $variant="success"
                        onClick={() => handleApproveUser(user.id)}
                      >
                        Approve
                      </SmallButton>
                      <SmallButton
                        $variant="danger"
                        onClick={() => handleBanUser(user.id)}
                      >
                        Reject
                      </SmallButton>
                    </ActionButtons>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Section>
      )}

      {/* Invite Codes */}
      <Section>
        <SectionHeader>
          <SectionTitle>Invite Codes</SectionTitle>
          <Button onClick={handleGenerateInviteCode}>
            Generate Invite Code
          </Button>
        </SectionHeader>
        {unusedInviteCodes.length === 0 ? (
          <EmptyState>
            No active invite codes. Generate one to allow pre-approved signups.
          </EmptyState>
        ) : (
          <InviteCodesList>
            {unusedInviteCodes.map((code) => (
              <InviteCodeItem key={code.id}>
                <InviteCodeInfo>
                  <InviteCode>{code.code}</InviteCode>
                  <InviteCodeMeta>
                    Created {new Date(code.createdAt).toLocaleDateString()}
                    {code.expiresAt &&
                      ` • Expires ${new Date(code.expiresAt).toLocaleDateString()}`}
                  </InviteCodeMeta>
                </InviteCodeInfo>
                <ActionButtons>
                  <SmallButton
                    onClick={() => handleCopyInviteLink(code.inviteUrl || `${window.location.origin}/auth?invite=${code.code}`)}
                  >
                    Copy Link
                  </SmallButton>
                  <SmallButton
                    $variant="danger"
                    onClick={() => handleDeleteInviteCode(code.id)}
                  >
                    Delete
                  </SmallButton>
                </ActionButtons>
              </InviteCodeItem>
            ))}
          </InviteCodesList>
        )}
      </Section>

      {/* Active Users */}
      <Section>
        <SectionHeader>
          <SectionTitle>Active Users ({activeUsers.length})</SectionTitle>
        </SectionHeader>
        {activeUsers.length === 0 ? (
          <EmptyState>No active users yet.</EmptyState>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Display Name</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {activeUsers.map((u) => (
                <Tr key={u.id}>
                  <Td>{u.username}</Td>
                  <Td>{u.email}</Td>
                  <Td>{u.displayName}</Td>
                  <Td>
                    <RoleBadge $role={u.role}>
                      {u.role}
                    </RoleBadge>
                  </Td>
                  <Td>
                    <StatusBadge $status={u.status}>
                      {u.status}
                    </StatusBadge>
                  </Td>
                  <Td>
                    {u.id !== user.id && (
                      <SmallButton
                        $variant="danger"
                        onClick={() => handleBanUser(u.id)}
                      >
                        Ban User
                      </SmallButton>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Section>

      {/* Banned Users */}
      {bannedUsers.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>Banned Users ({bannedUsers.length})</SectionTitle>
          </SectionHeader>
          <Table>
            <Thead>
              <Tr>
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Display Name</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bannedUsers.map((u) => (
                <Tr key={u.id}>
                  <Td>{u.username}</Td>
                  <Td>{u.email}</Td>
                  <Td>{u.displayName}</Td>
                  <Td>
                    <StatusBadge $status={u.status}>
                      {u.status}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <SmallButton
                      $variant="success"
                      onClick={() => handleUnbanUser(u.id)}
                    >
                      Unban
                    </SmallButton>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Section>
      )}
    </PageContainer>
  );
};
