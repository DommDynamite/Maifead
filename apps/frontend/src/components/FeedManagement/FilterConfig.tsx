import React, { useState } from 'react';
import styled from 'styled-components';
import { Plus } from 'lucide-react';
import { KeywordChip } from './KeywordChip';

interface FilterConfigProps {
  whitelistKeywords: string[];
  blacklistKeywords: string[];
  onWhitelistChange: (keywords: string[]) => void;
  onBlacklistChange: (keywords: string[]) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
`;

const SectionDescription = styled.p`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[2]};
  min-height: 36px;
  padding: ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  background: ${props => props.theme.colors.background};
`;

const EmptyState = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  font-style: italic;
`;

const AddKeywordForm = styled.form`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
`;

const Input = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.sm};
  font-family: ${props => props.theme.fonts.sans};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}22;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const InfoText = styled.p`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;

  strong {
    color: ${props => props.theme.colors.text};
    font-weight: ${props => props.theme.fontWeights.semibold};
  }
`;

export const FilterConfig: React.FC<FilterConfigProps> = ({
  whitelistKeywords,
  blacklistKeywords,
  onWhitelistChange,
  onBlacklistChange,
}) => {
  const [whitelistInput, setWhitelistInput] = useState('');
  const [blacklistInput, setBlacklistInput] = useState('');

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = whitelistInput.trim().toLowerCase();
    if (keyword && keyword.length >= 2 && !whitelistKeywords.includes(keyword)) {
      onWhitelistChange([...whitelistKeywords, keyword]);
      setWhitelistInput('');
    }
  };

  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = blacklistInput.trim().toLowerCase();
    if (keyword && keyword.length >= 2 && !blacklistKeywords.includes(keyword)) {
      onBlacklistChange([...blacklistKeywords, keyword]);
      setBlacklistInput('');
    }
  };

  const handleRemoveWhitelist = (keyword: string) => {
    onWhitelistChange(whitelistKeywords.filter(k => k !== keyword));
  };

  const handleRemoveBlacklist = (keyword: string) => {
    onBlacklistChange(blacklistKeywords.filter(k => k !== keyword));
  };

  return (
    <Container>
      {/* Whitelist Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>Whitelist Keywords (Include Only)</SectionTitle>
          <SectionDescription>Only show content matching these keywords</SectionDescription>
        </SectionHeader>

        <ChipsContainer>
          {whitelistKeywords.length === 0 ? (
            <EmptyState>No whitelist keywords - all content will pass this filter</EmptyState>
          ) : (
            whitelistKeywords.map(keyword => (
              <KeywordChip
                key={keyword}
                keyword={keyword}
                variant="whitelist"
                onRemove={handleRemoveWhitelist}
              />
            ))
          )}
        </ChipsContainer>

        <AddKeywordForm onSubmit={handleAddWhitelist}>
          <Input
            type="text"
            value={whitelistInput}
            onChange={e => setWhitelistInput(e.target.value)}
            placeholder="Enter keyword (min 2 characters)"
            minLength={2}
          />
          <AddButton type="submit" disabled={whitelistInput.trim().length < 2}>
            <Plus />
            Add
          </AddButton>
        </AddKeywordForm>
      </Section>

      {/* Blacklist Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>Blacklist Keywords (Exclude)</SectionTitle>
          <SectionDescription>Hide content matching these keywords</SectionDescription>
        </SectionHeader>

        <ChipsContainer>
          {blacklistKeywords.length === 0 ? (
            <EmptyState>No blacklist keywords - no content will be excluded</EmptyState>
          ) : (
            blacklistKeywords.map(keyword => (
              <KeywordChip
                key={keyword}
                keyword={keyword}
                variant="blacklist"
                onRemove={handleRemoveBlacklist}
              />
            ))
          )}
        </ChipsContainer>

        <AddKeywordForm onSubmit={handleAddBlacklist}>
          <Input
            type="text"
            value={blacklistInput}
            onChange={e => setBlacklistInput(e.target.value)}
            placeholder="Enter keyword (min 2 characters)"
            minLength={2}
          />
          <AddButton type="submit" disabled={blacklistInput.trim().length < 2}>
            <Plus />
            Add
          </AddButton>
        </AddKeywordForm>
      </Section>

      {/* Info */}
      <InfoText>
        Keywords are case-insensitive and match across: <strong>Title</strong>, <strong>Content</strong>,{' '}
        <strong>Tags</strong>, and <strong>Author name</strong>
      </InfoText>
    </Container>
  );
};
