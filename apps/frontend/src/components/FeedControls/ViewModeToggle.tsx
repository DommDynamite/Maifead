import React from 'react';
import styled from 'styled-components';
import { LayoutList, LayoutGrid } from 'lucide-react';
import type { ViewMode } from '../../stores/uiStore';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
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

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing[2]};
`;

const ModeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => (props.$active ? props.theme.colors.primary : 'transparent')};
  color: ${props => (props.$active ? 'white' : props.theme.colors.text)};
  border: 1px solid ${props => (props.$active ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => (props.$active ? props.theme.colors.primaryDark : props.theme.colors.surfaceHover)};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ value, onChange }) => {
  return (
    <Container>
      <Label>View Mode</Label>
      <ButtonGroup>
        <ModeButton $active={value === 'detailed'} onClick={() => onChange('detailed')}>
          <LayoutGrid />
          Detailed
        </ModeButton>
        <ModeButton $active={value === 'compact'} onClick={() => onChange('compact')}>
          <LayoutList />
          Compact
        </ModeButton>
      </ButtonGroup>
    </Container>
  );
};
