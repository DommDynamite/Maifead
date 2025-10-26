import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Filter, Search, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useFeedSourceStore } from '../stores/feedSourceStore';
import { AddFeedModal } from '../components/FeedManagement/AddFeedModal';
import { EditFeedModal } from '../components/FeedManagement/EditFeedModal';
import type { FeedSource } from '@maifead/types';
import { mockFeedItems } from '../data/mockFeed';

const PageContainer = styled.div`
  background: ${props => props.theme.colors.background};
`;

const PageHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
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

  svg {
    width: 18px;
    height: 18px;
  }
`;

const SearchBar = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
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
  padding: ${props => props.theme.spacing[3]};
  padding-left: ${props => props.theme.spacing[10]};
  background: ${props => props.theme.colors.background};
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
  padding: ${props => props.theme.spacing[6]};
  max-width: 1400px;
  margin: 0 auto;
`;

const Table = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 2fr 100px 120px 100px 100px 120px;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 2fr 100px 120px 100px 100px 120px;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: all ${props => props.theme.transitions.fast};
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const Icon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.base};
  object-fit: cover;
`;

const IconPlaceholder = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.base};
  background: ${props => props.theme.colors.primary}22;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.fontWeights.bold};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const SourceName = styled.div`
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SourceUrl = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FilterBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.primary}22;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.medium};
  width: fit-content;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const NoFilters = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const TypeBadge = styled.div<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  text-transform: uppercase;
  width: fit-content;

  ${props => {
    if (props.$type === 'youtube') {
      return `
        background: #ff000022;
        color: #ff0000;
      `;
    } else if (props.$type === 'reddit') {
      return `
        background: #ff450022;
        color: #ff4500;
      `;
    } else {
      return `
        background: ${props.theme.colors.primary}22;
        color: ${props.theme.colors.primary};
      `;
    }
  }}
`;

const ItemCount = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  text-align: center;
`;

const StatusBadge = styled.div<{ $enabled: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.medium};
  width: fit-content;

  ${props => {
    if (props.$enabled) {
      return `
        background: #10b98122;
        color: #10b981;
      `;
    } else {
      return `
        background: #ef444422;
        color: #ef4444;
      `;
    }
  }}

  svg {
    width: 12px;
    height: 12px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => {
      if (props.$variant === 'delete') return '#ef444422';
      return props.theme.colors.surfaceHover;
    }};
    border-color: ${props => {
      if (props.$variant === 'delete') return '#ef4444';
      return props.theme.colors.border;
    }};
    color: ${props => {
      if (props.$variant === 'delete') return '#ef4444';
      return props.theme.colors.text;
    }};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing[12]};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};

  h3 {
    margin: 0 0 ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.fontSizes.lg};
  }

  p {
    margin: 0;
    font-size: ${props => props.theme.fontSizes.sm};
  }
`;

export const SourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const { sources, deleteSource } = useFeedSourceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<FeedSource | null>(null);

  // Filter sources by search query
  const filteredSources = useMemo(() => {
    if (!searchQuery.trim()) return sources;

    const query = searchQuery.toLowerCase();
    return sources.filter(
      source =>
        source.name.toLowerCase().includes(query) || source.url.toLowerCase().includes(query)
    );
  }, [sources, searchQuery]);

  // Calculate item counts per source
  const getItemCount = (sourceName: string) => {
    return mockFeedItems.filter(item => item.source.name === sourceName).length;
  };

  const handleEdit = (source: FeedSource) => {
    setSelectedSource(source);
    setIsEditModalOpen(true);
  };

  const handleDelete = (source: FeedSource) => {
    if (confirm(`Are you sure you want to delete "${source.name}"?`)) {
      deleteSource(source.id);
    }
  };

  const getTotalFilterCount = (source: FeedSource) => {
    return (source.whitelistKeywords?.length || 0) + (source.blacklistKeywords?.length || 0);
  };

  return (
    <PageContainer>
      <PageHeader>
        <HeaderTop>
          <HeaderLeft>
            <BackButton onClick={() => navigate('/')}>
              <ArrowLeft />
              Back to Feed
            </BackButton>
            <PageTitle>Feed Sources</PageTitle>
          </HeaderLeft>
          <AddButton onClick={() => setIsAddModalOpen(true)}>
            <Plus />
            Add Feed
          </AddButton>
        </HeaderTop>

        <SearchBar>
          <SearchIcon />
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search sources..."
          />
        </SearchBar>
      </PageHeader>

      <Content>
        {filteredSources.length === 0 ? (
          <Table>
            <EmptyState>
              <h3>No sources found</h3>
              <p>
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Add your first feed source to get started'}
              </p>
            </EmptyState>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <div>Icon</div>
              <div>Name</div>
              <div>URL</div>
              <div>Type</div>
              <div>Filters</div>
              <div>Items</div>
              <div>Status</div>
              <div>Actions</div>
            </TableHeader>

            {filteredSources.map(source => {
              const filterCount = getTotalFilterCount(source);
              const itemCount = getItemCount(source.name);

              return (
                <TableRow key={source.id}>
                  <div>
                    {source.icon ? (
                      <Icon src={source.icon} alt={source.name} />
                    ) : (
                      <IconPlaceholder>{source.name[0].toUpperCase()}</IconPlaceholder>
                    )}
                  </div>

                  <SourceName>{source.name}</SourceName>

                  <SourceUrl title={source.url}>{source.url}</SourceUrl>

                  <div>
                    <TypeBadge $type={source.type}>{source.type}</TypeBadge>
                  </div>

                  <div>
                    {filterCount > 0 ? (
                      <FilterBadge>
                        <Filter />
                        {filterCount}
                      </FilterBadge>
                    ) : (
                      <NoFilters>None</NoFilters>
                    )}
                  </div>

                  <ItemCount>{itemCount}</ItemCount>

                  <StatusBadge $enabled={source.isEnabled}>
                    {source.isEnabled ? <CheckCircle /> : <XCircle />}
                    {source.isEnabled ? 'Active' : 'Disabled'}
                  </StatusBadge>

                  <Actions>
                    <ActionButton $variant="edit" onClick={() => handleEdit(source)}>
                      <Edit2 />
                    </ActionButton>
                    <ActionButton $variant="delete" onClick={() => handleDelete(source)}>
                      <Trash2 />
                    </ActionButton>
                  </Actions>
                </TableRow>
              );
            })}
          </Table>
        )}
      </Content>

      <AddFeedModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      <EditFeedModal
        isOpen={isEditModalOpen}
        source={selectedSource}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSource(null);
        }}
      />
    </PageContainer>
  );
};
