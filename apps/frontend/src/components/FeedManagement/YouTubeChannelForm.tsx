import React from 'react';
import styled from 'styled-components';

interface YouTubeChannelFormProps {
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

const ExampleList = styled.ul`
  margin: ${props => props.theme.spacing[2]} 0 0;
  padding-left: ${props => props.theme.spacing[5]};
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};

  li {
    margin-bottom: ${props => props.theme.spacing[1]};
  }

  code {
    font-family: ${props => props.theme.fonts.mono};
    background: ${props => props.theme.colors.surfaceHover};
    padding: 2px 6px;
    border-radius: ${props => props.theme.borderRadius.sm};
    color: ${props => props.theme.colors.text};
  }
`;

export const YouTubeChannelForm: React.FC<YouTubeChannelFormProps> = ({
  url,
  name,
  onUrlChange,
  onNameChange,
}) => {
  return (
    <>
      <FormGroup>
        <Label htmlFor="youtube-url">YouTube Channel URL *</Label>
        <Input
          id="youtube-url"
          type="url"
          value={url}
          onChange={e => onUrlChange(e.target.value)}
          placeholder="https://www.youtube.com/@channelname"
          required
        />
        <HelpText>Enter the URL of the YouTube channel</HelpText>
        <ExampleList>
          <li>
            <code>https://www.youtube.com/@Fireship</code>
          </li>
          <li>
            <code>https://www.youtube.com/c/TechWithTim</code>
          </li>
          <li>
            <code>https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA</code>
          </li>
        </ExampleList>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="youtube-name">Display Name (Optional)</Label>
        <Input
          id="youtube-name"
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g., Fireship"
        />
        <HelpText>Leave empty to auto-detect from channel</HelpText>
      </FormGroup>
    </>
  );
};
