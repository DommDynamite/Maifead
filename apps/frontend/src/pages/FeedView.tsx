import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import type { ContentItem } from '@maifead/types';
import { Card } from '../components/Card/Card';
import { ContentModal } from '../components/Modal/ContentModal';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { useUIStore, type FeedLayout } from '../stores/uiStore';
import { useFeadStore } from '../stores/feadStore';
import { useFeedSourceStore } from '../stores/feedSourceStore';
import { useCollectionStore } from '../stores/collectionStore';
import { useFeedStore } from '../stores/feedStore';
import { useAuthStore } from '../stores/authStore';
import { applySourceFiltersToItems } from '../utils/filterUtils';
import { useKeyboardShortcuts, type KeyboardShortcut } from '../hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '../components/KeyboardShortcuts/KeyboardShortcutsHelp';
import { CardSkeleton } from '../components/Skeleton/CardSkeleton';
import { EmptyState as EmptyStateComponent } from '../components/EmptyState/EmptyState';
import { SourceFilterModal } from '../components/SourceFilter/SourceFilterModal';

const FeedContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const FeedContent = styled.main<{ $maxWidth: number }>`
  max-width: ${props => props.$maxWidth}px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[4]};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[4]};
  }
`;

const CardList = styled.div<{ $layout: FeedLayout }>`
  display: grid;
  gap: ${props => props.theme.spacing[4]};

  ${props => {
    if (props.$layout === 'single') {
      return `
        grid-template-columns: 1fr;
      `;
    }
    if (props.$layout === 'double') {
      return `
        grid-template-columns: repeat(2, 1fr);

        @media (max-width: ${props.theme.breakpoints.md}) {
          grid-template-columns: 1fr;
        }
      `;
    }
    if (props.$layout === 'triple') {
      return `
        grid-template-columns: repeat(3, 1fr);

        @media (max-width: ${props.theme.breakpoints.lg}) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: ${props.theme.breakpoints.md}) {
          grid-template-columns: 1fr;
        }
      `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[4]};
  color: ${props => props.theme.colors.textSecondary};
`;

