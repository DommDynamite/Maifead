import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { X, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import { useFeedSourceStore } from '../../stores/feedSourceStore';
import { useFeadStore } from '../../stores/feadStore';
import { useFeedStore } from '../../stores/feedStore';

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

const SearchContainer = styled.div`
  position: relative;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
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
  left: ${props => props.theme.spacing[8]};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};
  width: 16px;
  height: 16px;
  pointer-events: none;
`;

const SourceList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[4]} 0;
`;

const CategorySection = styled.div`
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const CategoryHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background};
  border: none;
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

const CategoryContent = styled.div`
  padding: ${props => props.theme.spacing[2]} 0;
`;

const SourceItem = styled.label<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]} ${props => props.theme.spacing[3]}
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
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
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

const AllSourcesItem = styled.label<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => (props.$selected ? props.theme.colors.primary + '20' : props.theme.colors.background)};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: ${props => props.theme.spacing[2]};

  &:hover {
    background: ${props =>
      props.$selected ? props.theme.colors.primary + '30' : props.theme.colors.surfaceHover};
  }
`;

export const SourceFilterModal: React.FC = () => {
  const {
    isSourceFilterModalOpen,
    toggleSourceFilterModal,
    selectedSourceNames,
    toggleSource,
    clearSourceSelection,
    activeView,
    activeFeadId,
  } = useUIStore();
  const { sources: feedSources } = useFeedSourceStore();
  const { feads } = useFeadStore();
  const { items: feedItems } = useFeedStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['rss', 'reddit', 'youtube', 'bluesky'])
  );

  // Get sources available in current context
  const availableSources = useMemo(() => {
    if (activeView === 'fead' && activeFeadId) {
      const activeFead = feads.find(f => f.id === activeFeadId);
      if (activeFead) {
        // Only return sources that are part of this fead
        return feedSources.filter(source => activeFead.sourceIds.includes(source.id));
      }
    }
    // For 'all', 'collection', and 'sources' views, show all sources
    return feedSources;
  }, [activeView, activeFeadId, feedSources, feads]);

  // Group sources by type and calculate counts
  const categorizedSources = useMemo(() => {
    const sourceMap = new Map<
      string,
      { name: string; count: number; icon?: string; id: string; type: string }
    >();

    // Count items per source from available sources only
    feedItems.forEach(item => {
      const source = availableSources.find(s => s.id === item.sourceId);
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

    // Add sources with 0 items from available sources
    availableSources.forEach(source => {
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
    const bluesky = allSources
      .filter(s => s.type === 'bluesky')
      .sort((a, b) => a.name.localeCompare(b.name));

    return { rss, reddit, youtube, bluesky, all: allSources };
  }, [availableSources, feedItems]);

  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return categorizedSources;

    const query = searchQuery.toLowerCase();
    const filterSources = (sources: typeof categorizedSources.rss) =>
      sources.filter(source => source.name.toLowerCase().includes(query));

    return {
      rss: filterSources(categorizedSources.rss),
      reddit: filterSources(categorizedSources.reddit),
      youtube: filterSources(categorizedSources.youtube),
      bluesky: filterSources(categorizedSources.bluesky),
      all: categorizedSources.all.filter(s => s.name.toLowerCase().includes(query)),
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

  const handleAllSourcesChange = () => {
    if (selectedSourceNames.length > 0) {
      clearSourceSelection();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      toggleSourceFilterModal();
    }
  };

  const allSelected = selectedSourceNames.length === 0;
  const totalItems = categorizedSources.all.reduce((sum, s) => sum + s.count, 0);

  const renderCategory = (
    categoryKey: string,
    categoryName: string,
    sources: typeof categorizedSources.rss
  ) => {
    if (sources.length === 0) return null;

    const isExpanded = expandedCategories.has(categoryKey);
    const categoryTotal = sources.reduce((sum, s) => sum + s.count, 0);

    return (
      <CategorySection key={categoryKey}>
        <CategoryHeader onClick={() => toggleCategory(categoryKey)}>
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
          <CategoryTitle>{categoryName}</CategoryTitle>
          <CategoryCount>
            {sources.length} {sources.length === 1 ? 'source' : 'sources'} · {categoryTotal} items
          </CategoryCount>
        </CategoryHeader>
        {isExpanded && (
          <CategoryContent>
            {sources.map(source => {
              const isSelected = selectedSourceNames.includes(source.name);
              return (
                <SourceItem key={source.id} $selected={isSelected}>
                  <Checkbox
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSource(source.name)}
                    id={`source-${source.id}`}
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
      {isSourceFilterModalOpen && (
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
              <Title>Filter by Source</Title>
              <CloseButton onClick={toggleSourceFilterModal} aria-label="Close modal">
                <X />
              </CloseButton>
            </Header>

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
              <AllSourcesItem $selected={allSelected}>
                <Checkbox
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleAllSourcesChange}
                  id="source-all"
                />
                <SourceInfo>
                  <SourceName>All Sources</SourceName>
                </SourceInfo>
                <ItemCount>{totalItems}</ItemCount>
              </AllSourcesItem>

              {renderCategory('rss', 'RSS Feeds', filteredBySearch.rss)}
              {renderCategory('reddit', 'Reddit', filteredBySearch.reddit)}
              {renderCategory('youtube', 'YouTube', filteredBySearch.youtube)}
              {renderCategory('bluesky', 'Bluesky', filteredBySearch.bluesky)}
            </SourceList>
          </Modal>
        </Backdrop>
      )}
    </AnimatePresence>
  );
};
