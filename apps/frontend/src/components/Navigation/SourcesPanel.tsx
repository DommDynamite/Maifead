import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { X, Search, Plus, Filter, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { useFeedSourceStore } from '../../stores/feedSourceStore';
import { useFeedStore } from '../../stores/feedStore';

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
  left: 64px;
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
    left: 0;
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

const SearchContainer = styled.div`
  position: relative;
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]} ${props => props.theme.spacing[2]}
    ${props => props.theme.spacing[8]};
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
  left: ${props => props.theme.spacing[6]};
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
  padding: ${props => props.theme.spacing[2]} 0;
`;

const SourceItem = styled.label<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
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

const SourceNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const SourceName = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FilterBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: ${props => props.theme.colors.primary}22;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: 10px;
  font-weight: ${props => props.theme.fontWeights.medium};
  flex-shrink: 0;

  svg {
    width: 10px;
    height: 10px;
  }
`;

const ItemCount = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.fontWeights.medium};
  min-width: 32px;
  text-align: right;
`;

const Footer = styled.footer`
  padding: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const ManageButton = styled.button`
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
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 16px;
    height: 16px;
  }
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

export const SourcesPanel: React.FC = () => {
  const navigate = useNavigate();
  const { isSourcesPanelOpen, toggleSourcesPanel, selectedSourceNames, toggleSource, clearSourceSelection } =
    useUIStore();
  const { sources: feedSources } = useFeedSourceStore();
  const { items: feedItems } = useFeedStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique sources from feed items with item counts
  const sources = useMemo(() => {
    const sourceMap = new Map<
      string,
      { name: string; count: number; icon?: string; id: string }
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
        });
      }
    });

    return Array.from(sourceMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [feedSources, feedItems]);

  const filteredSources = useMemo(() => {
    if (!searchQuery.trim()) return sources;
    const query = searchQuery.toLowerCase();
    return sources.filter(source => source.name.toLowerCase().includes(query));
  }, [sources, searchQuery]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      toggleSourcesPanel();
    }
  };

  const handleAllSourcesChange = () => {
    if (selectedSourceNames.length > 0) {
      clearSourceSelection();
    } else {
      // Select all sources
      sources.forEach(source => {
        if (!selectedSourceNames.includes(source.name)) {
          toggleSource(source.name);
        }
      });
    }
  };

  const allSelected = selectedSourceNames.length === 0;
  const totalItems = sources.reduce((sum, s) => sum + s.count, 0);

  return (
    <AnimatePresence>
      {isSourcesPanelOpen && (
        <>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleBackdropClick}
          />
          <Panel
            initial={{ x: -344 }}
            animate={{ x: 0 }}
            exit={{ x: -344 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Header>
              <Title>Sources</Title>
              <CloseButton onClick={toggleSourcesPanel} aria-label="Close panel">
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
              <SourceItem $selected={allSelected}>
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
              </SourceItem>

              {filteredSources.map(source => {
                const isSelected = selectedSourceNames.includes(source.name);
                const feedSource = feedSources.find(fs => fs.name === source.name);
                const filterCount =
                  (feedSource?.whitelistKeywords?.length || 0) +
                  (feedSource?.blacklistKeywords?.length || 0);

                return (
                  <SourceItem key={source.name} $selected={isSelected}>
                    <Checkbox
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSource(source.name)}
                      id={`source-${source.name}`}
                    />
                    <SourceInfo>
                      <SourceNameRow>
                        <SourceName>{source.name}</SourceName>
                        {filterCount > 0 && (
                          <FilterBadge>
                            <Filter />
                            {filterCount}
                          </FilterBadge>
                        )}
                      </SourceNameRow>
                    </SourceInfo>
                    <ItemCount>{source.count}</ItemCount>
                  </SourceItem>
                );
              })}
            </SourceList>

            <Footer>
              <ManageButton
                onClick={() => {
                  navigate('/sources');
                  toggleSourcesPanel();
                }}
              >
                <Settings />
                Manage Sources
              </ManageButton>
              <AddButton
                onClick={() => {
                  navigate('/sources');
                  toggleSourcesPanel();
                }}
              >
                <Plus />
                Add Feed
              </AddButton>
            </Footer>
          </Panel>
        </>
      )}
    </AnimatePresence>
  );
};
