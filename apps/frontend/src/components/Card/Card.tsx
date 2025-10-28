import React, { useState } from 'react';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';
import { Star, FolderPlus, ExternalLink, Share2, Bookmark } from 'lucide-react';
import type { ContentItem } from '@maifead/types';
import type { ViewMode } from '../../stores/uiStore';
import { ContextMenu, type ContextMenuItem } from '../ContextMenu/ContextMenu';
import { AddToCollectionModal } from '../Collections/AddToCollectionModal';
import { useUIStore } from '../../stores/uiStore';
import { useToastStore } from '../../stores/toastStore';
import { useFeedStore } from '../../stores/feedStore';

interface CardProps {
  item: ContentItem;
  onClick: () => void;
  viewMode?: ViewMode;
}

const CardContainer = styled.article<{ $isRead?: boolean; $compact?: boolean }>`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  opacity: ${props => (props.$isRead ? 0.6 : 1)};
  display: ${props => (props.$compact ? 'flex' : 'block')};
  align-items: ${props => (props.$compact ? 'center' : 'unset')};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CardHeader = styled.header<{ $compact?: boolean }>`
  display: ${props => (props.$compact ? 'none' : 'flex')};
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  padding-bottom: ${props => props.theme.spacing[3]};
`;

const SourceIcon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: ${props => props.theme.borderRadius.sm};
  flex-shrink: 0;
`;

const SourceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  flex: 1;
  min-width: 0;
