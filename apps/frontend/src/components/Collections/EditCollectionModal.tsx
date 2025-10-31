import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Globe, Lock } from 'lucide-react';
import { useCollectionStore } from '../../stores/collectionStore';
import { useToastStore } from '../../stores/toastStore';
import type { Collection } from '@maifead/types';
import { api } from '../../services/api';

interface EditCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection | null;
}

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: ${props => props.theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[4]};
`;

const Modal = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: ${props => props.theme.shadows.xl};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
`;

const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border-radius: ${props => props.theme.borderRadius.base};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Content = styled.div`
  overflow-y: auto;
  padding: ${props => props.theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[5]};
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.sm};
  font-family: ${props => props.theme.fonts.sans};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const ToggleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
`;

const ToggleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[3]};
`;

const ToggleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
  flex: 1;
`;

const ToggleLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ToggleDescription = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

const Toggle = styled.button<{ $isOn: boolean }>`
  position: relative;
  width: 48px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: ${props => (props.$isOn ? props.theme.colors.primary : props.theme.colors.border)};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    opacity: 0.8;
  }

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => (props.$isOn ? '25px' : '3px')};
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background: white;
    transition: all ${props => props.theme.transitions.fast};
  }
`;

const WarningBanner = styled(motion.div)<{ $variant: 'info' | 'warning' }>`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props =>
    props.$variant === 'warning'
      ? props.theme.colors.error + '15'
      : props.theme.colors.primary + '15'};
  border: 1px solid
    ${props =>
      props.$variant === 'warning' ? props.theme.colors.error + '40' : props.theme.colors.primary + '40'};
  border-radius: ${props => props.theme.borderRadius.base};

  svg {
    width: 20px;
    height: 20px;
    color: ${props => (props.$variant === 'warning' ? props.theme.colors.error : props.theme.colors.primary)};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const WarningContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const WarningTitle = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
`;

const WarningText = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[5]};
  background: ${props => (props.$variant === 'primary' ? props.theme.colors.primary : 'transparent')};
  color: ${props => (props.$variant === 'primary' ? 'white' : props.theme.colors.text)};
  border: 1px solid
    ${props => (props.$variant === 'primary' ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props =>
      props.$variant === 'primary' ? props.theme.colors.primaryDark : props.theme.colors.surfaceHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export const EditCollectionModal: React.FC<EditCollectionModalProps> = ({ isOpen, onClose, collection }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#14b8a6');
  const [isPublic, setIsPublic] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);

  const { updateCollection } = useCollectionStore();
  const { success, error } = useToastStore();

  // Initialize form when collection changes
  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setColor(collection.color || '#14b8a6');
      setIsPublic(collection.isPublic || false);
    }
  }, [collection]);

  // Fetch subscriber count when collection becomes available
  useEffect(() => {
    if (collection?.isPublic && isOpen) {
      fetchSubscriberCount();
    }
  }, [collection?.id, isOpen]);

  const fetchSubscriberCount = async () => {
    if (!collection) return;

    setIsLoadingSubscribers(true);
    try {
      const count = await api.getCollectionSubscriberCount(collection.id);
      setSubscriberCount(count);
    } catch (err) {
      console.error('Failed to fetch subscriber count:', err);
      setSubscriberCount(null);
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  const handleTogglePublic = () => {
    const newValue = !isPublic;
    setIsPublic(newValue);

    // If toggling to private and collection is currently public, fetch subscriber count
    if (!newValue && collection?.isPublic) {
      fetchSubscriberCount();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collection || !name.trim()) return;

    try {
      await updateCollection(collection.id, {
        name: name.trim(),
        color,
        isPublic,
      });
      success('Collection updated successfully');
      onClose();
    } catch (err) {
      console.error('Failed to update collection:', err);
      error('Failed to update collection');
    }
  };

  const handleClose = () => {
    // Reset subscriber count when closing
    setSubscriberCount(null);
    onClose();
  };

  if (!collection) return null;

  const isPrivacyChanging = collection.isPublic !== isPublic;
  const isMakingPrivate = collection.isPublic && !isPublic;
  const isMakingPublic = !collection.isPublic && isPublic;

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={handleClose}
        >
          <Modal
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <Header>
              <Title>Edit Collection</Title>
              <CloseButton onClick={handleClose}>
                <X />
              </CloseButton>
            </Header>

            <form onSubmit={handleSubmit}>
              <Content>
                <FormField>
                  <Label htmlFor="collection-name">Name</Label>
                  <Input
                    id="collection-name"
                    type="text"
                    placeholder="Collection name..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="collection-color">Color</Label>
                  <Input
                    id="collection-color"
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                  />
                </FormField>

                <ToggleSection>
                  <ToggleHeader>
                    <ToggleInfo>
                      <ToggleLabel>
                        {isPublic ? <Globe /> : <Lock />}
                        {isPublic ? 'Public Fead' : 'Private Collection'}
                      </ToggleLabel>
                      <ToggleDescription>
                        {isPublic
                          ? 'Other users can add this collection as a public fead source'
                          : 'Only you can see this collection'}
                      </ToggleDescription>
                    </ToggleInfo>
                    <Toggle $isOn={isPublic} onClick={handleTogglePublic} type="button" />
                  </ToggleHeader>

                  <AnimatePresence>
                    {isMakingPublic && (
                      <WarningBanner
                        $variant="info"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Globe />
                        <WarningContent>
                          <WarningTitle>Making Fead Public</WarningTitle>
                          <WarningText>
                            Once public, other users will be able to add this collection as a fead source.
                            They'll see all items you add to it.
                          </WarningText>
                        </WarningContent>
                      </WarningBanner>
                    )}

                    {isMakingPrivate && (
                      <WarningBanner
                        $variant="warning"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <AlertTriangle />
                        <WarningContent>
                          <WarningTitle>Making Fead Private</WarningTitle>
                          <WarningText>
                            {isLoadingSubscribers
                              ? 'Checking for subscribers...'
                              : subscriberCount !== null && subscriberCount > 0
                                ? `${subscriberCount} ${subscriberCount === 1 ? 'user has' : 'users have'} added this as a fead source. Their sources will stop updating.`
                                : 'This collection will no longer be available as a public fead source.'}
                          </WarningText>
                        </WarningContent>
                      </WarningBanner>
                    )}
                  </AnimatePresence>
                </ToggleSection>
              </Content>

              <Footer>
                <Button type="button" $variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" $variant="primary" disabled={!name.trim()}>
                  Save Changes
                </Button>
              </Footer>
            </form>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};
