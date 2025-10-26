import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3 } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { ViewModeToggle } from './ViewModeToggle';
import { SortOptions } from './SortOptions';
import { FeedStatistics } from './FeedStatistics';
import { SourceBreakdown } from './SourceBreakdown';
import type { FeedItem } from '@maifead/types';

interface FeedControlsPanelProps {
  items: FeedItem[];
}

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${props => props.theme.zIndex.modal};
`;

const Panel = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
  background: ${props => props.theme.colors.surface};
  border-left: 1px solid ${props => props.theme.colors.border};
  z-index: ${props => props.theme.zIndex.modal + 1};
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[5]} ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
`;

const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};

  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.theme.colors.primary};
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border-radius: ${props => props.theme.borderRadius.base};
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
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[6]};
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border};
`;

const panelVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const FeedControlsPanel: React.FC<FeedControlsPanelProps> = ({ items }) => {
  const { isFeedControlsPanelOpen, toggleFeedControlsPanel, viewMode, setViewMode, sortBy, setSortBy, readItemIds } =
    useUIStore();

  return (
    <AnimatePresence>
      {isFeedControlsPanelOpen && (
        <>
          <Overlay
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={toggleFeedControlsPanel}
          />
          <Panel
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <Header>
              <Title>
                <BarChart3 />
                Feed Controls
              </Title>
              <CloseButton onClick={toggleFeedControlsPanel}>
                <X />
              </CloseButton>
            </Header>

            <Content>
              <ViewModeToggle value={viewMode} onChange={setViewMode} />

              <Divider />

              <SortOptions value={sortBy} onChange={setSortBy} />

              <Divider />

              <FeedStatistics items={items} readItemIds={readItemIds} />

              <Divider />

              <SourceBreakdown items={items} />
            </Content>
          </Panel>
        </>
      )}
    </AnimatePresence>
  );
};
