import React from 'react';
import styled from 'styled-components';

interface RSSFeedFormProps {
  url: string;
  name: string;
  onUrlChange: (url: string) => void;
  onNameChange: (name: string) => void;
}

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.base};
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

const HelpText = styled.p`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

export const RSSFeedForm: React.FC<RSSFeedFormProps> = ({ url, name, onUrlChange, onNameChange }) => {
  return (
    <>
      <FormGroup>
        <Label htmlFor="rss-url">RSS Feed URL *</Label>
        <Input
          id="rss-url"
          type="url"
          value={url}
          onChange={e => onUrlChange(e.target.value)}
          placeholder="https://blog.example.com/feed.xml"
          required
        />
        <HelpText>Enter the URL of the RSS feed</HelpText>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="rss-name">Display Name (Optional)</Label>
        <Input
          id="rss-name"
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g., Tech Blog"
        />
        <HelpText>Leave empty to auto-detect from feed</HelpText>
      </FormGroup>
    </>
  );
};
