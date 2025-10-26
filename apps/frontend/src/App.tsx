import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { Layout } from './components/Layout/Layout';
import { FeedView } from './pages/FeedView';
import { SourcesPage } from './pages/SourcesPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { IconRail } from './components/Navigation/IconRail';
import { SourcesPanel } from './components/Navigation/SourcesPanel';
import { FeadsPanel } from './components/Navigation/FeadsPanel';
import { CollectionsPanel } from './components/Navigation/CollectionsPanel';
import { FeedControlsPanel } from './components/FeedControls/FeedControlsPanel';
import { ToastContainer } from './components/Toast/ToastContainer';
import { useAuthStore } from './stores/authStore';
import { useFeedSourceStore } from './stores/feedSourceStore';
import { useCollectionStore } from './stores/collectionStore';
import { useFeedStore } from './stores/feedStore';

function AppContent() {
  const { initialize, isAuthenticated } = useAuthStore();
  const { fetchSources } = useFeedSourceStore();
  const { fetchCollections } = useCollectionStore();
  const { fetchItems } = useFeedStore();

  // Initialize auth and fetch data on mount
  useEffect(() => {
    const initApp = async () => {
      // Clear old persisted sources data (migration from POC)
      localStorage.removeItem('maifead-feed-sources');
      localStorage.removeItem('maifead-collections');

      await initialize();
    };
    initApp();
  }, [initialize]);

  // Fetch sources, collections, and feed items when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSources();
      fetchCollections();
      fetchItems({ limit: 100 });
    }
  }, [isAuthenticated, fetchSources, fetchCollections, fetchItems]);

  const feedItems = useFeedStore(state => state.items);

  return (
    <>
      <IconRail />
      <SourcesPanel />
      <FeadsPanel />
      <CollectionsPanel />
      <FeedControlsPanel items={feedItems} />
      <ToastContainer />
      <Routes>
        {/* Authentication page */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Main feed view */}
        <Route
          path="/"
          element={
            <Layout>
              <FeedView />
            </Layout>
          }
        />

        {/* Sources management page */}
        <Route
          path="/sources"
          element={
            <Layout>
              <SourcesPage />
            </Layout>
          }
        />

        {/* Profile settings page */}
        <Route
          path="/profile"
          element={
            <Layout>
              <ProfilePage />
            </Layout>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
