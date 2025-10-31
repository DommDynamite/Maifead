import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Plus, Edit2, Trash2, ChevronRight, Folder, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import { useCollectionStore } from '../../stores/collectionStore';
import { PublicCollectionBrowser } from '../Collections/PublicCollectionBrowser';
import type { Collection } from '@maifead/types';

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: ${props => props.theme.zIndex.modal};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    background: rgba(0, 0, 0, 0.5);
  }
`;

const Panel = styled(motion.aside)`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: ${props => props.theme.zIndex.modal + 1};
  display: flex;
  flex-direction: column;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
    max-width: 320px;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
`;

const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.base};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border: none;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const CollectionList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[2]} 0;
`;

const CollectionItem = styled.div<{ $active?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => (props.$active ? props.theme.colors.primary + '20' : 'transparent')};

  &:hover {
    background: ${props =>
      props.$active ? props.theme.colors.primary + '30' : props.theme.colors.surfaceHover};
  }
`;

const CollectionIcon = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.$color || props.theme.colors.primary}20;
  color: ${props => props.$color || props.theme.colors.primary};
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const CollectionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CollectionName = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemCount = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.fast};

  ${CollectionItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border: none;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Footer = styled.footer`
  padding: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const AddButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const BrowseButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: transparent;
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
`;

interface CollectionsPanelProps {
  onCreateCollection?: () => void;
  onEditCollection?: (collection: Collection) => void;
}

export const CollectionsPanel: React.FC<CollectionsPanelProps> = ({
  onCreateCollection,
  onEditCollection,
}) => {
  const { isCollectionsPanelOpen, toggleCollectionsPanel, activeCollectionId, setActiveCollection } =
    useUIStore();
  const { collections, deleteCollection, getCollectionItemCount } = useCollectionStore();
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      toggleCollectionsPanel();
    }
  };

  const handleCollectionClick = (collectionId: string) => {
    if (activeCollectionId === collectionId) {
      setActiveCollection(null); // Deselect
    } else {
      setActiveCollection(collectionId);
    }
  };

  const handleEditClick = (e: React.MouseEvent, collection: Collection) => {
    e.stopPropagation();
    onEditCollection?.(collection);
  };

  const handleDeleteClick = (e: React.MouseEvent, collectionId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this collection?')) {
      deleteCollection(collectionId);
      if (activeCollectionId === collectionId) {
        setActiveCollection(null);
      }
    }
  };

  return (
    <AnimatePresence>
      {isCollectionsPanelOpen && (
        <>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            onClick={handleBackdropClick}
          />
          <Panel
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Header>
              <Title>Collections</Title>
              <CloseButton onClick={toggleCollectionsPanel} aria-label="Close panel">
                <X />
              </CloseButton>
            </Header>

            <CollectionList>
              {collections.length === 0 ? (
                <EmptyState>
                  No collections yet.
                  <br />
                  Create your first collection!
                </EmptyState>
              ) : (
                collections.map(collection => {
                  const isActive = activeCollectionId === collection.id;
                  const itemCount = getCollectionItemCount(collection.id);

                  return (
                    <CollectionItem
                      key={collection.id}
                      $active={isActive}
                      onClick={() => handleCollectionClick(collection.id)}
                    >
                      <CollectionIcon $color={collection.color}>
                        <Folder />
                      </CollectionIcon>

                      <CollectionInfo>
                        <CollectionName>{collection.name}</CollectionName>
                        <ItemCount>
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </ItemCount>
                      </CollectionInfo>

                      <ActionButtons>
                        <ActionButton
                          onClick={e => handleEditClick(e, collection)}
                          aria-label="Edit Collection"
                          title="Edit"
                        >
                          <Edit2 />
                        </ActionButton>
                        <ActionButton
                          onClick={e => handleDeleteClick(e, collection.id)}
                          aria-label="Delete Collection"
                          title="Delete"
                        >
                          <Trash2 />
                        </ActionButton>
                      </ActionButtons>
                    </CollectionItem>
                  );
                })
              )}
            </CollectionList>

            <Footer>
              <AddButton onClick={onCreateCollection}>
                <Plus />
                Create Collection
              </AddButton>
              <BrowseButton onClick={() => setIsBrowserOpen(true)}>
                <Globe />
                Browse Public Collections
              </BrowseButton>
            </Footer>
          </Panel>

          <PublicCollectionBrowser isOpen={isBrowserOpen} onClose={() => setIsBrowserOpen(false)} />
        </>
      )}
    </AnimatePresence>
  );
};
