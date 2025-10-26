import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X, ExternalLink, BookmarkPlus, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { ContentItem } from '@maifead/types';
import { useUIStore } from '../../stores/uiStore';

interface ContentModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleRead: (id: string) => void;
}

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: ${props => props.theme.zIndex.modalBackdrop};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[4]};
  overflow-y: auto;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 0;
    align-items: flex-start;
  }
`;

const ModalContainer = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
`;

const ModalHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const SourceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex: 1;
  min-width: 0;
`;

const SourceIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: ${props => props.theme.borderRadius.sm};
  flex-shrink: 0;
`;

const SourceDetails = styled.div`
  min-width: 0;
`;

const SourceName = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Timestamp = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
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
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[6]};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing[4]} 0;
  line-height: ${props => props.theme.lineHeights.tight};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSizes['2xl']};
  }
`;

const Author = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const MediaContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
`;

const MediaImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  cursor: zoom-in;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    opacity: 0.9;
    transform: scale(1.01);
  }
`;

const VideoEmbed = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  border-radius: ${props => props.theme.borderRadius.md};

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

const Content = styled.div`
  font-size: ${props => props.theme.fontSizes.base};
  line-height: ${props => props.theme.lineHeights.relaxed};
  color: ${props => props.theme.colors.text};
  overflow-x: hidden;
  word-wrap: break-word;

  /* Force single column layout - prevent any multi-column layouts */
  column-count: 1 !important;
  columns: auto !important;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: ${props => props.theme.colors.text};
    font-weight: ${props => props.theme.fontWeights.bold};
    line-height: ${props => props.theme.lineHeights.tight};
    margin: ${props => props.theme.spacing[6]} 0 ${props => props.theme.spacing[3]} 0;

    &:first-child {
      margin-top: 0;
    }
  }

  h2 {
    font-size: ${props => props.theme.fontSizes['2xl']};
    border-bottom: 1px solid ${props => props.theme.colors.border};
    padding-bottom: ${props => props.theme.spacing[2]};
  }

  h3 {
    font-size: ${props => props.theme.fontSizes.xl};
  }

  p {
    margin: 0 0 ${props => props.theme.spacing[4]} 0;
    float: none !important;
    clear: both !important;
    width: auto !important;

    /* Reduce margin for paragraphs containing only images */
    &:has(> img:only-child),
    &:has(> img:first-child:last-child) {
      margin: ${props => props.theme.spacing[2]} 0;
    }

    /* Hide empty paragraphs */
    &:empty {
      display: none;
      margin: 0;
    }
  }

  /* Remove excessive spacing from br tags near images */
  br + img,
  img + br {
    margin-top: ${props => props.theme.spacing[1]};
  }

  /* Collapse multiple br tags */
  br + br {
    display: none;
  }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: underline;

    &:hover {
      color: ${props => props.theme.colors.primaryHover};
    }
  }

  ul,
  ol {
    margin: ${props => props.theme.spacing[4]} 0;
    padding-left: ${props => props.theme.spacing[6]};
  }

  li {
    margin: ${props => props.theme.spacing[2]} 0;
  }

  blockquote {
    border-left: 3px solid ${props => props.theme.colors.primary};
    padding-left: ${props => props.theme.spacing[4]};
    margin: ${props => props.theme.spacing[4]} 0;
    color: ${props => props.theme.colors.textSecondary};
    font-style: italic;
  }

  /* Twitter/X embed styling */
  .twitter-tweet {
    margin: ${props => props.theme.spacing[4]} auto !important;
  }

  /* Instagram embed styling */
  .instagram-media {
    margin: ${props => props.theme.spacing[4]} auto !important;
    max-width: 540px !important;
  }

  /* Generic iframe styling */
  iframe {
    max-width: 100%;
    margin: ${props => props.theme.spacing[4]} 0;
  }

  /* TikTok embed styling */
  .tiktok-embed {
    margin: ${props => props.theme.spacing[4]} auto !important;
  }

  img {
    max-width: 100% !important;
    width: auto !important;
    height: auto !important;
    border-radius: ${props => props.theme.borderRadius.md};
    margin: ${props => props.theme.spacing[2]} 0 !important;
    display: block !important;
    vertical-align: top !important;
    align-self: flex-start !important;
    cursor: zoom-in;
    transition: all ${props => props.theme.transitions.fast};

    &:hover {
      opacity: 0.9;
      transform: scale(1.01);
    }
  }

  /* Handle figure elements and image containers */
  figure {
    max-width: 100% !important;
    width: auto !important;
    margin: ${props => props.theme.spacing[2]} 0 !important;
    overflow: hidden;

    img {
      margin: 0;
    }
  }

  figcaption {
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.textSecondary};
    margin-top: ${props => props.theme.spacing[2]};
    text-align: center;
    font-style: italic;
  }

  /* Handle div containers around images */
  div {
    max-width: 100% !important;
    float: none !important;
    clear: both !important;

    /* Fix alignment for divs containing images */
    &:has(> img) {
      display: block !important;
      line-height: 0;
      width: 100% !important;
    }
  }

  /* Handle picture elements */
  picture {
    max-width: 100% !important;
    display: block;
  }

  /* Fix aspect ratio padding tricks that create blank space */
  .fancy-box,
  .van-image-figure,
  .image-full-width-wrapper,
  .image-widthsetting,
  .vanilla-image-block,
  [class*="image-"],
  [class*="-image"],
  [class*="figure"] {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    height: auto !important;
    position: static !important;
    max-width: 100% !important;
  }

  /* Ensure images inside these containers are visible and not positioned absolutely */
  .fancy-box img,
  .van-image-figure img,
  .image-full-width-wrapper img,
  .image-widthsetting img,
  .vanilla-image-block img,
  [class*="image-"] img,
  [class*="-image"] img {
    position: static !important;
    top: auto !important;
    left: auto !important;
    transform: none !important;
  }

  code {
    font-family: ${props => props.theme.fonts.mono};
    background: ${props => props.theme.colors.surfaceHover};
    padding: 2px 6px;
    border-radius: ${props => props.theme.borderRadius.sm};
    font-size: 0.9em;
  }

  pre {
    background: ${props => props.theme.colors.surfaceHover};
    padding: ${props => props.theme.spacing[4]};
    border-radius: ${props => props.theme.borderRadius.md};
    overflow-x: auto;
    margin: ${props => props.theme.spacing[4]} 0;

    code {
      background: none;
      padding: 0;
    }
  }
