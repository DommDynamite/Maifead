import React, { useState } from 'react';
import styled from 'styled-components';
import { RefreshCw, Settings, BarChart3 } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { SettingsPanel } from '../SettingsPanel';
import { useUIStore } from '../../stores/uiStore';
import { useFeedStore } from '../../stores/feedStore';
import { useToastStore } from '../../stores/toastStore';
import { api } from '../../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-left: 64px; // Space for icon rail

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding-left: 0; // No icon rail on mobile
    padding-bottom: calc(60px + env(safe-area-inset-bottom)); // Space for bottom nav + iOS safe area
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: ${props => props.theme.zIndex.sticky};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.surface}e6;
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${props => props.theme.colors.border};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const Logo = styled.h1`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;

  span {
    color: ${props => props.theme.colors.primary};
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSizes.lg};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const IconButton = styled.button<{ $isSpinning?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.base};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;
  border: none;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }

  &:active {
    background: ${props => props.theme.colors.surfaceActive};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
    animation: ${props => props.$isSpinning ? 'spin 1s linear infinite' : 'none'};
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Main = styled.main`
  flex: 1;
`;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toggleSettingsPanel, toggleFeedControlsPanel } = useUIStore();
  const { fetchItems } = useFeedStore();
  const { addToast } = useToastStore();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await api.refreshAllSources();
      await fetchItems({ limit: 500 });

      if (result.totalNewItems > 0) {
        addToast('success', `Found ${result.totalNewItems} new ${result.totalNewItems === 1 ? 'item' : 'items'} from ${result.sourcesRefreshed} ${result.sourcesRefreshed === 1 ? 'source' : 'sources'}`);
      } else {
        addToast('info', 'All sources are up to date');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      addToast('error', 'Failed to refresh sources');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <LayoutContainer>
      <Header>
        <Logo>
          Mai<span>fead</span>
        </Logo>
        <HeaderActions>
          <IconButton
            onClick={handleRefresh}
            aria-label="Refresh feed"
            title="Refresh feed"
            $isSpinning={isRefreshing}
            disabled={isRefreshing}
          >
            <RefreshCw />
          </IconButton>
          <IconButton onClick={toggleFeedControlsPanel} aria-label="Feed controls" title="Feed controls & statistics">
            <BarChart3 />
          </IconButton>
          <IconButton onClick={toggleSettingsPanel} aria-label="Settings" title="Display settings">
            <Settings />
          </IconButton>
          <ThemeToggle />
        </HeaderActions>
      </Header>
      <Main>{children}</Main>
      <SettingsPanel />
    </LayoutContainer>
  );
};
