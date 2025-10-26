import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterConfig } from './FilterConfig';
import { useFeedSourceStore } from '../../stores/feedSourceStore';
import type { FeedSource } from '@maifead/types';

interface EditFeedModalProps {
  isOpen: boolean;
  source: FeedSource | null;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${props => props.theme.colors.surfaceHover};
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

const SectionTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
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

export const EditFeedModal: React.FC<EditFeedModalProps> = ({ isOpen, source, onClose }) => {
  const { updateSource } = useFeedSourceStore();
  const [name, setName] = useState('');
  const [whitelistKeywords, setWhitelistKeywords] = useState<string[]>([]);
  const [blacklistKeywords, setBlacklistKeywords] = useState<string[]>([]);

  // Sync state with source prop when it changes
  useEffect(() => {
    if (source) {
      setName(source.name);
      setWhitelistKeywords(source.whitelistKeywords || []);
      setBlacklistKeywords(source.blacklistKeywords || []);
    }
  }, [source]);

  const handleSubmit = () => {
    if (!source || !name.trim()) return;

    updateSource(source.id, {
      name: name.trim(),
      whitelistKeywords: whitelistKeywords,
      blacklistKeywords: blacklistKeywords,
    });

    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!source) return null;

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
              <Title>Edit Feed Source</Title>
              <CloseButton onClick={handleClose} aria-label="Close modal">
                <X />
              </CloseButton>
            </Header>

            <Content>
              <FormGroup>
                <Label htmlFor="feed-type-display">Source Type</Label>
                <Input
                  id="feed-type-display"
                  type="text"
                  value={source.type.toUpperCase()}
                  disabled
                  readOnly
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="feed-url-display">
                  {source.type === 'reddit' ? 'Subreddit' : 'URL'}
                </Label>
                <Input
                  id="feed-url-display"
                  type={source.type === 'reddit' ? 'text' : 'url'}
                  value={source.type === 'reddit' ? source.subreddit || '' : source.url}
                  disabled
                  readOnly
                />
                <HelpText>
                  {source.type === 'reddit'
                    ? 'Subreddit cannot be changed.'
                    : 'URL cannot be changed.'} Delete and re-add to change.
                </HelpText>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="feed-name-edit">Display Name *</Label>
                <Input
                  id="feed-name-edit"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Tech Blog"
                  required
                />
              </FormGroup>

              <FormGroup>
                <SectionTitle>Filters</SectionTitle>
                <FilterConfig
                  whitelistKeywords={whitelistKeywords}
                  blacklistKeywords={blacklistKeywords}
                  onWhitelistChange={setWhitelistKeywords}
                  onBlacklistChange={setBlacklistKeywords}
                />
              </FormGroup>
            </Content>

            <Footer>
              <Button $variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button $variant="primary" onClick={handleSubmit} disabled={!name.trim()}>
                Save Changes
              </Button>
            </Footer>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};
