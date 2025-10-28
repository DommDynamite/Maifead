import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FeedLayout = 'single' | 'double' | 'triple';
export type ActiveView = 'all' | 'sources' | 'fead' | 'saved' | 'collection';
export type ViewMode = 'detailed' | 'compact';
export type SortBy = 'newest' | 'oldest' | 'source-az' | 'source-recent' | 'shuffle';

interface UIStore {
  // Layout settings
  maxCardWidth: number;
  feedLayout: FeedLayout;

  // Panel states
  isSettingsPanelOpen: boolean;
  isSourceFilterModalOpen: boolean;
  isFeadsPanelOpen: boolean;
  isFeedControlsPanelOpen: boolean;
  isCollectionsPanelOpen: boolean;

  // Navigation state
  activeView: ActiveView;
  selectedSourceNames: string[]; // For filtering by specific sources
  activeFeadId: string | null; // Currently active Fead preset
  activeCollectionId: string | null; // Currently active Collection

  // Filter settings
  searchQuery: string;
  hideReadItems: boolean;
  readItemIds: string[];
  savedItemIds: string[];

  // Feed controls
  viewMode: ViewMode;
  sortBy: SortBy;

  // Actions
  setMaxCardWidth: (width: number) => void;
  setFeedLayout: (layout: FeedLayout) => void;
  toggleSettingsPanel: () => void;
  closeSettingsPanel: () => void;
  toggleSourceFilterModal: () => void;
  toggleFeadsPanel: () => void;
  toggleFeedControlsPanel: () => void;
  toggleCollectionsPanel: () => void;
  closeAllPanels: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortBy) => void;
  setActiveView: (view: ActiveView) => void;
  toggleSource: (sourceName: string) => void;
  clearSourceSelection: () => void;
  setActiveFead: (feadId: string | null) => void;
  setActiveCollection: (collectionId: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleHideReadItems: () => void;
  toggleReadState: (id: string) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  isItemRead: (id: string) => boolean;
  toggleSavedItem: (id: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Default values
      maxCardWidth: 700,
      feedLayout: 'single' as FeedLayout,
      isSettingsPanelOpen: false,
      isSourceFilterModalOpen: false,
      isFeadsPanelOpen: false,
      isFeedControlsPanelOpen: false,
      isCollectionsPanelOpen: false,
      activeView: 'all' as ActiveView,
      selectedSourceNames: [] as string[],
      activeFeadId: null as string | null,
      activeCollectionId: null as string | null,
      searchQuery: '',
      hideReadItems: false,
      readItemIds: [] as string[],
      savedItemIds: [] as string[],
      viewMode: 'detailed' as ViewMode,
      sortBy: 'newest' as SortBy,

      // Actions
      setMaxCardWidth: width => set({ maxCardWidth: width }),
      setFeedLayout: layout => set({ feedLayout: layout }),
      toggleSettingsPanel: () => set(state => ({ isSettingsPanelOpen: !state.isSettingsPanelOpen })),
      closeSettingsPanel: () => set({ isSettingsPanelOpen: false }),
      toggleSourceFilterModal: () =>
        set(state => ({
          isSourceFilterModalOpen: !state.isSourceFilterModalOpen,
        })),
      toggleFeadsPanel: () =>
        set(state => ({
          isFeadsPanelOpen: !state.isFeadsPanelOpen,
          isFeedControlsPanelOpen: false,
          isCollectionsPanelOpen: false,
        })),
      toggleFeedControlsPanel: () =>
        set(state => ({
          isFeedControlsPanelOpen: !state.isFeedControlsPanelOpen,
          isFeadsPanelOpen: false,
          isCollectionsPanelOpen: false,
        })),
      toggleCollectionsPanel: () =>
        set(state => ({
          isCollectionsPanelOpen: !state.isCollectionsPanelOpen,
          isFeadsPanelOpen: false,
          isFeedControlsPanelOpen: false,
        })),
      closeAllPanels: () =>
        set({
          isSettingsPanelOpen: false,
          isSourceFilterModalOpen: false,
          isFeadsPanelOpen: false,
          isFeedControlsPanelOpen: false,
          isCollectionsPanelOpen: false,
        }),
      setViewMode: mode => set({ viewMode: mode }),
      setSortBy: sort => set({ sortBy: sort }),
      setActiveView: view => set({ activeView: view }),
      toggleSource: sourceName =>
        set(state => ({
          selectedSourceNames: state.selectedSourceNames.includes(sourceName)
            ? state.selectedSourceNames.filter(name => name !== sourceName)
            : [...state.selectedSourceNames, sourceName],
          activeView: 'sources',
          activeFeadId: null, // Clear Fead when manually selecting sources
        })),
      clearSourceSelection: () =>
        set({
          selectedSourceNames: [],
          activeView: 'all',
        }),
      setActiveFead: feadId =>
        set({
          activeFeadId: feadId,
          activeView: feadId ? 'fead' : 'all',
          selectedSourceNames: [], // Clear manual source selection
          activeCollectionId: null, // Clear collection selection
        }),
      setActiveCollection: collectionId =>
        set({
          activeCollectionId: collectionId,
          activeView: collectionId ? 'collection' : 'all',
          selectedSourceNames: [], // Clear manual source selection
          activeFeadId: null, // Clear fead selection
        }),
      setSearchQuery: query => set({ searchQuery: query }),
      toggleHideReadItems: () => set(state => ({ hideReadItems: !state.hideReadItems })),
      toggleReadState: id =>
        set(state => ({
          readItemIds: state.readItemIds.includes(id)
            ? state.readItemIds.filter(itemId => itemId !== id)
            : [...state.readItemIds, id],
        })),
      markAsRead: id =>
        set(state => ({
          readItemIds: state.readItemIds.includes(id) ? state.readItemIds : [...state.readItemIds, id],
        })),
      markAsUnread: id =>
        set(state => ({
          readItemIds: state.readItemIds.filter(itemId => itemId !== id),
        })),
      isItemRead: (id: string): boolean => {
        // Access state through the store's getState after initialization
        return false; // Will be overridden by the actual implementation after store creation
      },
      toggleSavedItem: (id: string) =>
        set(state => ({
          savedItemIds: state.savedItemIds.includes(id)
            ? state.savedItemIds.filter(itemId => itemId !== id)
            : [...state.savedItemIds, id],
        })),
    }),
    {
      name: 'maifead-ui',
    }
  )
);
