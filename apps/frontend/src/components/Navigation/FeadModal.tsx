import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { X, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeedSourceStore } from '../../stores/feedSourceStore';
import { useFeedStore } from '../../stores/feedStore';
import type { Fead } from '@maifead/types';

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${props => props.theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[4]};
`;

const Modal = styled(motion.div)`
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[5]} ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
`;

const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.xl};
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

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[5]};
`;

const FormGroup = styled.div`
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
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.base};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const EmojiRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const EmojiPreview = styled.div`
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.base};
  border: 1px solid ${props => props.theme.colors.border};
  max-height: 200px;
  overflow-y: auto;
`;

const EmojiButton = styled.button<{ $selected?: boolean }>`
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => (props.$selected ? props.theme.colors.primary + '40' : 'transparent')};
  border: 1px solid
    ${props => (props.$selected ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => (props.$selected ? props.theme.colors.primary + '50' : props.theme.colors.surfaceHover)};
  }
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]} ${props => props.theme.spacing[2]}
    ${props => props.theme.spacing[10]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.sm};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: ${props => props.theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};
  width: 16px;
  height: 16px;
  pointer-events: none;
`;

const SourceList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
`;

const CategorySection = styled.div``;

const CategoryHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background};
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const CategoryTitle = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex: 1;
  text-align: left;
`;

const CategoryCount = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const CategoryContent = styled.div``;

const SourceItem = styled.label<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]} ${props => props.theme.spacing[3]}
    ${props => props.theme.spacing[10]};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => (props.$selected ? props.theme.colors.primary + '20' : 'transparent')};

  &:hover {
    background: ${props =>
      props.$selected ? props.theme.colors.primary + '30' : props.theme.colors.surfaceHover};
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 2px solid ${props => props.theme.colors.border};
  cursor: pointer;
  accent-color: ${props => props.theme.colors.primary};
`;

const SourceInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SourceName = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemCount = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.fontWeights.medium};
  min-width: 32px;
  text-align: right;
