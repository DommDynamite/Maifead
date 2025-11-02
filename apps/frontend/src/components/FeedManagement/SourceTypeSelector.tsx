import React from 'react';
import styled from 'styled-components';
import { Rss, Youtube, MessageSquare, Cloud, Globe } from 'lucide-react';
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
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing[3]};
`;

const TypeCard = styled.button<{ $selected: boolean; $color?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => {
    const color = props.$color || props.theme.colors.primary;
    return props.$selected ? color + '22' : props.theme.colors.background;
  }};
  border: 2px solid ${props => {
    const color = props.$color || props.theme.colors.primary;
    return props.$selected ? color : props.theme.colors.border;
  }};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.$color || props.theme.colors.primary};
    background: ${props => (props.$color || props.theme.colors.primary) + '11'};
  }

  svg {
    width: 32px;
    height: 32px;
    color: ${props => {
      const color = props.$color || props.theme.colors.primary;
      return props.$selected ? color : props.theme.colors.textSecondary;
    }};
    transition: all ${props => props.theme.transitions.fast};
  }

  &:hover svg {
    color: ${props => props.$color || props.theme.colors.primary};
  }
`;

const TypeTitle = styled.div<{ $selected: boolean; $color?: string }>`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => {
    const color = props.$color || props.theme.colors.primary;
    return props.$selected ? color : props.theme.colors.text;
  }};
`;

const TypeDescription = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
`;

// Color scheme matching TypeBadge in SourcesPage
const SOURCE_COLORS = {
  rss: '#14b8a6', // teal (primary theme color)
  youtube: '#ff0000', // YouTube red
  reddit: '#ff4500', // Reddit orange-red
  bluesky: '#1185fe', // Bluesky blue
  publicfead: '#8b5cf6', // purple/violet for public feads
};

export const SourceTypeSelector: React.FC<SourceTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <Container>
      <Label>Source Type</Label>
      <TypeGrid>
        <TypeCard
          $selected={selectedType === 'rss'}
          $color={SOURCE_COLORS.rss}
          onClick={() => onTypeChange('rss')}
          type="button"
        >
          <Rss />
          <TypeTitle $selected={selectedType === 'rss'} $color={SOURCE_COLORS.rss}>
            RSS Feed
          </TypeTitle>
          <TypeDescription>Any blog or website with RSS</TypeDescription>
        </TypeCard>

        <TypeCard
          $selected={selectedType === 'youtube'}
          $color={SOURCE_COLORS.youtube}
          onClick={() => onTypeChange('youtube')}
          type="button"
        >
          <Youtube />
          <TypeTitle $selected={selectedType === 'youtube'} $color={SOURCE_COLORS.youtube}>
            YouTube
          </TypeTitle>
          <TypeDescription>Subscribe to a channel</TypeDescription>
        </TypeCard>

        <TypeCard
          $selected={selectedType === 'reddit'}
          $color={SOURCE_COLORS.reddit}
          onClick={() => onTypeChange('reddit')}
          type="button"
        >
          <MessageSquare />
          <TypeTitle $selected={selectedType === 'reddit'} $color={SOURCE_COLORS.reddit}>
            Reddit
          </TypeTitle>
          <TypeDescription>Follow a subreddit</TypeDescription>
        </TypeCard>

        <TypeCard
          $selected={selectedType === 'bluesky'}
          $color={SOURCE_COLORS.bluesky}
          onClick={() => onTypeChange('bluesky')}
          type="button"
        >
          <Cloud />
          <TypeTitle $selected={selectedType === 'bluesky'} $color={SOURCE_COLORS.bluesky}>
            Bluesky
          </TypeTitle>
          <TypeDescription>Follow a Bluesky user</TypeDescription>
        </TypeCard>

        <TypeCard
          $selected={selectedType === 'publicfead'}
          $color={SOURCE_COLORS.publicfead}
          onClick={() => onTypeChange('publicfead')}
          type="button"
        >
          <Globe />
          <TypeTitle $selected={selectedType === 'publicfead'} $color={SOURCE_COLORS.publicfead}>
            Public Fead
          </TypeTitle>
          <TypeDescription>Subscribe to shared collections</TypeDescription>
        </TypeCard>
      </TypeGrid>
    </Container>
  );
};
