import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Edit2, Trash2, Save, X, AlertTriangle, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing[6]};
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing[8]};
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.fontSizes.base};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const AdminButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: white;
  background: ${props => props.theme.colors.primary};
  border: none;
  border-radius: ${props => props.theme.borderRadius.base};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Section = styled.section`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[6]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.primary};
  background: transparent;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.base};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primary}10;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[4]};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.textSecondary};
`;

const Value = styled.div`
  font-size: ${props => props.theme.fontSizes.base};
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.base};
  border: 1px solid ${props => props.theme.colors.border};
`;

const Input = styled.input`
  font-size: ${props => props.theme.fontSizes.base};
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const ErrorMessage = styled.span`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.error};
  margin-top: -${props => props.theme.spacing[1]};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[6]};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  border: none;
  border-radius: ${props => props.theme.borderRadius.base};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  ${props => {
    if (props.$variant === 'danger') {
      return `
        color: white;
        background: ${props.theme.colors.error};
        &:hover:not(:disabled) {
          background: ${props.theme.colors.error}dd;
        }
      `;
    }
    if (props.$variant === 'secondary') {
      return `
        color: ${props.theme.colors.text};
        background: ${props.theme.colors.surface};
        border: 1px solid ${props.theme.colors.border};
        &:hover:not(:disabled) {
          background: ${props.theme.colors.surfaceHover};
        }
      `;
    }
    return `
      color: white;
      background: ${props.theme.colors.primary};
      &:hover:not(:disabled) {
        background: ${props.theme.colors.primaryHover};
      }
    `;
  }}

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DangerZone = styled.div`
  border: 2px solid ${props => props.theme.colors.error}40;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.error}05;
`;

const DangerTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.error};
  margin: 0 0 ${props => props.theme.spacing[3]} 0;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const DangerDescription = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 ${props => props.theme.spacing[4]} 0;
  line-height: ${props => props.theme.lineHeights.normal};
`;

// Confirmation Modal
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
  padding: ${props => props.theme.spacing[4]};
`;

const Modal = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[6]};
  max-width: 500px;
  width: 100%;
  box-shadow: ${props => props.theme.shadows.xl};
  border: 1px solid ${props => props.theme.colors.border};
`;

const ModalTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing[3]} 0;
`;

const ModalDescription = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 ${props => props.theme.spacing[6]} 0;
  line-height: ${props => props.theme.lineHeights.normal};
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  justify-content: flex-end;
`;

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuthStore();
  const { addToast } = useToastStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    navigate('/auth');
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      displayName: user.displayName,
      username: user.username,
      email: user.email,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setFormData({
      displayName: user.displayName,
      username: user.username,
      email: user.email,
    });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    updateProfile({
      displayName: formData.displayName,
      username: formData.username,
      email: formData.email,
    });

    setIsEditing(false);
    addToast('Profile updated successfully!', 'success');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = () => {
    // In a real app, you would call an API to delete the account
    // For now, we'll just clear the mock users and log out
    const mockUsers = JSON.parse(localStorage.getItem('maifead-mock-users') || '[]');
    const updatedUsers = mockUsers.filter((u: any) => u.id !== user.id);
    localStorage.setItem('maifead-mock-users', JSON.stringify(updatedUsers));

    logout();
    addToast('Account deleted successfully', 'info');
    navigate('/auth');
  };

  const handleLogout = () => {
    logout();
    addToast('Signed out successfully', 'info');
    navigate('/auth');
  };

  return (
    <PageContainer>
      <Header>
        <HeaderTop>
          <HeaderText>
            <Title>Profile Settings</Title>
            <Subtitle>Manage your account information and preferences</Subtitle>
          </HeaderText>
          {user.role === 'admin' && (
            <AdminButton onClick={() => navigate('/admin')}>
              <Shield />
              Admin Panel
            </AdminButton>
          )}
        </HeaderTop>
      </Header>

      <Section>
        <SectionHeader>
          <SectionTitle>Personal Information</SectionTitle>
          {!isEditing && (
            <EditButton onClick={handleEdit}>
              <Edit2 />
              Edit Profile
            </EditButton>
          )}
        </SectionHeader>

        <InfoGrid>
          <InfoItem>
            <Label htmlFor="displayName">Display Name</Label>
            {isEditing ? (
              <>
                <Input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={e => handleInputChange('displayName', e.target.value)}
                  placeholder="Your display name"
                />
                {errors.displayName && <ErrorMessage>{errors.displayName}</ErrorMessage>}
              </>
            ) : (
              <Value>{user.displayName}</Value>
            )}
          </InfoItem>

          <InfoItem>
            <Label htmlFor="username">Username</Label>
            {isEditing ? (
              <>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  placeholder="Your username"
                />
                {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
              </>
            ) : (
              <Value>@{user.username}</Value>
            )}
          </InfoItem>

          <InfoItem>
            <Label htmlFor="email">Email Address</Label>
            {isEditing ? (
              <>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                />
                {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
              </>
            ) : (
              <Value>{user.email}</Value>
            )}
          </InfoItem>

          <InfoItem>
            <Label>Member Since</Label>
            <Value>{new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</Value>
          </InfoItem>
        </InfoGrid>

        {isEditing && (
          <ButtonGroup>
            <Button $variant="primary" onClick={handleSave}>
              <Save />
              Save Changes
            </Button>
            <Button $variant="secondary" onClick={handleCancel}>
              <X />
              Cancel
            </Button>
          </ButtonGroup>
        )}
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Account Actions</SectionTitle>
        </SectionHeader>
        <Button $variant="secondary" onClick={handleLogout}>
          <LogOut />
          Sign Out
        </Button>
      </Section>

      <Section>
        <DangerZone>
          <DangerTitle>
            <AlertTriangle />
            Danger Zone
          </DangerTitle>
          <DangerDescription>
            Once you delete your account, there is no going back. This will permanently delete your
            account, all your saved items, collections, and preferences.
          </DangerDescription>
          <Button $variant="danger" onClick={handleDeleteAccount}>
            <Trash2 />
            Delete Account
          </Button>
        </DangerZone>
      </Section>

      {/* Delete Confirmation Modal */}
      <ModalOverlay $isOpen={showDeleteModal} onClick={() => setShowDeleteModal(false)}>
        <Modal onClick={e => e.stopPropagation()}>
          <ModalTitle>Delete Account?</ModalTitle>
          <ModalDescription>
            Are you absolutely sure you want to delete your account? This action cannot be undone.
            All your data will be permanently removed from our servers.
          </ModalDescription>
          <ModalButtons>
            <Button $variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button $variant="danger" onClick={confirmDeleteAccount}>
              <Trash2 />
              Yes, Delete My Account
            </Button>
          </ModalButtons>
        </Modal>
      </ModalOverlay>
    </PageContainer>
  );
};
