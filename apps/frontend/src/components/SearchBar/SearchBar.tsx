import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { Search, X, Eye, EyeOff, Filter, CheckCheck } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const SearchWrapper = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  align-items: center;
  margin: 0 auto ${props => props.theme.spacing[4]};
  max-width: 800px;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[12]} ${props => props.theme.spacing[3]}
    ${props => props.theme.spacing[10]};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.base};
  font-family: ${props => props.theme.fonts.sans};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: ${props => props.theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};
  pointer-events: none;
`;

const ClearButton = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.base};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text};
    background: ${props => props.theme.colors.background};
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const FilterControls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  align-items: center;
  flex-shrink: 0;
`;

const IconButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  height: 44px;
  background: ${props => (props.$active ? props.theme.colors.primary : props.theme.colors.surface)};
  color: ${props => (props.$active ? 'white' : props.theme.colors.text)};
  border: 1px solid ${props => (props.$active ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => (props.$active ? props.theme.colors.primaryDark : props.theme.colors.surfaceHover)};
    border-color: ${props => props.theme.colors.primary};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ResultCount = styled.span`
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.medium};
  line-height: 1;
`;

interface SearchBarProps {
  resultCount: number;
  onMarkAllAsRead?: () => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ resultCount, onMarkAllAsRead }, ref) => {
  const { searchQuery, hideReadItems, selectedSourceNames, setSearchQuery, toggleHideReadItems, toggleSourceFilterModal } = useUIStore();

  const handleClear = () => {
    setSearchQuery('');
  };

  const hasSourceFilter = selectedSourceNames.length > 0;

  return (
    <SearchWrapper>
      <SearchContainer>
        <SearchIcon size={20} />
        <SearchInput
          ref={ref}
          type="text"
          placeholder="Search articles, tags, or sources..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <ClearButton onClick={handleClear} aria-label="Clear search">
            <X size={20} />
          </ClearButton>
        )}
      </SearchContainer>
      <FilterControls>
        <IconButton
          $active={hasSourceFilter}
          onClick={toggleSourceFilterModal}
          aria-label="Filter by source"
          title={hasSourceFilter ? `Filtering by ${selectedSourceNames.length} sources` : 'Filter by source'}
        >
          <Filter />
          {hasSourceFilter && <ResultCount>{selectedSourceNames.length}</ResultCount>}
        </IconButton>
        <IconButton
          $active={hideReadItems}
          onClick={toggleHideReadItems}
          aria-label={hideReadItems ? 'Show read items' : 'Hide read items'}
          title={hideReadItems ? 'Show read items' : 'Hide read items'}
        >
          {hideReadItems ? <EyeOff /> : <Eye />}
          <ResultCount>{resultCount}</ResultCount>
        </IconButton>
        {onMarkAllAsRead && resultCount > 0 && (
          <IconButton
            onClick={onMarkAllAsRead}
            aria-label="Mark all visible items as read"
            title="Mark all visible items as read"
          >
            <CheckCheck />
          </IconButton>
        )}
      </FilterControls>
    </SearchWrapper>
  );
});

SearchBar.displayName = 'SearchBar';