export const FeedView: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Simulate initial loading (in real app, this would be actual data fetching)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const {
    maxCardWidth,
    feedLayout,
    searchQuery,
    hideReadItems,
    readItemIds,
    activeView,
    selectedSourceNames,
    activeFeadId,
    activeCollectionId,
    sortBy,
    viewMode,
    setFeedLayout,
    setViewMode,
    toggleReadState,
    markAsRead,
    toggleSourceFilterModal,
    toggleFeadsPanel,
    toggleCollectionsPanel,
    toggleFeedControlsPanel,
    isFeedControlsPanelOpen,
    isSourceFilterModalOpen,
    isFeadsPanelOpen,
    isCollectionsPanelOpen,
  } = useUIStore();
  const { sources } = useFeedSourceStore();
  const { collections } = useCollectionStore();
  const { items: feedItems, isLoading: isFetchingItems, markItemRead, markItemSaved } = useFeedStore();
  const { isAuthenticated } = useAuthStore();

  // Convert feed items to ContentItem format for UI
  const contentItems: ContentItem[] = useMemo(() => {
    return feedItems.map(item => {
      const source = sources.find(s => s.id === item.sourceId);

      // Extract first high-res image from content for Reddit galleries
      let mediaUrl = item.imageUrl;
      const contentHtml = item.content?.html || item.content?.text || '';

      // Check if this is a Reddit gallery post (contains reddit-gallery div with img tags)
      if (contentHtml.includes('reddit-gallery')) {
        // Extract first image URL from content - match any img src attribute
        // This handles both preview.redd.it and i.redd.it URLs
        const imgMatch = contentHtml.match(/<img[^>]*src=["']([^"']+(?:preview\.redd\.it|i\.redd\.it)[^"']+)["']/);
        if (imgMatch) {
          console.log('[GALLERY] Extracted high-res URL:', imgMatch[1], 'from item:', item.title);
          mediaUrl = imgMatch[1];
          console.log('[GALLERY] Final mediaUrl:', mediaUrl);
        } else {
          console.warn('[GALLERY] Failed to extract URL from reddit-gallery content for:', item.title);
        }
      }

      return {
        ...item,
        sourceId: item.sourceId, // Preserve sourceId for filtering
        source: {
          type: source?.type || item.source.type,
          name: source?.name || item.source.name || 'Unknown Source',
          url: source?.url || item.source.url || '',
          icon: source?.icon || item.source.icon || '',
        },
        media: mediaUrl ? [{
          type: 'image' as const,
          url: mediaUrl,
          alt: item.title,
        }] : item.media,
      } as ContentItem & { sourceId: string };
    });
  }, [feedItems, sources]);

  // Filter and search items
  const filteredItems = useMemo(() => {
    let items = contentItems;

    // STEP 1: Apply per-source filters (whitelist/blacklist keywords)
    items = applySourceFiltersToItems(items, sources);

    // STEP 2: Apply view-based filtering
    if (activeView === 'sources' && selectedSourceNames.length > 0) {
      items = items.filter(item => selectedSourceNames.includes(item.source.name));
    } else if (activeView === 'fead' && activeFeadId) {
      const { feads } = useFeadStore.getState();
      const activeFead = feads.find(f => f.id === activeFeadId);
      if (activeFead) {
        items = items.filter(item => activeFead.sourceIds.includes((item as any).sourceId));
      }
    } else if (activeView === 'collection' && activeCollectionId) {
      const activeCollection = collections.find(c => c.id === activeCollectionId);
      if (activeCollection) {
        items = items.filter(item => activeCollection.itemIds.includes(item.id));
      }
    } else if (activeView === 'saved') {
      items = items.filter(item => item.isSaved === true);
    } else if (activeView === 'all') {
      // For 'all' view, filter out items from sources that are suppressed from main feed
      items = items.filter(item => {
        const source = sources.find(s => s.id === (item as any).sourceId);
        return !source?.suppressFromMainFeed;
      });
    }

    // STEP 3: Apply global search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.content.excerpt?.toLowerCase().includes(query) ||
          item.source.name.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          item.author?.name.toLowerCase().includes(query)
      );
    }

    // STEP 4: Apply read state filter
    if (hideReadItems) {
      items = items.filter(item => !item.isRead);
    }

    // STEP 5: Apply sorting
    const sortedItems = [...items];
    if (sortBy === 'newest') {
      sortedItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortBy === 'oldest') {
      sortedItems.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    } else if (sortBy === 'source-az') {
      sortedItems.sort((a, b) => a.source.name.localeCompare(b.source.name));
    } else if (sortBy === 'source-recent') {
      // Group by source and sort by each source's most recent item
      const sourceLatest = new Map<string, number>();
      items.forEach(item => {
        const current = sourceLatest.get(item.source.name) || 0;
        const itemTime = new Date(item.publishedAt).getTime();
        if (itemTime > current) {
          sourceLatest.set(item.source.name, itemTime);
        }
      });
      sortedItems.sort((a, b) => {
        const aLatest = sourceLatest.get(a.source.name) || 0;
        const bLatest = sourceLatest.get(b.source.name) || 0;
        return bLatest - aLatest;
      });
    } else if (sortBy === 'shuffle') {
      // Interleave items from different sources evenly
      // Group items by source
      const itemsBySource = new Map<string, ContentItem[]>();
      items.forEach(item => {
        const sourceName = item.source.name;
        if (!itemsBySource.has(sourceName)) {
          itemsBySource.set(sourceName, []);
        }
        itemsBySource.get(sourceName)!.push(item);
      });

      // Sort each source's items by date (newest first)
      itemsBySource.forEach(sourceItems => {
        sourceItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      });

      // Interleave items round-robin style
      sortedItems.length = 0; // Clear array
      const sourceArrays = Array.from(itemsBySource.values());
      let index = 0;
      let hasItems = true;

      while (hasItems) {
        hasItems = false;
        for (const sourceItems of sourceArrays) {
          if (index < sourceItems.length) {
            sortedItems.push(sourceItems[index]);
            hasItems = true;
          }
        }
        index++;
      }
    }

    return sortedItems;
  }, [
    contentItems,
    searchQuery,
    hideReadItems,
    readItemIds,
    activeView,
    selectedSourceNames,
    activeFeadId,
    activeCollectionId,
    sources,
    collections,
    sortBy,
  ]);

  const handleCardClick = async (item: ContentItem) => {
    // Mark as read when opening
    await markItemRead(item.id, true);
    // Set selected item after marking as read so modal gets updated state
    setSelectedItem({ ...item, isRead: true });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleToggleRead = async (id: string) => {
    const item = feedItems.find(i => i.id === id);
    if (item) {
      await markItemRead(id, !item.read);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (filteredItems.length === 0) return;

    // Mark all visible items as read
    const promises = filteredItems
      .filter(item => !item.isRead) // Only mark unread items
      .map(item => markItemRead(item.id, true));

    await Promise.all(promises);
  };

  // Calculate the container width based on layout
  const getContainerWidth = () => {
    if (feedLayout === 'single') return maxCardWidth;
    if (feedLayout === 'double') return maxCardWidth * 2 + 16; // 2 cards + gap
    if (feedLayout === 'triple') return maxCardWidth * 3 + 32; // 3 cards + 2 gaps
    return maxCardWidth;
  };

  // Keyboard shortcuts configuration
  const shortcuts: KeyboardShortcut[] = useMemo(
    () => [
      // Navigation
      {
        key: 'j',
        description: 'Next item',
        action: () => {
          if (!isModalOpen && filteredItems.length > 0) {
            const nextIndex = Math.min(selectedIndex + 1, filteredItems.length - 1);
            setSelectedIndex(nextIndex);
            handleCardClick(filteredItems[nextIndex]);
          }
        },
      },
      {
        key: 'k',
        description: 'Previous item',
        action: () => {
          if (!isModalOpen && filteredItems.length > 0) {
            const prevIndex = Math.max(selectedIndex - 1, 0);
            setSelectedIndex(prevIndex);
            handleCardClick(filteredItems[prevIndex]);
          }
        },
      },
      {
        key: 'ArrowDown',
        description: 'Next item',
        action: () => {
          if (!isModalOpen && filteredItems.length > 0) {
            const nextIndex = Math.min(selectedIndex + 1, filteredItems.length - 1);
            setSelectedIndex(nextIndex);
            handleCardClick(filteredItems[nextIndex]);
          }
        },
      },
      {
        key: 'ArrowUp',
        description: 'Previous item',
        action: () => {
          if (!isModalOpen && filteredItems.length > 0) {
            const prevIndex = Math.max(selectedIndex - 1, 0);
            setSelectedIndex(prevIndex);
            handleCardClick(filteredItems[prevIndex]);
          }
        },
      },
      // Panels
      {
        key: 's',
        description: 'Toggle source filter',
        action: toggleSourceFilterModal,
      },
      {
        key: 'f',
        description: 'Toggle feads panel',
        action: toggleFeadsPanel,
      },
      {
        key: 'c',
        description: 'Toggle controls panel',
        action: toggleFeedControlsPanel,
      },
      {
        key: 'Escape',
        description: 'Close all panels',
        action: () => {
          if (isSourceFilterModalOpen) toggleSourceFilterModal();
          if (isFeadsPanelOpen) toggleFeadsPanel();
          if (isCollectionsPanelOpen) toggleCollectionsPanel();
          if (isFeedControlsPanelOpen) toggleFeedControlsPanel();
          if (isHelpOpen) setIsHelpOpen(false);
        },
      },
      // Actions
      {
        key: 'm',
        description: 'Mark item as read/unread',
        action: async () => {
          if (filteredItems.length > 0) {
            const item = feedItems.find(i => i.id === filteredItems[selectedIndex].id);
            if (item) {
              await markItemRead(item.id, !item.read);
            }
          }
        },
      },
      {
        key: '/',
        description: 'Focus search',
        action: () => {
          searchInputRef.current?.focus();
        },
      },
      {
        key: 'r',
        description: 'Refresh feed',
        action: () => {
          console.log('Refresh feed');
          // TODO: Implement refresh
        },
      },
      {
        key: 'Enter',
        description: 'Open selected item',
        action: () => {
          if (filteredItems.length > 0 && !isModalOpen) {
            handleCardClick(filteredItems[selectedIndex]);
          }
        },
      },
      // View Controls
      {
        key: 'v',
        description: 'Toggle view mode',
        action: () => {
          setViewMode(viewMode === 'detailed' ? 'compact' : 'detailed');
        },
      },
      {
        key: '1',
        description: 'Single column layout',
        action: () => setFeedLayout('single'),
      },
      {
        key: '2',
        description: 'Double column layout',
        action: () => setFeedLayout('double'),
      },
      {
        key: '3',
        description: 'Triple column layout',
        action: () => setFeedLayout('triple'),
      },
      // Help
      {
        key: '?',
        description: 'Show keyboard shortcuts',
        action: () => setIsHelpOpen(true),
      },
    ],
    [
      filteredItems,
      selectedIndex,
      isModalOpen,
      viewMode,
      isSourceFilterModalOpen,
      isFeadsPanelOpen,
      isCollectionsPanelOpen,
      isFeedControlsPanelOpen,
      isHelpOpen,
    ]
  );

  // Enable keyboard shortcuts
  useKeyboardShortcuts({ shortcuts, enabled: !isModalOpen });

  return (
    <FeedContainer>
      <FeedContent $maxWidth={getContainerWidth()}>
        <SearchBar
          ref={searchInputRef}
          resultCount={isLoading ? 0 : filteredItems.length}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        {isLoading ? (
          <CardList $layout={feedLayout}>
            {Array.from({ length: feedLayout === 'triple' ? 6 : feedLayout === 'double' ? 4 : 3 }).map((_, i) => (
              <CardSkeleton key={i} viewMode={viewMode} />
            ))}
          </CardList>
        ) : filteredItems.length === 0 ? (
          <EmptyStateComponent
            type={searchQuery ? 'no-results' : contentItems.length === 0 ? 'no-items' : 'no-results'}
          />
        ) : (
          <CardList $layout={feedLayout}>
            {filteredItems.map(item => (
              <Card
                key={item.id}
                item={item}
                onClick={() => handleCardClick(item)}
                viewMode={viewMode}
              />
            ))}
          </CardList>
        )}
      </FeedContent>
      <ContentModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onToggleRead={handleToggleRead}
      />
      <SourceFilterModal />
      <KeyboardShortcutsHelp isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} shortcuts={shortcuts} />
    </FeedContainer>
  );
};
