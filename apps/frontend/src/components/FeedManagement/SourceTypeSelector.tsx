import React from 'react';
import styled from 'styled-components';
import { Rss, Youtube, MessageSquare } from 'lucide-react';
import type { SourceType } from '@maifead/types';

interface SourceTypeSelectorProps {
  selectedType: SourceType;
  onTypeChange: (type: SourceType) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
`;

const Label = styled.label`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing[3]};
`;

const TypeCard = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => (props.$selected ? props.theme.colors.primary + '22' : props.theme.colors.background)};
  border: 2px solid ${props => (props.$selected ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}11;
  }

  svg {
    width: 32px;
    height: 32px;
    color: ${props => (props.$selected ? props.theme.colors.primary : props.theme.colors.textSecondary)};
    transition: all ${props => props.theme.transitions.fast};
  }

  &:hover svg {
    color: ${props => props.theme.colors.primary};
  }
`;

const TypeTitle = styled.div<{ $selected: boolean }>`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => (props.$selected ? props.theme.colors.primary : props.theme.colors.text)};
`;

const TypeDescription = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
`;

export const SourceTypeSelector: React.FC<SourceTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <Container>
      <Label>Source Type</Label>
      <TypeGrid>
        <TypeCard $selected={selectedType === 'rss'} onClick={() => onTypeChange('rss')} type="button">
          <Rss />
          <TypeTitle $selected={selectedType === 'rss'}>RSS Feed</TypeTitle>
          <TypeDescription>Any blog or website with RSS</TypeDescription>
        </TypeCard>

        <TypeCard $selected={selectedType === 'youtube'} onClick={() => onTypeChange('youtube')} type="button">
          <Youtube />
          <TypeTitle $selected={selectedType === 'youtube'}>YouTube</TypeTitle>
          <TypeDescription>Subscribe to a channel</TypeDescription>
        </TypeCard>

        <TypeCard $selected={selectedType === 'reddit'} onClick={() => onTypeChange('reddit')} type="button">
          <MessageSquare />
          <TypeTitle $selected={selectedType === 'reddit'}>Reddit</TypeTitle>
          <TypeDescription>Follow a subreddit</TypeDescription>
        </TypeCard>
      </TypeGrid>
    </Container>
  );
};