`;

const Footer = styled.footer`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]} ${props => props.theme.spacing[6]};
  border-top: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  border: none;

  ${props =>
    props.$variant === 'primary'
      ? `
    background: ${props.theme.colors.primary};
    color: white;
    &:hover {
      background: ${props.theme.colors.primaryDark};
    }
  `
      : `
    background: transparent;
    color: ${props.theme.colors.text};
    border: 1px solid ${props.theme.colors.border};
    &:hover {
      background: ${props.theme.colors.surfaceHover};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const COMMON_EMOJIS = [
  '⚡',
  '🎨',
  '💻',
  '📱',
  '🎮',
  '🎬',
  '🎵',
  '📰',
  '💼',
  '🏀',
  '⚽',
  '🎯',
  '🔥',
  '⭐',
  '💎',
  '🚀',
  '🌟',
  '🎪',
  '🎭',
  '📚',
  '🔬',
  '🎓',
  '🏆',
  '🎁',
];

interface FeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fead: { name: string; icon: string; isImportant?: boolean; sourceIds: string[] }) => void;
  editFead?: Fead | null;
}

export const FeadModal: React.FC<FeadModalProps> = ({ isOpen, onClose, onSave, editFead }) => {
  const { sources: feedSources, getSource } = useFeedSourceStore();
  const { items: feedItems } = useFeedStore();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [isImportant, setIsImportant] = useState(false);
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['rss', 'reddit', 'youtube'])
  );

  // Initialize form when editing
  useEffect(() => {
    if (editFead) {
      setName(editFead.name);
      setIcon(editFead.icon);
      setIsImportant(editFead.isImportant || false);
      setSelectedSourceIds(new Set(editFead.sourceIds));
    } else {
      setName('');
      setIcon('⚡');
      setIsImportant(false);
      setSelectedSourceIds(new Set());
    }
    setSearchQuery('');
  }, [editFead, isOpen]);

  // Group sources by type and calculate counts
  const categorizedSources = useMemo(() => {
    const sourceMap = new Map<
      string,
      { name: string; count: number; icon?: string; id: string; type: string }
    >();

    // Count items per source
    feedItems.forEach(item => {
      const source = feedSources.find(s => s.id === item.sourceId);
      if (source) {
        const existing = sourceMap.get(source.name);
        if (existing) {
          existing.count++;
        } else {
          sourceMap.set(source.name, {
            id: source.id,
            name: source.name,
            count: 1,
            icon: source.icon,
            type: source.type || 'rss',
          });
        }
      }
    });

    // Add sources with 0 items
    feedSources.forEach(source => {
      if (!sourceMap.has(source.name)) {
        sourceMap.set(source.name, {
          id: source.id,
          name: source.name,
          count: 0,
          icon: source.icon,
          type: source.type || 'rss',
        });
      }
    });

    const allSources = Array.from(sourceMap.values());

    // Group by type
    const rss = allSources.filter(s => s.type === 'rss').sort((a, b) => a.name.localeCompare(b.name));
    const reddit = allSources
      .filter(s => s.type === 'reddit')
      .sort((a, b) => a.name.localeCompare(b.name));
    const youtube = allSources
      .filter(s => s.type === 'youtube')
      .sort((a, b) => a.name.localeCompare(b.name));

    return { rss, reddit, youtube };
  }, [feedSources, feedItems]);

  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return categorizedSources;

    const query = searchQuery.toLowerCase();
    const filterSources = (sources: typeof categorizedSources.rss) =>
      sources.filter(source => source.name.toLowerCase().includes(query));

    return {
      rss: filterSources(categorizedSources.rss),
      reddit: filterSources(categorizedSources.reddit),
      youtube: filterSources(categorizedSources.youtube),
    };
  }, [categorizedSources, searchQuery]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSourceIds(prev => {
      const next = new Set(prev);
      if (next.has(sourceId)) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (name.trim() && selectedSourceIds.size > 0) {
      onSave({
        name: name.trim(),
        icon,
        isImportant,
        sourceIds: Array.from(selectedSourceIds),
      });
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderCategory = (
    categoryKey: string,
    categoryName: string,
    sources: typeof categorizedSources.rss
  ) => {
    if (sources.length === 0) return null;

    const isExpanded = expandedCategories.has(categoryKey);

    return (
      <CategorySection key={categoryKey}>
        <CategoryHeader onClick={() => toggleCategory(categoryKey)}>
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
          <CategoryTitle>{categoryName}</CategoryTitle>
          <CategoryCount>
            {sources.length} {sources.length === 1 ? 'source' : 'sources'}
          </CategoryCount>
        </CategoryHeader>
        {isExpanded && (
          <CategoryContent>
            {sources.map(source => {
              const isSelected = selectedSourceIds.has(source.id);
              return (
                <SourceItem key={source.id} $selected={isSelected}>
                  <Checkbox
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSource(source.id)}
                    id={`fead-source-${source.id}`}
                  />
                  <SourceInfo>
                    <SourceName>{source.name}</SourceName>
                  </SourceInfo>
                  <ItemCount>{source.count}</ItemCount>
                </SourceItem>
              );
            })}
          </CategoryContent>
        )}
      </CategorySection>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Backdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleBackdropClick}
        >
          <Modal
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()}
          >
            <Header>
              <Title>{editFead ? 'Edit Fead' : 'Create Fead'}</Title>
              <CloseButton onClick={onClose} aria-label="Close modal">
                <X />
              </CloseButton>
            </Header>

            <Content>
              <FormGroup>
                <Label htmlFor="fead-name">Name</Label>
                <Input
                  id="fead-name"
                  type="text"
                  placeholder="e.g. Tech News"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Icon</Label>
                <EmojiRow>
                  <EmojiPreview>{icon}</EmojiPreview>
                  <Input
                    type="text"
                    placeholder="Paste emoji"
                    value={icon}
                    onChange={e => setIcon(e.target.value.slice(0, 2))}
                    style={{ width: '120px' }}
                  />
                </EmojiRow>
                <EmojiGrid>
                  {COMMON_EMOJIS.map(emoji => (
                    <EmojiButton
                      key={emoji}
                      type="button"
                      $selected={icon === emoji}
                      onClick={() => setIcon(emoji)}
                    >
                      {emoji}
                    </EmojiButton>
                  ))}
                </EmojiGrid>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="fead-important" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <Checkbox
                    id="fead-important"
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                  />
                  <span>Mark as Important (get notifications for unread items)</span>
                </Label>
              </FormGroup>

              <FormGroup>
                <Label>Sources ({selectedSourceIds.size} selected)</Label>
                <SearchContainer>
                  <SearchIcon />
                  <SearchInput
                    type="text"
                    placeholder="Search sources..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </SearchContainer>
                <SourceList>
                  {renderCategory('rss', 'RSS Feeds', filteredBySearch.rss)}
                  {renderCategory('reddit', 'Reddit', filteredBySearch.reddit)}
                  {renderCategory('youtube', 'YouTube', filteredBySearch.youtube)}
                </SourceList>
              </FormGroup>
            </Content>

            <Footer>
              <Button type="button" $variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                $variant="primary"
                onClick={handleSave}
                disabled={!name.trim() || selectedSourceIds.size === 0}
              >
                {editFead ? 'Save Changes' : 'Create Fead'}
              </Button>
            </Footer>
          </Modal>
        </Backdrop>
      )}
    </AnimatePresence>
  );
};
