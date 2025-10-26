import React from 'react';
import styled from 'styled-components';
import { Inbox, Search, Rss, Filter } from 'lucide-react';

export type EmptyStateType = 'no-items' | 'no-results' | 'no-sources' | 'no-collection-items';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[4]};
  text-align: center;
  min-height: 400px;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing[6]};

  svg {
    width: 40px;
    height: 40px;
    color: ${props => props.theme.colors.primary};
  }
`;

const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing[3]} 0;
`;

const Message = styled.p`
  font-size: ${props => props.theme.fontSizes.base};
  color: ${props => props.theme.colors.textSecondary};
  max-width: 400px;
  margin: 0 0 ${props => props.theme.spacing[6]} 0;
  line-height: ${props => props.theme.lineHeights.relaxed};
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }

  &:active {
    transform: translateY(0);
  }
`;

const getDefaultContent = (type: EmptyStateType) => {
  switch (type) {
    case 'no-items':
      return {
        icon: Inbox,
        title: 'No items yet',
        message: "You don't have any feed items yet. Add some sources to get started!",
      };
    case 'no-results':
      return {
        icon: Search,
        title: 'No results found',
        message: 'Try adjusting your search or filters to find what you\'re looking for.',
      };
    case 'no-sources':
      return {
        icon: Rss,
        title: 'No sources added',
        message: 'Add RSS feeds, YouTube channels, or Reddit subreddits to start building your feed.',
      };
    case 'no-collection-items':
      return {
        icon: Filter,
        title: 'Collection is empty',
        message: 'Right-click any article card and select "Add to Collection" to add items here.',
      };
    default:
      return {
        icon: Inbox,
        title: 'Nothing here',
        message: '',
      };
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({ type, title, message, action }) => {
  const defaultContent = getDefaultContent(type);
  const Icon = defaultContent.icon;

  return (
    <Container>
      <IconWrapper>
        <Icon />
      </IconWrapper>
      <Title>{title || defaultContent.title}</Title>
      <Message>{message || defaultContent.message}</Message>
      {action && (
        <ActionButton onClick={action.onClick}>
          {action.label}
        </ActionButton>
      )}
    </Container>
  );
};
