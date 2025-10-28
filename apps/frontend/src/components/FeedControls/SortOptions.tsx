import React from 'react';
import styled from 'styled-components';
import { ArrowDown, ArrowUp, ListOrdered, Clock, Shuffle } from 'lucide-react';
import type { SortBy } from '../../stores/uiStore';

interface SortOptionsProps {
  value: SortBy;
  onChange: (sort: SortBy) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
`;

const OptionsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const OptionButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => (props.$active ? props.theme.colors.primary + '22' : 'transparent')};
  color: ${props => (props.$active ? props.theme.colors.primary : props.theme.colors.text)};
  border: 1px solid ${props => (props.$active ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => (props.$active ? props.theme.colors.primary + '33' : props.theme.colors.surfaceHover)};
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

const OptionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
  flex: 1;
`;

const OptionTitle = styled.div`
  font-weight: ${props => props.theme.fontWeights.semibold};
`;

const OptionDescription = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

export const SortOptions: React.FC<SortOptionsProps> = ({ value, onChange }) => {
  return (
    <Container>
      <Label>Sort By</Label>
      <OptionsGroup>
        <OptionButton $active={value === 'newest'} onClick={() => onChange('newest')}>
          <ArrowDown />
          <OptionText>
            <OptionTitle>Newest First</OptionTitle>
            <OptionDescription>Most recent items at the top</OptionDescription>
          </OptionText>
        </OptionButton>

        <OptionButton $active={value === 'oldest'} onClick={() => onChange('oldest')}>
          <ArrowUp />
          <OptionText>
            <OptionTitle>Oldest First</OptionTitle>
            <OptionDescription>Older items at the top</OptionDescription>
          </OptionText>
        </OptionButton>

        <OptionButton $active={value === 'source-az'} onClick={() => onChange('source-az')}>
          <ListOrdered />
          <OptionText>
            <OptionTitle>Source (A-Z)</OptionTitle>
            <OptionDescription>Alphabetically by source name</OptionDescription>
          </OptionText>
        </OptionButton>

        <OptionButton $active={value === 'source-recent'} onClick={() => onChange('source-recent')}>
          <Clock />
          <OptionText>
            <OptionTitle>Source (Most Recent)</OptionTitle>
            <OptionDescription>By source's latest item</OptionDescription>
          </OptionText>
        </OptionButton>

        <OptionButton $active={value === 'shuffle'} onClick={() => onChange('shuffle')}>
          <Shuffle />
          <OptionText>
            <OptionTitle>Shuffle</OptionTitle>
            <OptionDescription>Interleave items evenly from all sources</OptionDescription>
          </OptionText>
        </OptionButton>
      </OptionsGroup>
    </Container>
  );
};
