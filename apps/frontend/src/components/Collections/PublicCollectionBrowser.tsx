import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Globe, User, Folder, Plus, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useToastStore } from '../../stores/toastStore';
import { useFeedSourceStore } from '../../stores/feedSourceStore';
import type { PublicCollectionWithUser } from '@maifead/types';

interface PublicCollectionBrowserProps {
  isOpen: boolean;
  onClose: () => void;
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
  max-width: 800px;
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
  flex-shrink: 0;
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
  flex: 1;
`;

const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};

  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.theme.colors.primary};
  }
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border-radius: ${props => props.theme.borderRadius.base};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SearchSection = styled.div`
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
  flex-shrink: 0;
`;

const SearchBar = styled.div`
  position: relative;
  width: 100%;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: ${props => props.theme.colors.textSecondary};
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]}
    ${props => props.theme.spacing[10]};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.sm};
  font-family: ${props => props.theme.fonts.sans};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}22;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const Content = styled.div`
  overflow-y: auto;
  padding: ${props => props.theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
  flex: 1;
`;

const CollectionCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[4]};
  display: flex;
  gap: ${props => props.theme.spacing[4]};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary}60;
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const CollectionIcon = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$color || props.theme.colors.primary}22;
  color: ${props => props.$color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const CollectionInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const CollectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[3]};
`;

const CollectionTitleSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const CollectionName = styled.h3`
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing[1]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const CollectionStats = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SubscribeButton = styled.button<{ $subscribed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  background: ${props => (props.$subscribed ? 'transparent' : props.theme.colors.primary)};
  color: ${props => (props.$subscribed ? props.theme.colors.text : 'white')};
  border: 1px solid ${props => (props.$subscribed ? props.theme.colors.border : props.theme.colors.primary)};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: ${props => (props.$subscribed ? props.theme.colors.surfaceHover : props.theme.colors.primaryDark)};
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

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[6]};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};

  h3 {
    margin: 0 0 ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.fontSizes.lg};
    font-weight: ${props => props.theme.fontWeights.semibold};
  }

  p {
    margin: 0;
    font-size: ${props => props.theme.fontSizes.sm};
    line-height: 1.5;
  }
`;

const LoadingState = styled.div`
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[6]};
  text-align: center;
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

export const PublicCollectionBrowser: React.FC<PublicCollectionBrowserProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collections, setCollections] = useState<PublicCollectionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subscribedCollectionIds, setSubscribedCollectionIds] = useState<Set<string>>(new Set());

  const { sources, createSource, deleteSource } = useFeedSourceStore();
  const { success, error } = useToastStore();

  // Fetch public collections when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPublicCollections();
      updateSubscribedCollections();
    }
  }, [isOpen]);

  const fetchPublicCollections = async () => {
    setIsLoading(true);
    try {
      const response = await api.getPublicCollections();
      setCollections(response);
    } catch (err) {
      console.error('Failed to fetch public collections:', err);
      error('Failed to load public collections');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscribedCollections = () => {
    // Find all publicfead sources and extract their collection IDs
    const subscribed = new Set<string>();
    sources.forEach(source => {
      if (source.type === 'publicfead' && source.collectionIds) {
        source.collectionIds.forEach(id => subscribed.add(id));
      }
    });
    setSubscribedCollectionIds(subscribed);
  };

  const handleSubscribe = async (collection: PublicCollectionWithUser) => {
    try {
      // Create a new publicfead source
      await createSource({
        name: `${collection.name} (by ${collection.user.displayName})`,
        url: '', // Not used for publicfead sources
        type: 'publicfead',
        collectionIds: [collection.id],
      });

      setSubscribedCollectionIds(prev => new Set(prev).add(collection.id));
      success(`Subscribed to "${collection.name}"`);
    } catch (err) {
      console.error('Failed to subscribe:', err);
      error('Failed to subscribe to collection');
    }
  };

  const handleUnsubscribe = async (collection: PublicCollectionWithUser) => {
    try {
      // Find the source that corresponds to this collection
      const source = sources.find(
        s => s.type === 'publicfead' && s.collectionIds?.includes(collection.id)
      );

      if (source) {
        await deleteSource(source.id);
        setSubscribedCollectionIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(collection.id);
          return newSet;
        });
        success(`Unsubscribed from "${collection.name}"`);
      }
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
      error('Failed to unsubscribe from collection');
    }
  };

  // Filter collections by search query
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;

    const query = searchQuery.toLowerCase();
    return collections.filter(
      collection =>
        collection.name.toLowerCase().includes(query) ||
        collection.user.displayName.toLowerCase().includes(query) ||
        collection.user.username.toLowerCase().includes(query)
    );
  }, [collections, searchQuery]);

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
              <HeaderContent>
                <Title>
                  <Globe />
                  Browse Public Collections
                </Title>
                <Subtitle>Discover and subscribe to collections shared by other users</Subtitle>
              </HeaderContent>
              <CloseButton onClick={onClose}>
                <X />
              </CloseButton>
            </Header>

            <SearchSection>
              <SearchBar>
                <SearchIcon />
                <SearchInput
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search collections or users..."
                />
              </SearchBar>
            </SearchSection>

            <Content>
              {isLoading ? (
                <LoadingState>Loading public collections...</LoadingState>
              ) : filteredCollections.length === 0 ? (
                <EmptyState>
                  <h3>{searchQuery ? 'No collections found' : 'No public collections yet'}</h3>
                  <p>
                    {searchQuery
                      ? 'Try adjusting your search query'
                      : 'Be the first to share a collection! Make one of your collections public to get started.'}
                  </p>
                </EmptyState>
              ) : (
                filteredCollections.map(collection => {
                  const isSubscribed = subscribedCollectionIds.has(collection.id);

                  return (
                    <CollectionCard key={collection.id}>
                      <CollectionIcon $color={collection.color}>
                        <Folder />
                      </CollectionIcon>

                      <CollectionInfo>
                        <CollectionHeader>
                          <CollectionTitleSection>
                            <CollectionName>{collection.name}</CollectionName>
                            <UserInfo>
                              <User />
                              {collection.user.displayName} (@{collection.user.username})
                            </UserInfo>
                          </CollectionTitleSection>

                          <SubscribeButton
                            $subscribed={isSubscribed}
                            onClick={() =>
                              isSubscribed ? handleUnsubscribe(collection) : handleSubscribe(collection)
                            }
                          >
                            {isSubscribed ? (
                              <>
                                <Check />
                                Subscribed
                              </>
                            ) : (
                              <>
                                <Plus />
                                Subscribe
                              </>
                            )}
                          </SubscribeButton>
                        </CollectionHeader>

                        <CollectionStats>
                          <Stat>
                            <Folder />
                            {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                          </Stat>
                        </CollectionStats>
                      </CollectionInfo>
                    </CollectionCard>
                  );
                })
              )}
            </Content>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};
