import React from 'react';
import styled from 'styled-components';
import { FileText, CheckCircle, Circle, Calendar } from 'lucide-react';
import type { FeedItem } from '@maifead/types';

interface FeedStatisticsProps {
  items: FeedItem[];
  readItemIds: string[];
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
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing[3]};
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.medium};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
`;

const ProgressBar = styled.div`
  margin-top: ${props => props.theme.spacing[3]};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const ProgressTrack = styled.div`
  height: 8px;
  background: ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  transition: width ${props => props.theme.transitions.base};
`;

const TimeStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
`;

const TimeStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${props => props.theme.fontSizes.xs};
`;

const TimeLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
`;

const TimeValue = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.fontWeights.semibold};
`;

export const FeedStatistics: React.FC<FeedStatisticsProps> = ({ items, readItemIds }) => {
  const totalItems = items.length;
  const readItems = items.filter(item => readItemIds.includes(item.id)).length;
  const unreadItems = totalItems - readItems;
  const readPercentage = totalItems > 0 ? Math.round((readItems / totalItems) * 100) : 0;

  // Calculate time stats
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - 7);
  const thisMonth = new Date(today);
  thisMonth.setMonth(thisMonth.getMonth() - 1);

  const itemsToday = items.filter(item => new Date(item.publishedAt) >= today).length;
  const itemsThisWeek = items.filter(item => new Date(item.publishedAt) >= thisWeek).length;
  const itemsThisMonth = items.filter(item => new Date(item.publishedAt) >= thisMonth).length;

  return (
    <Container>
      <SectionTitle>Feed Statistics</SectionTitle>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <FileText />
            Total Items
          </StatHeader>
          <StatValue>{totalItems}</StatValue>
        </StatCard>

        <StatCard>
          <StatHeader>
            <CheckCircle />
            Read
          </StatHeader>
          <StatValue>{readItems}</StatValue>
        </StatCard>

        <StatCard>
          <StatHeader>
            <Circle />
            Unread
          </StatHeader>
          <StatValue>{unreadItems}</StatValue>
        </StatCard>

        <StatCard>
          <StatHeader>
            <Calendar />
            This Week
          </StatHeader>
          <StatValue>{itemsThisWeek}</StatValue>
        </StatCard>
      </StatsGrid>

      <ProgressBar>
        <ProgressLabel>
          <span>Reading Progress</span>
          <span>{readPercentage}%</span>
        </ProgressLabel>
        <ProgressTrack>
          <ProgressFill $percentage={readPercentage} />
        </ProgressTrack>
      </ProgressBar>

      <TimeStats>
        <TimeStat>
          <TimeLabel>Today</TimeLabel>
          <TimeValue>{itemsToday} items</TimeValue>
        </TimeStat>
        <TimeStat>
          <TimeLabel>Last 7 days</TimeLabel>
          <TimeValue>{itemsThisWeek} items</TimeValue>
        </TimeStat>
        <TimeStat>
          <TimeLabel>Last 30 days</TimeLabel>
          <TimeValue>{itemsThisMonth} items</TimeValue>
        </TimeStat>
      </TimeStats>
    </Container>
  );
};
