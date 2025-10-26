import React from 'react';
import styled from 'styled-components';

interface RedditSubredditFormProps {
  subreddit: string;
  name: string;
  onSubredditChange: (subreddit: string) => void;
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

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Prefix = styled.span`
  position: absolute;
  left: ${props => props.theme.spacing[3]};
  font-size: ${props => props.theme.fontSizes.base};
  color: ${props => props.theme.colors.textSecondary};
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[3]};
  padding-left: ${props => props.theme.spacing[8]};
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

export const RedditSubredditForm: React.FC<RedditSubredditFormProps> = ({
  subreddit,
  name,
  onSubredditChange,
  onNameChange,
}) => {
  return (
    <>
      <FormGroup>
        <Label htmlFor="reddit-subreddit">Subreddit Name *</Label>
        <InputWrapper>
          <Prefix>r/</Prefix>
          <Input
            id="reddit-subreddit"
            type="text"
            value={subreddit}
            onChange={e => onSubredditChange(e.target.value)}
            placeholder="programming"
            required
          />
        </InputWrapper>
        <HelpText>Enter the subreddit name (without r/)</HelpText>
        <ExampleList>
          <li>
            <code>programming</code> → r/programming
          </li>
          <li>
            <code>webdev</code> → r/webdev
          </li>
          <li>
            <code>rust</code> → r/rust
          </li>
        </ExampleList>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="reddit-name">Display Name (Optional)</Label>
        <Input
          id="reddit-name"
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g., Programming"
        />
        <HelpText>Leave empty to use subreddit name</HelpText>
      </FormGroup>
    </>
  );
};
