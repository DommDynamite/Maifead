import React from 'react';
import styled, { keyframes } from 'styled-components';
import type { ViewMode } from '../../stores/uiStore';

interface CardSkeletonProps {
  viewMode?: ViewMode;
}

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonContainer = styled.div<{ $compact?: boolean }>`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  display: ${props => (props.$compact ? 'flex' : 'block')};
  align-items: ${props => (props.$compact ? 'center' : 'unset')};
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.border} 0%,
    ${props => props.theme.colors.surfaceHover} 50%,
    ${props => props.theme.colors.border} 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
  border-radius: ${props => props.theme.borderRadius.sm};
`;

const Header = styled.div<{ $compact?: boolean }>`
  display: ${props => (props.$compact ? 'none' : 'flex')};
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  padding-bottom: ${props => props.theme.spacing[3]};
`;

const IconSkeleton = styled(SkeletonBase)`
  width: 20px;
  height: 20px;
  border-radius: ${props => props.theme.borderRadius.sm};
`;

const TextSkeleton = styled(SkeletonBase)<{ $width: string; $height?: string }>`
  width: ${props => props.$width};
  height: ${props => props.$height || '14px'};
`;

const MediaContainer = styled.div<{ $compact?: boolean }>`
  padding: ${props =>
    props.$compact
      ? `${props.theme.spacing[3]} ${props.theme.spacing[3]} ${props.theme.spacing[3]} ${props.theme.spacing[4]}`
      : `0 ${props.theme.spacing[4]} ${props.theme.spacing[4]} ${props.theme.spacing[4]}`};
  flex-shrink: 0;
`;

const MediaSkeleton = styled(SkeletonBase)<{ $compact?: boolean }>`
  width: ${props => (props.$compact ? '120px' : '100%')};
  aspect-ratio: ${props => (props.$compact ? '4 / 3' : '16 / 9')};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const Body = styled.div<{ $compact?: boolean }>`
  padding: ${props => (props.$compact ? props.theme.spacing[3] : props.theme.spacing[4])};
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const TitleSkeleton = styled(SkeletonBase)<{ $compact?: boolean }>`
  width: ${props => (props.$compact ? '80%' : '90%')};
  height: ${props => (props.$compact ? '16px' : '24px')};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const ExcerptLine = styled(SkeletonBase)<{ $width: string }>`
  width: ${props => props.$width};
  height: 14px;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const TagsContainer = styled.div<{ $compact?: boolean }>`
  display: ${props => (props.$compact ? 'none' : 'flex')};
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[2]};
`;

const TagSkeleton = styled(SkeletonBase)`
  width: 60px;
  height: 24px;
  border-radius: ${props => props.theme.borderRadius.base};
`;

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ viewMode = 'detailed' }) => {
  const isCompact = viewMode === 'compact';

  return (
    <SkeletonContainer $compact={isCompact}>
      <Header $compact={isCompact}>
        <IconSkeleton />
        <TextSkeleton $width="120px" />
        <TextSkeleton $width="80px" />
      </Header>

      <MediaContainer $compact={isCompact}>
        <MediaSkeleton $compact={isCompact} />
      </MediaContainer>

      <Body $compact={isCompact}>
        <TitleSkeleton $compact={isCompact} />
        {!isCompact && (
          <>
            <ExcerptLine $width="100%" />
            <ExcerptLine $width="95%" />
            <ExcerptLine $width="80%" />
          </>
        )}
        {isCompact && <TextSkeleton $width="150px" />}
        <TagsContainer $compact={isCompact}>
          <TagSkeleton />
          <TagSkeleton />
          <TagSkeleton />
        </TagsContainer>
      </Body>
    </SkeletonContainer>
  );
};