`;

const ModalFooter = styled.footer`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  border-top: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  flex: 1;
  justify-content: center;

  ${props =>
    props.$primary
      ? `
    background: ${props.theme.colors.primary};
    color: white;
    border: 1px solid ${props.theme.colors.primary};

    &:hover {
      background: ${props.theme.colors.primaryHover};
      border-color: ${props.theme.colors.primaryHover};
    }
  `
      : `
    background: transparent;
    color: ${props.theme.colors.text};
    border: 1px solid ${props.theme.colors.border};

    &:hover {
      background: ${props.theme.colors.surfaceHover};
      border-color: ${props.theme.colors.borderHover};
    }
  `}

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex: 1 1 auto;
    min-width: 140px;
  }
`;

const LightboxBackdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: ${props => props.theme.zIndex.modal + 1};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  cursor: zoom-out;
`;

const LightboxImage = styled(motion.img)`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows['2xl']};
`;

const LightboxCloseButton = styled.button`
  position: fixed;
  top: ${props => props.theme.spacing[6]};
  right: ${props => props.theme.spacing[6]};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const ContentModal: React.FC<ContentModalProps> = ({ item, isOpen, onClose, onToggleRead }) => {
  const { readItemIds } = useUIStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = React.useState<string | null>(null);

  // Add click handler to images for lightbox
  useEffect(() => {
    if (!isOpen || !item || !contentRef.current) return;

    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        setLightboxImage(img.src);
      }
    };

    contentRef.current.addEventListener('click', handleImageClick);

    return () => {
      contentRef.current?.removeEventListener('click', handleImageClick);
    };
  }, [isOpen, item]);

  // Load and process embedded content
  useEffect(() => {
    if (!isOpen || !item || !contentRef.current) return;

    const content = item.content.html || item.content.text || '';

    // Load Twitter/X embed script
    if (content.includes('twitter.com') || content.includes('x.com') || content.includes('twitter-tweet')) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';

      if (!document.querySelector('script[src*="platform.twitter.com"]')) {
        document.body.appendChild(script);
      } else {
        // If script already loaded, re-process tweets
        if (window.twttr?.widgets) {
          window.twttr.widgets.load(contentRef.current);
        }
      }
    }

    // Load Instagram embed script
    if (content.includes('instagram.com') || content.includes('instagram-media')) {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;

      if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
        document.body.appendChild(script);
      } else {
        // If script already loaded, re-process embeds
        if (window.instgrm?.Embeds) {
          window.instgrm.Embeds.process();
        }
      }
    }

    // Load TikTok embed script
    if (content.includes('tiktok.com') || content.includes('tiktok-embed')) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;

      if (!document.querySelector('script[src*="tiktok.com/embed.js"]')) {
        document.body.appendChild(script);
      }
    }
  }, [isOpen, item]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, lightboxImage]);

  if (!item) return null;

  const timeAgo = formatDistanceToNow(item.publishedAt, { addSuffix: true });
  const primaryMedia = item.media?.[0];
  const isRead = readItemIds.includes(item.id);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleToggleRead = () => {
    onToggleRead(item.id);
  };

  const handleOpenOriginal = () => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Backdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleBackdropClick}
        >
          <ModalContainer
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ModalHeader>
              <SourceInfo>
                {item.source.icon && <SourceIcon src={item.source.icon} alt="" />}
                <SourceDetails>
                  <SourceName>{item.source.name}</SourceName>
                  <Timestamp>{timeAgo}</Timestamp>
                </SourceDetails>
              </SourceInfo>
              <CloseButton onClick={onClose} aria-label="Close modal">
                <X />
              </CloseButton>
            </ModalHeader>

            <ModalContent>
              <Title>{item.title}</Title>
              {item.author && <Author>By {item.author.name}</Author>}

              {primaryMedia && primaryMedia.type === 'image' && (
                <MediaContainer>
                  <MediaImage
                    src={primaryMedia.url}
                    alt={primaryMedia.alt || item.title}
                    onClick={() => setLightboxImage(primaryMedia.url)}
                  />
                </MediaContainer>
              )}

              {primaryMedia && primaryMedia.type === 'video' && primaryMedia.embedUrl && (
                <MediaContainer>
                  <VideoEmbed>
                    <iframe
                      src={primaryMedia.embedUrl}
                      title={item.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </VideoEmbed>
                </MediaContainer>
              )}

              <Content ref={contentRef} dangerouslySetInnerHTML={{ __html: item.content.html || item.content.text }} />
            </ModalContent>

            <ModalFooter>
              <ActionButton onClick={handleToggleRead}>
                <CheckCircle />
                {isRead ? 'Mark Unread' : 'Mark Read'}
              </ActionButton>
              <ActionButton>
                <BookmarkPlus />
                Save
              </ActionButton>
              <ActionButton $primary onClick={handleOpenOriginal}>
                <ExternalLink />
                Open Original
              </ActionButton>
            </ModalFooter>
          </ModalContainer>
        </Backdrop>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <LightboxBackdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightboxImage(null)}
        >
          <LightboxCloseButton onClick={() => setLightboxImage(null)} aria-label="Close lightbox">
            <X />
          </LightboxCloseButton>
          <LightboxImage
            src={lightboxImage}
            alt="Full size"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          />
        </LightboxBackdrop>
      )}
    </AnimatePresence>
  );
};
