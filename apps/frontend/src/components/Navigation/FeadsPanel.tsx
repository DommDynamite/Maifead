import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import { useFeadStore } from '../../stores/feadStore';
import type { FeadWithNames } from '@maifead/types';

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: ${props => props.theme.zIndex.modal};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    background: rgba(0, 0, 0, 0.5);
  }
`;

const Panel = styled(motion.aside)`
  position: fixed;
  left: 64px;
  top: 0;
  height: 100vh;
  width: 280px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: ${props => props.theme.zIndex.modal + 1};
  display: flex;
  flex-direction: column;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    left: 0;
    width: 100%;
    max-width: 320px;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
`;

const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.base};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border: none;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const FeadList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[2]} 0;
`;

const FeadItem = styled.div<{ $active?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => (props.$active ? props.theme.colors.primary + '20' : 'transparent')};

  &:hover {
    background: ${props =>
      props.$active ? props.theme.colors.primary + '30' : props.theme.colors.surfaceHover};
  }
`;

const FeadIcon = styled.span`
  font-size: ${props => props.theme.fontSizes.xl};
  line-height: 1;
  flex-shrink: 0;
`;

const FeadInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FeadName = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SourceCount = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.fast};

  ${FeadItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border: none;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: transform ${props => props.theme.transitions.fast};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ExpandedSources = styled(motion.div)`
  padding-left: ${props => props.theme.spacing[10]};
  overflow: hidden;
`;

const SourceTag = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  padding: ${props => props.theme.spacing[1]} 0;
`;

const Footer = styled.footer`
  padding: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
`;

const AddButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
`;

interface FeadsPanelProps {
  onCreateFead?: () => void;
  onEditFead?: (fead: FeadWithNames) => void;
}

export const FeadsPanel: React.FC<FeadsPanelProps> = ({ onCreateFead, onEditFead }) => {
  const { isFeadsPanelOpen, toggleFeadsPanel, activeFeadId, setActiveFead } = useUIStore();
  const { feads, deleteFead } = useFeadStore();
  const [expandedFeadId, setExpandedFeadId] = useState<string | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      toggleFeadsPanel();
    }
  };

  const handleFeadClick = (feadId: string) => {
    if (activeFeadId === feadId) {
      setActiveFead(null); // Deselect
    } else {
      setActiveFead(feadId);
    }
  };

  const handleExpandClick = (e: React.MouseEvent, feadId: string) => {
    e.stopPropagation();
    setExpandedFeadId(expandedFeadId === feadId ? null : feadId);
  };

  const handleEditClick = (e: React.MouseEvent, fead: FeadWithNames) => {
    e.stopPropagation();
    onEditFead?.(fead);
  };

  const handleDeleteClick = (e: React.MouseEvent, feadId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this Fead?')) {
      deleteFead(feadId);
      if (activeFeadId === feadId) {
        setActiveFead(null);
      }
    }
  };

  return (
    <AnimatePresence>
      {isFeadsPanelOpen && (
        <>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleBackdropClick}
          />
          <Panel
            initial={{ x: -344 }}
            animate={{ x: 0 }}
            exit={{ x: -344 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Header>
              <Title>Feads</Title>
              <CloseButton onClick={toggleFeadsPanel} aria-label="Close panel">
                <X />
              </CloseButton>
            </Header>

            <FeadList>
              {feads.length === 0 ? (
                <EmptyState>
                  No Feads yet.
                  <br />
                  Create your first preset!
                </EmptyState>
              ) : (
                feads.map(fead => {
                  const isActive = activeFeadId === fead.id;
                  const isExpanded = expandedFeadId === fead.id;

                  return (
                    <div key={fead.id}>
                      <FeadItem $active={isActive} onClick={() => handleFeadClick(fead.id)}>
                        <ExpandButton onClick={e => handleExpandClick(e, fead.id)}>
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight />
                          </motion.div>
                        </ExpandButton>

                        <FeadIcon>{fead.icon}</FeadIcon>

                        <FeadInfo>
                          <FeadName>{fead.name}</FeadName>
                          <SourceCount>{fead.sourceNames.length} sources</SourceCount>
                        </FeadInfo>

                        <ActionButtons>
                          <ActionButton
                            onClick={e => handleEditClick(e, fead)}
                            aria-label="Edit Fead"
                            title="Edit"
                          >
                            <Edit2 />
                          </ActionButton>
                          <ActionButton
                            onClick={e => handleDeleteClick(e, fead.id)}
                            aria-label="Delete Fead"
                            title="Delete"
                          >
                            <Trash2 />
                          </ActionButton>
                        </ActionButtons>
                      </FeadItem>

                      <AnimatePresence>
                        {isExpanded && (
                          <ExpandedSources
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {fead.sourceNames.map(sourceName => (
                              <SourceTag key={sourceName}>• {sourceName}</SourceTag>
                            ))}
                          </ExpandedSources>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </FeadList>

            <Footer>
              <AddButton onClick={onCreateFead}>
                <Plus />
                Create Fead
              </AddButton>
            </Footer>
          </Panel>
        </>
      )}
    </AnimatePresence>
  );
};
