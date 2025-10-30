import React from 'react';
import styled from 'styled-components';

interface RedditSourceFormProps {
  url: string;
  name: string;
  sourceType: 'subreddit' | 'user';
  minUpvotes?: number;
  onUrlChange: (url: string) => void;
  onNameChange: (name: string) => void;
  onSourceTypeChange: (type: 'subreddit' | 'user') => void;
  onMinUpvotesChange?: (minUpvotes: number | undefined) => void;
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

const Select = styled.select`
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.base};
  font-family: ${props => props.theme.fonts.sans};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}22;
  }
`;

export const RedditSourceForm: React.FC<RedditSourceFormProps> = ({
  url,
  name,
  sourceType,
  minUpvotes,
  onUrlChange,
  onNameChange,
  onSourceTypeChange,
  onMinUpvotesChange,
}) => {
  return (
    <>
      <FormGroup>
        <Label htmlFor="reddit-source-type">Source Type *</Label>
        <Select
          id="reddit-source-type"
          value={sourceType}
          onChange={e => onSourceTypeChange(e.target.value as 'subreddit' | 'user')}
        >
          <option value="subreddit">Subreddit</option>
          <option value="user">User Posts</option>
        </Select>
        <HelpText>Choose whether to follow a subreddit or a user's posts</HelpText>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="reddit-url">
          {sourceType === 'subreddit' ? 'Subreddit' : 'Username'} *
        </Label>
        <Input
          id="reddit-url"
          type="text"
          value={url}
          onChange={e => onUrlChange(e.target.value)}
          placeholder={
            sourceType === 'subreddit'
              ? 'programming or r/programming or https://reddit.com/r/programming'
              : 'username or u/username or https://reddit.com/user/username'
          }
          required
        />
        <HelpText>
          Enter the {sourceType === 'subreddit' ? 'subreddit name' : 'username'} or full URL
        </HelpText>
        <ExampleList>
          {sourceType === 'subreddit' ? (
            <>
              <li>
                <code>programming</code>
              </li>
              <li>
                <code>r/programming</code>
              </li>
              <li>
                <code>https://www.reddit.com/r/programming</code>
              </li>
            </>
          ) : (
            <>
              <li>
                <code>spez</code>
              </li>
              <li>
                <code>u/spez</code>
              </li>
              <li>
                <code>https://www.reddit.com/user/spez</code>
              </li>
            </>
          )}
        </ExampleList>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="reddit-name">Display Name (Optional)</Label>
        <Input
          id="reddit-name"
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder={sourceType === 'subreddit' ? 'e.g., Programming' : 'e.g., Spez Posts'}
        />
        <HelpText>Leave empty to use {sourceType === 'subreddit' ? 'subreddit' : 'username'} as name</HelpText>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="reddit-min-upvotes">Minimum Upvotes (Optional)</Label>
        <Input
          id="reddit-min-upvotes"
          type="number"
          min="0"
          value={minUpvotes ?? ''}
          onChange={e => {
            const value = e.target.value;
            console.log('[RedditSourceForm] Input changed - raw value:', value);
            if (onMinUpvotesChange) {
              const parsedValue = value === '' ? undefined : parseInt(value, 10);
              console.log('[RedditSourceForm] Calling onMinUpvotesChange with:', parsedValue);
              onMinUpvotesChange(parsedValue);
            }
          }}
          placeholder="e.g., 100"
        />
        <HelpText>Only show posts with at least this many upvotes. Leave empty to show all posts.</HelpText>
      </FormGroup>
    </>
  );
};
