import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, type ToastType } from '../../stores/toastStore';

const Container = styled.div`
  position: fixed;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.modal + 10};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
  pointer-events: none;
  max-width: 400px;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    left: ${props => props.theme.spacing[4]};
    right: ${props => props.theme.spacing[4]};
    max-width: none;
  }
`;

const Toast = styled(motion.div)<{ $type: ToastType }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.surface};
  border: 1px solid
    ${props => {
      switch (props.$type) {
        case 'success':
          return props.theme.colors.success;
        case 'error':
          return props.theme.colors.danger;
        case 'warning':
          return props.theme.colors.warning;
        case 'info':
        default:
          return props.theme.colors.primary;
      }
    }};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  pointer-events: auto;
  min-width: 300px;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    min-width: 0;
  }
`;

const IconWrapper = styled.div<{ $type: ToastType }>`
  flex-shrink: 0;
  color: ${props => {
    switch (props.$type) {
      case 'success':
        return props.theme.colors.success;
      case 'error':
        return props.theme.colors.danger;
      case 'warning':
        return props.theme.colors.warning;
      case 'info':
      default:
        return props.theme.colors.primary;
    }
  }};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Message = styled.div`
  flex: 1;
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const toastVariants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, x: 100, scale: 0.95 },
};

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <CheckCircle />;
    case 'error':
      return <XCircle />;
    case 'warning':
      return <AlertTriangle />;
    case 'info':
    default:
      return <Info />;
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <Container>
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            $type={toast.type}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <IconWrapper $type={toast.type}>{getIcon(toast.type)}</IconWrapper>
            <Message>{toast.message}</Message>
            <CloseButton onClick={() => removeToast(toast.id)}>
              <X />
            </CloseButton>
          </Toast>
        ))}
      </AnimatePresence>
    </Container>
  );
};
