import React, { useMemo } from 'react';
import styled from 'styled-components';
import { TrendingUp } from 'lucide-react';
import type { FeedItem } from '@maifead/types';

interface SourceBreakdownProps {
  items: FeedItem[];
}

interface SourceStats {
  sourceName: string;
  count: number;
  percentage: number;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};

  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.theme.colors.primary};
  }
`;

const SourceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const SourceItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const SourceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SourceName = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
`;

const SourceCount = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const BarContainer = styled.div`
  position: relative;
  height: 6px;
  background: ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
`;

const BarFill = styled.div<{ $percentage: number; $index: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => {
    const colors = [
      props.theme.colors.primary,
      props.theme.colors.secondary,
      '#10b981', // green
      '#f59e0b', // amber
      '#8b5cf6', // purple
    ];
    return colors[props.$index % colors.length];
  }};
  border-radius: ${props => props.theme.borderRadius.full};
  transition: width ${props => props.theme.transitions.base};
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
`;

export const SourceBreakdown: React.FC<SourceBreakdownProps> = ({ items }) => {
  const sourceStats = useMemo(() => {
    const sourceCounts = new Map<string, number>();

    items.forEach(item => {
      const current = sourceCounts.get(item.sourceName) || 0;
      sourceCounts.set(item.sourceName, current + 1);
    });

    const stats: SourceStats[] = Array.from(sourceCounts.entries())
      .map(([sourceName, count]) => ({
        sourceName,
        count,
        percentage: items.length > 0 ? (count / items.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 sources

    return stats;
  }, [items]);

  if (sourceStats.length === 0) {
    return (
      <Container>
        <SectionTitle>
          <TrendingUp />
          Top Sources
        </SectionTitle>
        <EmptyState>No items to analyze</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <SectionTitle>
        <TrendingUp />
        Top Sources
      </SectionTitle>
      <SourceList>
        {sourceStats.map((stat, index) => (
          <SourceItem key={stat.sourceName}>
            <SourceHeader>
              <SourceName>{stat.sourceName}</SourceName>
              <SourceCount>
                {stat.count} {stat.count === 1 ? 'item' : 'items'} ({Math.round(stat.percentage)}%)
              </SourceCount>
            </SourceHeader>
            <BarContainer>
              <BarFill $percentage={stat.percentage} $index={index} />
            </BarContainer>
          </SourceItem>
        ))}
      </SourceList>
    </Container>
  );
};
