import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FeedLayout = 'single' | 'double' | 'triple';
export type ActiveView = 'all' | 'sources' | 'fead' | 'saved' | 'collection';
export type ViewMode = 'detailed' | 'compact';
export type SortBy = 'newest' | 'oldest' | 'source-az' | 'source-recent';

interface UIStore {
  // Layout settings
  maxCardWidth: number;
  feedLayout: FeedLayout;

  // Panel states
  isSettingsPanelOpen: boolean;
  isSourcesPanelOpen: boolean;
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
  toggleSourcesPanel: () => void;
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
    set => ({
      // Default values
      maxCardWidth: 700,
      feedLayout: 'single',
      isSettingsPanelOpen: false,
      isSourcesPanelOpen: false,
      isFeadsPanelOpen: false,
      isFeedControlsPanelOpen: false,
      isCollectionsPanelOpen: false,
      activeView: 'all',
      selectedSourceNames: [],
      activeFeadId: null,
      activeCollectionId: null,
      searchQuery: '',
      hideReadItems: false,
      readItemIds: [],
      savedItemIds: [],
      viewMode: 'detailed',
      sortBy: 'newest',

      // Actions
      setMaxCardWidth: width => set({ maxCardWidth: width }),
      setFeedLayout: layout => set({ feedLayout: layout }),
      toggleSettingsPanel: () => set(state => ({ isSettingsPanelOpen: !state.isSettingsPanelOpen })),
      closeSettingsPanel: () => set({ isSettingsPanelOpen: false }),
      toggleSourcesPanel: () =>
        set(state => ({
          isSourcesPanelOpen: !state.isSourcesPanelOpen,
          isFeadsPanelOpen: false, // Close other panels
          isFeedControlsPanelOpen: false,
          isCollectionsPanelOpen: false,
        })),
      toggleFeadsPanel: () =>
        set(state => ({
          isFeadsPanelOpen: !state.isFeadsPanelOpen,
          isSourcesPanelOpen: false, // Close other panels
          isFeedControlsPanelOpen: false,
          isCollectionsPanelOpen: false,
        })),
      toggleFeedControlsPanel: () =>
        set(state => ({
          isFeedControlsPanelOpen: !state.isFeedControlsPanelOpen,
          isSourcesPanelOpen: false, // Close other panels
          isFeadsPanelOpen: false,
          isCollectionsPanelOpen: false,
        })),
      toggleCollectionsPanel: () =>
        set(state => ({
          isCollectionsPanelOpen: !state.isCollectionsPanelOpen,
          isSourcesPanelOpen: false, // Close other panels
          isFeadsPanelOpen: false,
          isFeedControlsPanelOpen: false,
        })),
      closeAllPanels: () =>
        set({
          isSettingsPanelOpen: false,
          isSourcesPanelOpen: false,
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
      isItemRead: id => {
        const state = useUIStore.getState();
        return state.readItemIds.includes(id);
      },
      toggleSavedItem: id =>
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
