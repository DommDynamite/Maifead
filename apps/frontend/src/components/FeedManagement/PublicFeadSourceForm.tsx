import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Folder, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import type { PublicCollectionWithUser } from '@maifead/types';

interface PublicFeadSourceFormProps {
  name: string;
  selectedCollectionIds: string[];
  onNameChange: (value: string) => void;
  onCollectionIdsChange: (ids: string[]) => void;
  preselectedCollectionId?: string; // For when user clicks from browser
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
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

const HelpText = styled.p`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

const CollectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  max-height: 300px;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
`;

const CollectionItem = styled.button<{ $selected: boolean; $color?: string }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => (props.$selected ? props.theme.colors.primary + '20' : 'transparent')};
  border: 1px solid ${props => (props.$selected ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${props => props.theme.borderRadius.base};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => (props.$selected ? props.theme.colors.primary + '30' : props.theme.colors.surfaceHover)};
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

const CollectionIcon = styled.div<{ $color?: string }>`
  width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.borderRadius.base};
  background: ${props => props.$color || props.theme.colors.primary}22;
  color: ${props => props.$color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CollectionMeta = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const CheckIcon = styled(Check)`
  color: ${props => props.theme.colors.primary};
`;

const LoadingState = styled.div`
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
`;

export const PublicFeadSourceForm: React.FC<PublicFeadSourceFormProps> = ({
  name,
  selectedCollectionIds,
  onNameChange,
  onCollectionIdsChange,
  preselectedCollectionId,
}) => {
  const [collections, setCollections] = useState<PublicCollectionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPublicCollections();
  }, []);

  // If there's a preselected collection and it's not already selected, add it
  useEffect(() => {
    if (preselectedCollectionId && !selectedCollectionIds.includes(preselectedCollectionId)) {
      onCollectionIdsChange([...selectedCollectionIds, preselectedCollectionId]);
    }
  }, [preselectedCollectionId]);

  const fetchPublicCollections = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPublicCollections();
      setCollections(data);
    } catch (error) {
      console.error('Failed to fetch public collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCollection = (collectionId: string) => {
    if (selectedCollectionIds.includes(collectionId)) {
      onCollectionIdsChange(selectedCollectionIds.filter(id => id !== collectionId));
    } else {
      onCollectionIdsChange([...selectedCollectionIds, collectionId]);
    }
  };

  return (
    <Container>
      <FormGroup>
        <Label htmlFor="source-name">Source Name</Label>
        <Input
          id="source-name"
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="My Public Fead Source"
        />
        <HelpText>Give this source a name to identify it in your feads</HelpText>
      </FormGroup>

      <FormGroup>
        <Label>Select Collections ({selectedCollectionIds.length} selected)</Label>
        <HelpText>Choose one or more public collections to aggregate into this source</HelpText>
        {isLoading ? (
          <LoadingState>Loading public collections...</LoadingState>
        ) : collections.length === 0 ? (
          <EmptyState>No public collections available</EmptyState>
        ) : (
          <CollectionList>
            {collections.map(collection => {
              const isSelected = selectedCollectionIds.includes(collection.id);
              return (
                <CollectionItem
                  key={collection.id}
                  type="button"
                  $selected={isSelected}
                  onClick={() => toggleCollection(collection.id)}
                >
                  <CollectionIcon $color={collection.color}>
                    <Folder />
                  </CollectionIcon>

                  <CollectionInfo>
                    <CollectionName>{collection.name}</CollectionName>
                    <CollectionMeta>
                      by {collection.user.displayName} • {collection.itemCount} items
                    </CollectionMeta>
                  </CollectionInfo>

                  {isSelected && <CheckIcon />}
                </CollectionItem>
              );
            })}
          </CollectionList>
        )}
      </FormGroup>
    </Container>
  );
};
