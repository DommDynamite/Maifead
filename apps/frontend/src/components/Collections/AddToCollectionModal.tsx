import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Folder } from 'lucide-react';
import { useCollectionStore } from '../../stores/collectionStore';
import { useToastStore } from '../../stores/toastStore';
import type { ContentItem } from '@maifead/types';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem;
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
  gap: ${props => props.theme.spacing[4]};
`;

const NewCollectionSection = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
`;

const Input = styled.input`
  flex: 1;
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

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => (props.$variant === 'primary' ? props.theme.colors.primary : 'transparent')};
  color: ${props => (props.$variant === 'primary' ? 'white' : props.theme.colors.text)};
  border: 1px solid ${props => (props.$variant === 'primary' ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    background: ${props => (props.$variant === 'primary' ? props.theme.colors.primaryDark : props.theme.colors.surfaceHover)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border};
`;

const CollectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const CollectionItem = styled.button<{ $isAdded: boolean; $color?: string }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => (props.$isAdded ? props.theme.colors.primary + '20' : props.theme.colors.background)};
  border: 1px solid ${props => (props.$isAdded ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${props => props.theme.borderRadius.base};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => (props.$isAdded ? props.theme.colors.primary + '30' : props.theme.colors.surfaceHover)};
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${props => props.$color || props.theme.colors.primary};
    flex-shrink: 0;
  }
`;

const CollectionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CollectionName = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
`;

const CollectionCount = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const CheckIcon = styled(Check)`
  color: ${props => props.theme.colors.success};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[6]};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
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

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({ isOpen, onClose, item }) => {
  const [newCollectionName, setNewCollectionName] = useState('');
  const { collections, addCollection, addItemToCollection, removeItemFromCollection, isItemInCollection } =
    useCollectionStore();
  const { success } = useToastStore();

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    const collection = await addCollection({ name: newCollectionName.trim() });
    await addItemToCollection(collection.id, item.id);
    success(`Added to "${collection.name}"`);
    setNewCollectionName('');
  };

  const handleToggleCollection = (collectionId: string, collectionName: string) => {
    const isAdded = isItemInCollection(collectionId, item.id);

    if (isAdded) {
      removeItemFromCollection(collectionId, item.id);
      success(`Removed from "${collectionName}"`);
    } else {
      addItemToCollection(collectionId, item.id);
      success(`Added to "${collectionName}"`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={onClose}
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
              <Title>Add to Collection</Title>
              <CloseButton onClick={onClose}>
                <X />
              </CloseButton>
            </Header>

            <Content>
              <NewCollectionSection>
                <Input
                  placeholder="New collection name..."
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleCreateCollection();
                    }
                  }}
                />
                <Button $variant="primary" onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
                  <Plus />
                  Create
                </Button>
              </NewCollectionSection>

              {collections.length > 0 && <Divider />}

              <CollectionList>
                {collections.length === 0 ? (
                  <EmptyState>No collections yet. Create one above!</EmptyState>
                ) : (
                  collections.map(collection => {
                    const isAdded = isItemInCollection(collection.id, item.id);
                    return (
                      <CollectionItem
                        key={collection.id}
                        $isAdded={isAdded}
                        $color={collection.color}
                        onClick={() => handleToggleCollection(collection.id, collection.name)}
                      >
                        <Folder />
                        <CollectionInfo>
                          <CollectionName>{collection.name}</CollectionName>
                          <CollectionCount>{collection.itemIds.length} items</CollectionCount>
                        </CollectionInfo>
                        {isAdded && <CheckIcon />}
                      </CollectionItem>
                    );
                  })
                )}
              </CollectionList>
            </Content>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};
