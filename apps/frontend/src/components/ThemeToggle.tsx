import React from 'react';
import styled from 'styled-components';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

const ToggleButton = styled.button`
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

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useThemeStore();

  return (
    <ToggleButton onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
      {mode === 'light' ? <Moon /> : <Sun />}
    </ToggleButton>
  );
};
