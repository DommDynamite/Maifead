import React, { useEffect, useRef, useState, useMemo } from 'react';
import styled from 'styled-components';
import { X, ExternalLink, BookmarkPlus, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { ContentItem } from '@maifead/types';
import { useUIStore } from '../../stores/uiStore';
import { useCollectionStore } from '../../stores/collectionStore';
import { useToastStore } from '../../stores/toastStore';
import { AddToCollectionModal } from '../Collections/AddToCollectionModal';

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
    overflow-y: hidden;
    bottom: 60px; /* Align with bottom nav bar edge (60px tall) */
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

  /* Wider on large screens for better video viewing */
  @media (min-width: 1280px) {
    max-width: 1100px;
  }

  @media (min-width: 1536px) {
    max-width: 1280px;
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    max-width: 100%;
    border-radius: 0;
    height: 100%;
    border-bottom: 1px solid ${props => props.theme.colors.border};
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
  min-height: 0;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
    padding-bottom: 0;
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
    max-height: 70vh;
    max-width: min(400px, 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    iframe {
      max-height: 70vh !important;
      max-width: 100% !important;
    }
  }

  /* YouTube embed styling */
  .youtube-embed {
    margin: ${props => props.theme.spacing[4]} 0 !important;
    border-radius: ${props => props.theme.borderRadius.md};
    overflow: hidden;
    max-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;

    iframe {
      margin: 0 !important;
      border-radius: ${props => props.theme.borderRadius.md};
      max-height: 70vh;
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 9;
    }

    /* Portrait videos (Shorts, TikTok) - constrain height */
    &[data-aspect="portrait"] iframe,
    &:has(iframe[src*="shorts"]) iframe {
      aspect-ratio: 9 / 16;
      max-width: min(400px, 100%);
      max-height: 70vh;
      height: 70vh;
      margin: 0 auto;
    }

    /* Description below YouTube video */
    + p {
      margin-top: ${props => props.theme.spacing[4]};
      padding: ${props => props.theme.spacing[4]};
      background: ${props => props.theme.colors.surfaceHover};
      border-radius: ${props => props.theme.borderRadius.md};
      border-left: 3px solid ${props => props.theme.colors.primary};
      color: ${props => props.theme.colors.text};
      font-size: ${props => props.theme.fontSizes.sm};
      line-height: ${props => props.theme.lineHeights.relaxed};
    }
  }

  /* Redgifs embed styling */
  .redgifs-embed {
    margin: ${props => props.theme.spacing[4]} 0 !important;
    border-radius: ${props => props.theme.borderRadius.md};
    overflow: hidden;
    background: #000;
    position: relative;
    max-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;

    iframe {
      margin: 0 !important;
      border-radius: ${props => props.theme.borderRadius.md};
      pointer-events: auto !important;
      max-height: 70vh;
      max-width: min(400px, 100%);
      width: 100%;
      height: auto;
      aspect-ratio: 9 / 16;
    }
  }

  /* Prevent links around Redgifs embeds from being clickable */
  a:has(.redgifs-embed) {
    pointer-events: none;
    cursor: default;
  }

  /* Reddit video styling */
  video {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: 70vh !important; /* Constrain height to fit in modal */
    border-radius: ${props => props.theme.borderRadius.md};
    margin: ${props => props.theme.spacing[4]} 0 !important;
    background: ${props => props.theme.colors.background};
    display: block;
    cursor: default !important; /* Override zoom cursor */
    object-fit: contain !important; /* Maintain aspect ratio */
  }

  /* Video containers */
  .video-container,
  .reddit-video,
  [class*="video"] {
    max-width: 100% !important;
    margin: ${props => props.theme.spacing[4]} 0 !important;
  }

  /* Prevent links around videos from being clickable */
  a:has(video) {
    pointer-events: none;
    cursor: default;
  }

  /* Image gallery grid for Reddit multi-image posts */
  p:has(> img + img),
  div:has(> img + img) {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
    gap: ${props => props.theme.spacing[3]} !important;
    margin: ${props => props.theme.spacing[4]} 0 !important;

    img {
      width: 100% !important;
      height: 200px !important;
      object-fit: cover !important;
      margin: 0 !important;
    }
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
  margin-top: ${props => props.theme.spacing[6]};

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
    flex: 1;
    min-width: 0;
    padding: ${props => props.theme.spacing[3]};
  }
`;

const ButtonText = styled.span`
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
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
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const GalleryNavButton = styled.button<{ $direction: 'left' | 'right' }>`
  position: fixed;
  top: 50%;
  ${props => props.$direction}: ${props => props.theme.spacing[6]};
  transform: translateY(-50%);
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
  z-index: 10;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  svg {
    width: 24px;
    height: 24px;
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 40px;
    height: 40px;
    ${props => props.$direction}: ${props => props.theme.spacing[3]};
  }
`;

const GalleryCounter = styled.div`
  position: fixed;
  top: ${props => props.theme.spacing[6]};
  left: 50%;
  transform: translateX(-50%);
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.full};
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  z-index: 10;
`;

export const ContentModal: React.FC<ContentModalProps> = ({ item, isOpen, onClose, onToggleRead }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  const { collections, addCollection, addItemToCollection, fetchCollections, getCollectionsForItem } = useCollectionStore();
  const { success } = useToastStore();

  // Check if item is saved in any collection
  const isSaved = item ? getCollectionsForItem(item.id).length > 0 : false;

  // Extract all images from content for gallery navigation
  const galleryImages = useMemo(() => {
    if (!item?.content.html) return [];

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = item.content.html;
    const imgElements = tempDiv.querySelectorAll('img');

    return Array.from(imgElements)
      .map(img => img.src)
      .filter(src => src && (src.includes('i.redd.it') || src.includes('preview.redd.it')));
  }, [item]);

  // Add click handler to images for lightbox and prevent link navigation
  useEffect(() => {
    if (!isOpen || !item || !contentRef.current) return;

    const handleContentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Handle image clicks for lightbox
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        const clickedIndex = galleryImages.indexOf(img.src);
        setGalleryIndex(clickedIndex >= 0 ? clickedIndex : 0);
        setLightboxImage(img.src);
        return;
      }

      // Prevent link navigation (but allow iframe interaction)
      if (target.tagName === 'A' || target.closest('a')) {
        e.preventDefault();
        return;
      }
    };

    contentRef.current.addEventListener('click', handleContentClick, true);

    return () => {
      contentRef.current?.removeEventListener('click', handleContentClick, true);
    };
  }, [isOpen, item, galleryImages]);

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null);
        } else {
          onClose();
        }
      }

      // Gallery navigation with arrow keys (only when lightbox is open)
      if (lightboxImage && galleryImages.length > 1) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigatePrevious();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigateNext();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, lightboxImage, galleryImages, galleryIndex]);

  // Gallery navigation functions
  const navigateNext = () => {
    if (galleryImages.length === 0) return;
    const nextIndex = (galleryIndex + 1) % galleryImages.length;
    setGalleryIndex(nextIndex);
    setLightboxImage(galleryImages[nextIndex]);
  };

  const navigatePrevious = () => {
    if (galleryImages.length === 0) return;
    const prevIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    setGalleryIndex(prevIndex);
    setLightboxImage(galleryImages[prevIndex]);
  };

  if (!item) return null;

  const timeAgo = formatDistanceToNow(item.publishedAt, { addSuffix: true });
  const primaryMedia = item.media?.[0];
  // Use item.isRead directly from the item prop, which is updated in real-time
  const isRead = item.isRead || false;

  // Check if content contains YouTube embed
  const hasYouTubeEmbed = item.content.html?.includes('youtube-embed') || item.content.html?.includes('youtube.com/embed');

  // Check if content contains Reddit video (v.redd.it or embedded video)
  const hasRedditVideo = item.content.html?.includes('v.redd.it') ||
                         (item.content.html?.includes('<video') && item.source.type === 'reddit');

  // Check if content contains Redgifs embed
  const hasRedgifsEmbed = item.content.html?.includes('redgifs-embed') || item.content.html?.includes('redgifs.com/ifr');

  // Determine if we should hide the thumbnail (has video embed)
  const hasVideoEmbed = hasYouTubeEmbed || hasRedditVideo || hasRedgifsEmbed;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleToggleRead = () => {
    onToggleRead(item.id);
    onClose();
  };

  const handleOpenOriginal = () => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  // Find or create the "Saved" collection
  const getSavedCollection = async () => {
    let savedCollection = collections.find(c => c.name === 'Saved');

    if (!savedCollection) {
      // Create the "Saved" collection if it doesn't exist
      savedCollection = await addCollection({
        name: 'Saved',
        color: '#fbbf24', // Yellow/amber color for saved items
        icon: 'Bookmark',
      });
    }

    return savedCollection;
  };

  // Handle save button click - add to "Saved" collection
  const handleSave = async () => {
    if (!item) return;

    try {
      const savedCollection = await getSavedCollection();
      await addItemToCollection(savedCollection.id, item.id);
      success('Added to Saved collection');
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  // Handle right-click on save button - open collection modal
  const handleSaveRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCollectionModalOpen(true);
  };

  // Fetch collections when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen, fetchCollections]);

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

              {/* Content includes all media (images, videos, embeds) */}
              <Content ref={contentRef} dangerouslySetInnerHTML={{ __html: item.content.html || item.content.text }} />

              <ModalFooter>
                <ActionButton onClick={handleToggleRead} aria-label={isRead ? 'Mark Unread' : 'Mark Read'}>
                  <CheckCircle />
                  <ButtonText>{isRead ? 'Mark Unread' : 'Mark Read'}</ButtonText>
                </ActionButton>
                <ActionButton
                  $primary={isSaved}
                  onClick={handleSave}
                  onContextMenu={handleSaveRightClick}
                  aria-label="Save"
                  title="Left-click to save, right-click to choose collection"
                >
                  <BookmarkPlus />
                  <ButtonText>{isSaved ? 'Saved' : 'Save'}</ButtonText>
                </ActionButton>
                <ActionButton onClick={handleOpenOriginal} aria-label="Open Original">
                  <ExternalLink />
                  <ButtonText>Open Original</ButtonText>
                </ActionButton>
              </ModalFooter>
            </ModalContent>
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

          {/* Gallery navigation - only show if multiple images */}
          {galleryImages.length > 1 && (
            <>
              <GalleryNavButton
                $direction="left"
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePrevious();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft />
              </GalleryNavButton>

              <GalleryCounter>
                {galleryIndex + 1} of {galleryImages.length}
              </GalleryCounter>

              <GalleryNavButton
                $direction="right"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateNext();
                }}
                aria-label="Next image"
              >
                <ChevronRight />
              </GalleryNavButton>
            </>
          )}

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

      {/* Add to Collection Modal */}
      {item && (
        <AddToCollectionModal
          isOpen={isCollectionModalOpen}
          onClose={() => setIsCollectionModalOpen(false)}
          item={item}
        />
      )}
    </AnimatePresence>
  );
};
