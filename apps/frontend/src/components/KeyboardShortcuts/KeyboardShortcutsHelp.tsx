import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import type { KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';
import { formatShortcutKey } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: ${props => props.theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[4]};
`;

const Modal = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: ${props => props.theme.shadows.xl};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
`;

const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};

  svg {
    width: 24px;
    height: 24px;
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
  overflow-y: auto;
  padding: ${props => props.theme.spacing[6]};
`;

const ShortcutSection = styled.div`
  &:not(:last-child) {
    margin-bottom: ${props => props.theme.spacing[6]};
  }
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 ${props => props.theme.spacing[3]} 0;
`;

const ShortcutList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const ShortcutItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const ShortcutDescription = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const ShortcutKeys = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
`;

const Key = styled.kbd`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  font-family: ${props => props.theme.fonts.mono};
  color: ${props => props.theme.colors.text};
  box-shadow: 0 2px 0 ${props => props.theme.colors.border};
`;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

interface ShortcutGroup {
  title: string;
  shortcuts: KeyboardShortcut[];
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose, shortcuts }) => {
  // Group shortcuts by category
  const groups: ShortcutGroup[] = [
    {
      title: 'Navigation',
      shortcuts: shortcuts.filter(s => ['j', 'k', 'ArrowDown', 'ArrowUp'].includes(s.key)),
    },
    {
      title: 'Panels',
      shortcuts: shortcuts.filter(s => ['s', 'f', 'c', 'Escape'].includes(s.key)),
    },
    {
      title: 'Actions',
      shortcuts: shortcuts.filter(s => ['m', '/', 'r', 'Enter'].includes(s.key)),
    },
    {
      title: 'View Controls',
      shortcuts: shortcuts.filter(s => ['v', '1', '2', '3'].includes(s.key)),
    },
    {
      title: 'Help',
      shortcuts: shortcuts.filter(s => s.key === '?'),
    },
  ].filter(group => group.shortcuts.length > 0);

  const renderKeys = (shortcut: KeyboardShortcut) => {
    const keys: string[] = [];

    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.alt) keys.push('Alt');
    if (shortcut.shift) keys.push('Shift');

    // Format special keys
    let mainKey = shortcut.key;
    if (mainKey === 'ArrowUp') mainKey = '↑';
    else if (mainKey === 'ArrowDown') mainKey = '↓';
    else if (mainKey === 'ArrowLeft') mainKey = '←';
    else if (mainKey === 'ArrowRight') mainKey = '→';
    else if (mainKey === 'Enter') mainKey = '↵';
    else if (mainKey === 'Escape') mainKey = 'Esc';
    else mainKey = mainKey.toUpperCase();

    keys.push(mainKey);

    return keys;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <Modal
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <Header>
              <Title>
                <Keyboard />
                Keyboard Shortcuts
              </Title>
              <CloseButton onClick={onClose}>
                <X />
              </CloseButton>
            </Header>

            <Content>
              {groups.map(group => (
                <ShortcutSection key={group.title}>
                  <SectionTitle>{group.title}</SectionTitle>
                  <ShortcutList>
                    {group.shortcuts.map((shortcut, index) => (
                      <ShortcutItem key={`${shortcut.key}-${index}`}>
                        <ShortcutDescription>{shortcut.description}</ShortcutDescription>
                        <ShortcutKeys>
                          {renderKeys(shortcut).map((key, i) => (
                            <React.Fragment key={i}>
                              <Key>{key}</Key>
                              {i < renderKeys(shortcut).length - 1 && <span>+</span>}
                            </React.Fragment>
                          ))}
                        </ShortcutKeys>
                      </ShortcutItem>
                    ))}
                  </ShortcutList>
                </ShortcutSection>
              ))}
            </Content>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};