`;

const SourceName = styled.span`
  font-weight: ${props => props.theme.fontWeights.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Separator = styled.span`
  &::before {
    content: '•';
  }
`;

const Timestamp = styled.time`
  white-space: nowrap;
`;

const MediaContainer = styled.div<{ $compact?: boolean }>`
  padding: ${props =>
    props.$compact
      ? `${props.theme.spacing[3]} ${props.theme.spacing[3]} ${props.theme.spacing[3]} ${props.theme.spacing[4]}`
      : `0 ${props.theme.spacing[4]} ${props.theme.spacing[4]} ${props.theme.spacing[4]}`};
  position: relative;
  flex-shrink: 0;
`;

const MediaImage = styled.img<{ $compact?: boolean }>`
  width: ${props => (props.$compact ? '120px' : '100%')};
  aspect-ratio: ${props => (props.$compact ? '4 / 3' : '16 / 9')};
  object-fit: cover;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  transition: transform ${props => props.theme.transitions.slow};

  ${CardContainer}:hover & {
    transform: scale(1.02);
  }
`;

const CardBody = styled.div<{ $compact?: boolean }>`
  padding: ${props => (props.$compact ? props.theme.spacing[3] : props.theme.spacing[4])};
  flex: 1;
  min-width: 0;
`;

const Title = styled.h2<{ $compact?: boolean }>`
  font-size: ${props => (props.$compact ? props.theme.fontSizes.base : props.theme.fontSizes.xl)};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => (props.$compact ? props.theme.spacing[1] : props.theme.spacing[3])} 0;
  line-height: ${props => props.theme.lineHeights.tight};
  display: -webkit-box;
  -webkit-line-clamp: ${props => (props.$compact ? 1 : 2)};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Excerpt = styled.p<{ $compact?: boolean }>`
  font-size: ${props => (props.$compact ? props.theme.fontSizes.sm : props.theme.fontSizes.base)};
  color: ${props => props.theme.colors.textSecondary};
  line-height: ${props => props.theme.lineHeights.normal};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: ${props => (props.$compact ? 2 : 3)};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagsContainer = styled.div<{ $compact?: boolean }>`
  display: ${props => (props.$compact ? 'none' : 'flex')};
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
  margin-top: ${props => props.theme.spacing[3]};
`;

const Tag = styled.span`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.primary};
  background: ${props => props.theme.colors.primaryLight};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.base};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const ReadBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing[2]};
  right: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.success};
  color: white;
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.base};
  text-transform: uppercase;
`;

const CompactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const CompactSourceName = styled.span`
  font-weight: ${props => props.theme.fontWeights.medium};
`;

export const Card: React.FC<CardProps> = ({ item, onClick, viewMode = 'detailed' }) => {
  const timeAgo = formatDistanceToNow(item.publishedAt, { addSuffix: true });
  const primaryMedia = item.media?.[0];
  const isCompact = viewMode === 'compact';

  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  const { markItemRead, markItemSaved } = useFeedStore();
  const { success } = useToastStore();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if context menu is open
    if (contextMenuOpen) return;
    onClick();
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      label: 'Add to Collection',
      icon: FolderPlus,
      onClick: () => setCollectionModalOpen(true),
    },
    {
      label: item.isSaved ? 'Remove from Saved' : 'Save for Later',
      icon: item.isSaved ? Bookmark : Star,
      onClick: async () => {
        try {
          await markItemSaved(item.id, !item.isSaved);
          success(item.isSaved ? 'Removed from saved items' : 'Saved for later');
        } catch (error) {
          console.error('Failed to toggle saved status:', error);
        }
      },
    },
    {
      label: item.isRead ? 'Mark as Unread' : 'Mark as Read',
      icon: ExternalLink,
      onClick: async () => {
        try {
          await markItemRead(item.id, !item.isRead);
          success(item.isRead ? 'Marked as unread' : 'Marked as read');
        } catch (error) {
          console.error('Failed to toggle read status:', error);
        }
      },
    },
    {
      label: 'Open in New Tab',
      icon: ExternalLink,
      onClick: () => {
        window.open(item.url, '_blank');
        success('Opened in new tab');
      },
      divider: true,
    },
    {
      label: 'Copy Link',
      icon: Share2,
      onClick: () => {
        navigator.clipboard.writeText(item.url);
        success('Link copied to clipboard');
      },
    },
  ];

  return (
    <>
      <CardContainer
        $isRead={item.isRead}
        $compact={isCompact}
        onClick={handleCardClick}
        onContextMenu={handleContextMenu}
      >
      <CardHeader $compact={isCompact}>
        {item.source.icon && <SourceIcon src={item.source.icon} alt="" loading="lazy" />}
        <SourceInfo>
          <SourceName>{item.source.name}</SourceName>
          <Separator />
          <Timestamp dateTime={item.publishedAt.toISOString()}>{timeAgo}</Timestamp>
        </SourceInfo>
      </CardHeader>

      {primaryMedia && (primaryMedia.type === 'image' || primaryMedia.type === 'video') && (
        <MediaContainer $compact={isCompact}>
          <MediaImage
            $compact={isCompact}
            src={primaryMedia.type === 'video' ? primaryMedia.thumbnail || primaryMedia.url : primaryMedia.url}
            alt={primaryMedia.alt || item.title}
            loading="lazy"
          />
          {item.isRead && !isCompact && <ReadBadge>Read</ReadBadge>}
        </MediaContainer>
      )}

      <CardBody $compact={isCompact}>
        <Title $compact={isCompact}>{item.title}</Title>
        {item.content?.excerpt && <Excerpt $compact={isCompact}>{item.content.excerpt}</Excerpt>}
        {isCompact && (
          <CompactInfo>
            <CompactSourceName>{item.source.name}</CompactSourceName>
            <Separator />
            <Timestamp dateTime={item.publishedAt.toISOString()}>{timeAgo}</Timestamp>
          </CompactInfo>
        )}
        {item.tags && item.tags.length > 0 && (
          <TagsContainer $compact={isCompact}>
            {item.tags.slice(0, 3).map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagsContainer>
        )}
      </CardBody>
    </CardContainer>

      <ContextMenu
        isOpen={contextMenuOpen}
        position={contextMenuPosition}
        items={contextMenuItems}
        onClose={() => setContextMenuOpen(false)}
      />

      <AddToCollectionModal
        isOpen={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        item={item}
      />
    </>
  );
};
