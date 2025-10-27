import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Library, Folder, Settings, User } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border};
  display: none;
  z-index: ${props => props.theme.zIndex.modal - 1};
  padding-bottom: env(safe-area-inset-bottom); /* iOS notch support */

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: flex;
  }
`;

const NavList = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  padding: 0 ${props => props.theme.spacing[2]};
`;

const NavButton = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[2]};
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  position: relative;
  flex: 1;
  max-width: 80px;
  color: ${props => (props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary)};

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const NavLabel = styled.span`
  font-size: 11px;
  font-weight: ${props => props.theme.fontWeights.medium};
  white-space: nowrap;
`;

const ActiveIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  background: ${props => props.theme.colors.primary};
  border-radius: 0 0 ${props => props.theme.borderRadius.full} ${props => props.theme.borderRadius.full};
`;

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeView,
    setActiveView,
    toggleFeadsPanel,
    toggleCollectionsPanel,
    isFeadsPanelOpen,
    isCollectionsPanelOpen,
  } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  const isOnSourcesPage = location.pathname === '/sources';
  const isOnProfilePage = location.pathname === '/profile';
  const isOnAuthPage = location.pathname === '/auth';
  const isOnFeedPage = location.pathname === '/';

  const handleHomeClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    useUIStore.getState().clearSourceSelection();
  };

  const handleFeadsClick = () => {
    if (!isOnFeedPage) {
      navigate('/');
    }
    toggleFeadsPanel();
  };

  const handleCollectionsClick = () => {
    if (!isOnFeedPage) {
      navigate('/');
    }
    toggleCollectionsPanel();
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

  return (
    <NavContainer>
      <NavList>
        <NavButton
          $active={isOnFeedPage && activeView === 'all'}
          onClick={handleHomeClick}
          aria-label="The Fead"
        >
          {isOnFeedPage && activeView === 'all' && <ActiveIndicator />}
          <Home />
          <NavLabel>Feed</NavLabel>
        </NavButton>

        <NavButton
          $active={isOnFeedPage && (isFeadsPanelOpen || activeView === 'fead')}
          onClick={handleFeadsClick}
          aria-label="Feads"
        >
          {isOnFeedPage && (isFeadsPanelOpen || activeView === 'fead') && <ActiveIndicator />}
          <Library />
          <NavLabel>Feads</NavLabel>
        </NavButton>

        <NavButton
          $active={isOnFeedPage && (isCollectionsPanelOpen || activeView === 'collection')}
          onClick={handleCollectionsClick}
          aria-label="Collections"
        >
          {isOnFeedPage && (isCollectionsPanelOpen || activeView === 'collection') && <ActiveIndicator />}
          <Folder />
          <NavLabel>Saved</NavLabel>
        </NavButton>

        <NavButton
          $active={isOnSourcesPage}
          onClick={handleSettingsClick}
          aria-label="Manage Sources"
        >
          {isOnSourcesPage && <ActiveIndicator />}
          <Settings />
          <NavLabel>Sources</NavLabel>
        </NavButton>

        <NavButton
          $active={isOnProfilePage || isOnAuthPage}
          onClick={handleUserClick}
          aria-label={isAuthenticated ? 'Profile' : 'Sign In'}
        >
          {(isOnProfilePage || isOnAuthPage) && <ActiveIndicator />}
          <User />
          <NavLabel>{isAuthenticated ? 'Profile' : 'Sign In'}</NavLabel>
        </NavButton>
      </NavList>
    </NavContainer>
  );
};
