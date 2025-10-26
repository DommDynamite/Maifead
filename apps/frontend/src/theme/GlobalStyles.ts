import { createGlobalStyle } from 'styled-components';
import type { Theme } from './theme';

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    html {
      font-size: 15px;
    }
  }

  body {
    font-family: ${props => props.theme.fonts.sans};
    font-size: ${props => props.theme.fontSizes.base};
    font-weight: ${props => props.theme.fontWeights.normal};
    line-height: ${props => props.theme.lineHeights.normal};
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.background};
    transition: background-color ${props => props.theme.transitions.slow},
                color ${props => props.theme.transitions.slow};
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${props => props.theme.fontWeights.semibold};
    line-height: ${props => props.theme.lineHeights.tight};
  }

  h1 {
    font-size: ${props => props.theme.fontSizes['3xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
  }

  h2 {
    font-size: ${props => props.theme.fontSizes['2xl']};
  }

  h3 {
    font-size: ${props => props.theme.fontSizes.xl};
  }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: color ${props => props.theme.transitions.fast};

    &:hover {
      color: ${props => props.theme.colors.primaryHover};
    }

    &:active {
      color: ${props => props.theme.colors.primaryActive};
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  /* Focus styles */
  *:focus-visible {
    outline: 2px solid ${props => props.theme.colors.borderFocus};
    outline-offset: 2px;
    border-radius: ${props => props.theme.borderRadius.sm};
  }

  *:focus:not(:focus-visible) {
    outline: none;
  }

  /* Scrollbar styles (webkit) */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.base};
    border: 2px solid ${props => props.theme.colors.background};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.borderHover};
  }

  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;
