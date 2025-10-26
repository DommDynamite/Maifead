import React from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { useUIStore, type FeedLayout } from '../stores/uiStore';

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: ${props => props.theme.zIndex.modalBackdrop};
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  pointer-events: ${props => (props.$isOpen ? 'auto' : 'none')};
  transition: opacity ${props => props.theme.transitions.slow};
`;

const Panel = styled.aside<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  background: ${props => props.theme.colors.surface};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: ${props => props.theme.zIndex.modal};
  transform: translateX(${props => (props.$isOpen ? '0' : '100%')});
  transition: transform ${props => props.theme.transitions.slow};
  display: flex;
  flex-direction: column;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    max-width: 100%;
  }
`;

const PanelHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const PanelTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.semibold};
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.base};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[6]};
`;

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing[8]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  margin: 0 0 ${props => props.theme.spacing[4]} 0;
  color: ${props => props.theme.colors.text};
`;

const SectionDescription = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 ${props => props.theme.spacing[4]} 0;
  line-height: ${props => props.theme.lineHeights.normal};
`;

const Control = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: ${props => props.theme.borderRadius.base};
  background: ${props => props.theme.colors.border};
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.theme.colors.primary};
    cursor: pointer;
    transition: all ${props => props.theme.transitions.fast};

    &:hover {
      transform: scale(1.2);
    }
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.theme.colors.primary};
    cursor: pointer;
    border: none;
    transition: all ${props => props.theme.transitions.fast};

    &:hover {
      transform: scale(1.2);
    }
  }
`;

const SliderValue = styled.span`
  display: inline-block;
  margin-top: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
`;

const LayoutButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.base};
  background: ${props =>
    props.$active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => (props.$active ? 'white' : props.theme.colors.text)};
  border: 1px solid
    ${props => (props.$active ? props.theme.colors.primary : props.theme.colors.border)};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props =>
      props.$active ? props.theme.colors.primaryHover : props.theme.colors.surfaceHover};
  }
`;

export const SettingsPanel: React.FC = () => {
  const { isSettingsPanelOpen, maxCardWidth, feedLayout, setMaxCardWidth, setFeedLayout, closeSettingsPanel } = useUIStore();

  const handleOverlayClick = () => {
    closeSettingsPanel();
  };

  const handlePanelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <Overlay $isOpen={isSettingsPanelOpen} onClick={handleOverlayClick} />
      <Panel $isOpen={isSettingsPanelOpen} onClick={handlePanelClick}>
        <PanelHeader>
          <PanelTitle>Display Settings</PanelTitle>
          <CloseButton onClick={closeSettingsPanel} aria-label="Close settings">
            <X />
          </CloseButton>
        </PanelHeader>

        <PanelContent>
          <Section>
            <SectionTitle>Card Width</SectionTitle>
            <SectionDescription>
              Adjust the maximum width of feed cards. Useful for larger screens.
            </SectionDescription>
            <Control>
              <Label htmlFor="card-width">Max Width: {maxCardWidth}px</Label>
              <Slider
                id="card-width"
                type="range"
                min="500"
                max="1200"
                step="50"
                value={maxCardWidth}
                onChange={e => setMaxCardWidth(Number(e.target.value))}
              />
              <SliderValue>
                {maxCardWidth === 500 && 'Narrow'}
                {maxCardWidth > 500 && maxCardWidth < 900 && 'Medium'}
                {maxCardWidth >= 900 && 'Wide'}
              </SliderValue>
            </Control>
          </Section>

          <Section>
            <SectionTitle>Layout</SectionTitle>
            <SectionDescription>
              Choose how many columns to display. Multiple columns work best on wider screens.
            </SectionDescription>
            <Control>
              <Label>Columns</Label>
              <ButtonGroup>
                <LayoutButton
                  $active={feedLayout === 'single'}
                  onClick={() => setFeedLayout('single')}
                >
                  Single
                </LayoutButton>
                <LayoutButton
                  $active={feedLayout === 'double'}
                  onClick={() => setFeedLayout('double')}
                >
                  Double
                </LayoutButton>
                <LayoutButton
                  $active={feedLayout === 'triple'}
                  onClick={() => setFeedLayout('triple')}
                >
                  Triple
                </LayoutButton>
              </ButtonGroup>
            </Control>
          </Section>
        </PanelContent>
      </Panel>
    </>
  );
};
