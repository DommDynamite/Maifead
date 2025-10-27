import React, { useState } from 'react';
import styled from 'styled-components';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterConfig } from './FilterConfig';
import { SourceTypeSelector } from './SourceTypeSelector';
import { RSSFeedForm } from './RSSFeedForm';
import { YouTubeChannelForm } from './YouTubeChannelForm';
import { RedditSourceForm } from './RedditSourceForm';
import { useFeedSourceStore } from '../../stores/feedSourceStore';
import type { FeedSourceInput, SourceType, RedditSourceType } from '@maifead/types';

interface AddFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: ${props => props.theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[4]};
`;

const Modal = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.colors.border};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[5]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: ${props => props.theme.borderRadius.base};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[5]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const FilterSection = styled(motion.div)`
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[5]};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  border: none;

  ${props => {
    if (props.$variant === 'primary') {
      return `
        background: ${props.theme.colors.primary};
        color: white;

        &:hover {
          background: ${props.theme.colors.primaryDark};
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `;
    } else {
      return `
        background: transparent;
        color: ${props.theme.colors.textSecondary};
        border: 1px solid ${props.theme.colors.border};

        &:hover {
          background: ${props.theme.colors.surfaceHover};
          color: ${props.theme.colors.text};
        }
      `;
    }
  }}
`;

export const AddFeedModal: React.FC<AddFeedModalProps> = ({ isOpen, onClose }) => {
  const { createSource } = useFeedSourceStore();
  const [sourceType, setSourceType] = useState<SourceType>('rss');
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [redditSourceType, setRedditSourceType] = useState<RedditSourceType>('subreddit');
  const [youtubeShortsFilter, setYoutubeShortsFilter] = useState<'all' | 'exclude' | 'only'>('all');
  const [whitelistKeywords, setWhitelistKeywords] = useState<string[]>([]);
  const [blacklistKeywords, setBlacklistKeywords] = useState<string[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const handleSubmit = () => {
    // Validation based on source type
    if (sourceType === 'reddit') {
      if (!url.trim()) {
        alert(`Please enter a ${redditSourceType === 'subreddit' ? 'subreddit name' : 'username'}`);
        return;
      }
    } else {
      if (!url.trim()) {
        alert('Please enter a URL');
        return;
      }

      // Basic URL validation for RSS and YouTube
      try {
        new URL(url);
      } catch {
        alert('Please enter a valid URL');
        return;
      }
    }

    // Build the input based on source type
    const input: FeedSourceInput = {
      type: sourceType,
      isEnabled: true,
      whitelistKeywords: whitelistKeywords.length > 0 ? whitelistKeywords : undefined,
      blacklistKeywords: blacklistKeywords.length > 0 ? blacklistKeywords : undefined,
      name: '',
      url: '',
    };

    if (sourceType === 'rss') {
      input.name = name.trim() || new URL(url).hostname;
      input.url = url.trim();
    } else if (sourceType === 'youtube') {
      input.name = name.trim() || 'YouTube Channel';
      input.url = url.trim();
      input.youtubeShortsFilter = youtubeShortsFilter;
      // Extract channel ID from URL (mock implementation)
      const channelIdMatch = url.match(/(@[\w-]+|channel\/([\w-]+)|\/c\/([\w-]+))/);
      if (channelIdMatch) {
        input.channelId = channelIdMatch[0];
      }
    } else if (sourceType === 'reddit') {
      const identifier = url.trim();
      if (redditSourceType === 'subreddit') {
        input.name = name.trim() || `r/${identifier}`;
        input.url = identifier.startsWith('http') ? identifier : `https://www.reddit.com/r/${identifier}`;
        input.subreddit = identifier;
        input.redditSourceType = 'subreddit';
      } else {
        input.name = name.trim() || `u/${identifier}`;
        input.url = identifier.startsWith('http') ? identifier : `https://www.reddit.com/user/${identifier}`;
        input.redditUsername = identifier;
        input.redditSourceType = 'user';
      }
    }

    createSource(input);
    handleClose();
  };

  const handleClose = () => {
    setSourceType('rss');
    setUrl('');
    setName('');
    setRedditSourceType('subreddit');
    setYoutubeShortsFilter('all');
    setWhitelistKeywords([]);
    setBlacklistKeywords([]);
    setIsFilterExpanded(false);
    onClose();
  };

  const handleTypeChange = (type: SourceType) => {
    setSourceType(type);
    // Clear form when type changes
    setUrl('');
    setName('');
    setRedditSourceType('subreddit');
    setYoutubeShortsFilter('all');
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return url.trim().length > 0;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <Modal
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <Header>
              <Title>Add Source</Title>
              <CloseButton onClick={handleClose} aria-label="Close modal">
                <X />
              </CloseButton>
            </Header>

            <Content>
              {/* Source Type Selector */}
              <SourceTypeSelector selectedType={sourceType} onTypeChange={handleTypeChange} />

              {/* Dynamic Form based on source type */}
              {sourceType === 'rss' && (
                <RSSFeedForm url={url} name={name} onUrlChange={setUrl} onNameChange={setName} />
              )}

              {sourceType === 'youtube' && (
                <YouTubeChannelForm
                  url={url}
                  name={name}
                  shortsFilter={youtubeShortsFilter}
                  onUrlChange={setUrl}
                  onNameChange={setName}
                  onShortsFilterChange={setYoutubeShortsFilter}
                />
              )}

              {sourceType === 'reddit' && (
                <RedditSourceForm
                  url={url}
                  name={name}
                  sourceType={redditSourceType}
                  onUrlChange={setUrl}
                  onNameChange={setName}
                  onSourceTypeChange={setRedditSourceType}
                />
              )}

              {/* Filter Configuration */}
              <FormGroup>
                <ExpandButton onClick={() => setIsFilterExpanded(!isFilterExpanded)}>
                  <span>Configure Filters (Optional)</span>
                  {isFilterExpanded ? <ChevronUp /> : <ChevronDown />}
                </ExpandButton>

                <AnimatePresence>
                  {isFilterExpanded && (
                    <FilterSection
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FilterConfig
                        whitelistKeywords={whitelistKeywords}
                        blacklistKeywords={blacklistKeywords}
                        onWhitelistChange={setWhitelistKeywords}
                        onBlacklistChange={setBlacklistKeywords}
                      />
                    </FilterSection>
                  )}
                </AnimatePresence>
              </FormGroup>
            </Content>

            <Footer>
              <Button $variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button $variant="primary" onClick={handleSubmit} disabled={!isFormValid()}>
                Add Source
              </Button>
            </Footer>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};
