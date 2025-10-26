import React from 'react';
import styled from 'styled-components';
import { RefreshCw, Settings, BarChart3 } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { SettingsPanel } from '../SettingsPanel';
import { useUIStore } from '../../stores/uiStore';

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

const IconButton = styled.button`
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

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Main = styled.main`
  flex: 1;
`;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { toggleSettingsPanel, toggleFeedControlsPanel } = useUIStore();

  const handleRefresh = () => {
    console.log('Refresh clicked');
    // TODO: Implement refresh functionality
  };

  return (
    <LayoutContainer>
      <Header>
        <Logo>
          Mai<span>fead</span>
        </Logo>
        <HeaderActions>
          <IconButton onClick={handleRefresh} aria-label="Refresh feed" title="Refresh feed">
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
