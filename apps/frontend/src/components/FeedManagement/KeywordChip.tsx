import React from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';

interface KeywordChipProps {
  keyword: string;
  variant?: 'whitelist' | 'blacklist';
  onRemove: (keyword: string) => void;
}

const Chip = styled.div<{ $variant: 'whitelist' | 'blacklist' }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  transition: all ${props => props.theme.transitions.fast};

  ${props => {
    if (props.$variant === 'whitelist') {
      return `
        background: ${props.theme.colors.primary}22;
        color: ${props.theme.colors.primary};
        border: 1px solid ${props.theme.colors.primary}44;

        &:hover {
          background: ${props.theme.colors.primary}33;
          border-color: ${props.theme.colors.primary}66;
        }
      `;
    } else {
      return `
        background: #ff444422;
        color: #ff4444;
        border: 1px solid #ff444444;

        &:hover {
          background: #ff444433;
          border-color: #ff444466;
        }
      `;
    }
  }}
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    opacity: 0.7;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const KeywordChip: React.FC<KeywordChipProps> = ({ keyword, variant = 'whitelist', onRemove }) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(keyword);
  };

  return (
    <Chip $variant={variant}>
      <span>{keyword}</span>
      <RemoveButton onClick={handleRemove} aria-label={`Remove ${keyword}`}>
        <X />
      </RemoveButton>
    </Chip>
  );
};
