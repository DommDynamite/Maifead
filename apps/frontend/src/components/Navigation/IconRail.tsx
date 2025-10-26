import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Radio, Library, Star, Folder, Settings, User, LogOut } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { ThemeToggle } from '../ThemeToggle';

const RailContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 64px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing[3]} 0;
  z-index: ${props => props.theme.zIndex.modal - 1};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none; // Hide on mobile, will use bottom nav instead
  }
`;

const IconList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  flex: 1;
`;

const IconButton = styled.button<{ $active?: boolean }>`
  width: 44px;
  height: 44px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.base};
  background: ${props => (props.$active ? props.theme.colors.primary : 'transparent')};
  color: ${props => (props.$active ? 'white' : props.theme.colors.text)};
  border: none;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  position: relative;

  &:hover {
    background: ${props =>
      props.$active ? props.theme.colors.primaryDark : props.theme.colors.surfaceHover};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Tooltip = styled.span`
  position: absolute;
  left: 60px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  white-space: nowrap;
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border};
  opacity: 0;
  pointer-events: none;
  transition: opacity ${props => props.theme.transitions.fast};

  ${IconButton}:hover & {
    opacity: 1;
  }
`;

const Divider = styled.div`
  width: 32px;
  height: 1px;
  background: ${props => props.theme.colors.border};
  margin: ${props => props.theme.spacing[2]} auto;
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  align-items: center;
`;

export const IconRail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeView,
    setActiveView,
    toggleSourcesPanel,
    toggleFeadsPanel,
    toggleCollectionsPanel,
    toggleSettingsPanel,
    isSourcesPanelOpen,
    isFeadsPanelOpen,
    isCollectionsPanelOpen,
  } = useUIStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const isOnSourcesPage = location.pathname === '/sources';

  const handleAllFeedsClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    setActiveView('all');
  };

  const handleSourcesClick = () => {
    toggleSourcesPanel();
  };

  const handleFeadsClick = () => {
    toggleFeadsPanel();
  };

  const handleCollectionsClick = () => {
    toggleCollectionsPanel();
  };

  const handleSavedClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    setActiveView('saved');
  };

  const handleSettingsClick = () => {
    navigate('/sources');
  };

  const handleUserClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/auth');
  };

  return (
    <RailContainer>
      <IconList>
        <IconButton
          $active={activeView === 'all'}
          onClick={handleAllFeedsClick}
          aria-label="All Feeds"
          title="All Feeds"
        >
          <Home />
          <Tooltip>All Feeds</Tooltip>
        </IconButton>

        <IconButton
          $active={isSourcesPanelOpen || activeView === 'sources'}
          onClick={handleSourcesClick}
          aria-label="Sources"
          title="Sources"
        >
          <Radio />
          <Tooltip>Sources</Tooltip>
        </IconButton>

        <IconButton
          $active={isFeadsPanelOpen || activeView === 'fead'}
          onClick={handleFeadsClick}
          aria-label="Feads"
          title="Feads (Presets)"
        >
          <Library />
          <Tooltip>Feads</Tooltip>
        </IconButton>

        <IconButton
          $active={isCollectionsPanelOpen || activeView === 'collection'}
          onClick={handleCollectionsClick}
          aria-label="Collections"
          title="Collections"
        >
          <Folder />
          <Tooltip>Collections</Tooltip>
        </IconButton>

        <IconButton
          $active={activeView === 'saved'}
          onClick={handleSavedClick}
          aria-label="Saved Items"
          title="Saved Items"
        >
          <Star />
          <Tooltip>Saved</Tooltip>
        </IconButton>
      </IconList>

      <BottomSection>
        <Divider />
        <ThemeToggle />

        {isAuthenticated ? (
          <>
            <IconButton
              onClick={handleUserClick}
              aria-label="Account"
              title={user?.displayName || 'Account'}
            >
              <User />
              <Tooltip>{user?.displayName || 'Account'}</Tooltip>
            </IconButton>
            <IconButton
              onClick={handleLogoutClick}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut />
              <Tooltip>Logout</Tooltip>
            </IconButton>
          </>
        ) : (
          <IconButton
            onClick={handleUserClick}
            aria-label="Sign In"
            title="Sign In"
          >
            <User />
            <Tooltip>Sign In</Tooltip>
          </IconButton>
        )}

        <IconButton
          $active={isOnSourcesPage}
          onClick={handleSettingsClick}
          aria-label="Manage Sources"
          title="Manage Sources"
        >
          <Settings />
          <Tooltip>Manage Sources</Tooltip>
        </IconButton>
      </BottomSection>
    </RailContainer>
  );
};
