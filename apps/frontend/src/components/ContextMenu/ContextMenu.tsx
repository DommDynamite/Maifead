import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export interface ContextMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  divider?: boolean;
  danger?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${props => props.theme.zIndex.modal + 5};
`;

const Menu = styled(motion.div)`
  position: fixed;
  min-width: 200px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.xl};
  overflow: hidden;
  z-index: ${props => props.theme.zIndex.modal + 6};
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: transparent;
  border: none;
  color: ${props => (props.$danger ? props.theme.colors.danger : props.theme.colors.text)};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  text-align: left;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props =>
      props.$danger ? props.theme.colors.danger + '22' : props.theme.colors.surfaceHover};
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border};
  margin: ${props => props.theme.spacing[1]} 0;
`;

const menuVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, position, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust position to keep menu on screen
  useEffect(() => {
    if (!menuRef.current || !isOpen) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let { x, y } = position;

    // Adjust horizontal position
    if (x + menuRect.width > viewportWidth) {
      x = viewportWidth - menuRect.width - 10;
    }

    // Adjust vertical position
    if (y + menuRect.height > viewportHeight) {
      y = viewportHeight - menuRect.height - 10;
    }

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }, [isOpen, position]);

  const handleItemClick = (item: ContextMenuItem) => {
    item.onClick();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay onClick={onClose} />
          <Menu
            ref={menuRef}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15 }}
            style={{ left: position.x, top: position.y }}
          >
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {item.divider && <Divider />}
                <MenuItem $danger={item.danger} onClick={() => handleItemClick(item)}>
                  {item.icon && <item.icon />}
                  {item.label}
                </MenuItem>
              </React.Fragment>
            ))}
          </Menu>
        </>
      )}
    </AnimatePresence>
  );
};
