import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { Layout } from './components/Layout/Layout';
import { FeedView } from './pages/FeedView';
import { SourcesPage } from './pages/SourcesPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { IconRail } from './components/Navigation/IconRail';
import { BottomNav } from './components/Navigation/BottomNav';
import { FeadsPanel } from './components/Navigation/FeadsPanel';
import { FeadModal } from './components/Navigation/FeadModal';
import { CollectionsPanel } from './components/Navigation/CollectionsPanel';
import { FeedControlsPanel } from './components/FeedControls/FeedControlsPanel';
import { ToastContainer } from './components/Toast/ToastContainer';
import { InstallPrompt } from './components/PWA/InstallPrompt';
import { useAuthStore } from './stores/authStore';
import { useFeedSourceStore } from './stores/feedSourceStore';
import { useCollectionStore } from './stores/collectionStore';
import { useFeedStore } from './stores/feedStore';
import { useFeadStore } from './stores/feadStore';
import { useRegisterSW } from 'virtual:pwa-register/react';
import type { Fead } from '@maifead/types';

function AppContent() {
  const { initialize, isAuthenticated } = useAuthStore();
  const { fetchSources } = useFeedSourceStore();
  const { fetchCollections } = useCollectionStore();
  const { fetchFeads, createFead, updateFead, deleteFead } = useFeadStore();
  const { fetchItems } = useFeedStore();

  const [isFeadModalOpen, setIsFeadModalOpen] = useState(false);
  const [editingFead, setEditingFead] = useState<Fead | null>(null);

  // Register service worker for PWA functionality
  useRegisterSW({
    onNeedRefresh() {
      // Show a prompt to refresh when new content is available
      if (confirm('New content available. Reload?')) {
        window.location.reload();
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
  });

  // Initialize auth and fetch data on mount
  useEffect(() => {
    const initApp = async () => {
      // Clear old persisted sources data (migration from POC)
      localStorage.removeItem('maifead-feed-sources');
      localStorage.removeItem('maifead-collections');
      localStorage.removeItem('maifead-feads'); // Clear old localStorage Feads

      await initialize();
    };
    initApp();
  }, [initialize]);

  // Fetch sources, collections, feads, and feed items when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSources();
      fetchCollections();
      fetchFeads();
      fetchItems({ limit: 500 }); // Increased to handle multiple sources
    }
  }, [isAuthenticated, fetchSources, fetchCollections, fetchFeads, fetchItems]);

  const feedItems = useFeedStore(state => state.items);

  const handleCreateFead = () => {
    setEditingFead(null);
    setIsFeadModalOpen(true);
  };

  const handleEditFead = (fead: Fead) => {
    setEditingFead(fead);
    setIsFeadModalOpen(true);
  };

  const handleSaveFead = (feadData: { name: string; icon: string; isImportant?: boolean; sourceIds: string[] }) => {
    if (editingFead) {
      updateFead(editingFead.id, feadData);
    } else {
      createFead(feadData);
    }
  };

  const handleDeleteFead = async (feadId: string) => {
    await deleteFead(feadId);
  };

  const handleCloseFeadModal = () => {
    setIsFeadModalOpen(false);
    setEditingFead(null);
  };

  return (
    <>
      <IconRail />
      <BottomNav />
      <FeadsPanel onCreateFead={handleCreateFead} onEditFead={handleEditFead} />
      <FeadModal
        isOpen={isFeadModalOpen}
        onClose={handleCloseFeadModal}
        onSave={handleSaveFead}
        onDelete={handleDeleteFead}
        editFead={editingFead}
      />
      <CollectionsPanel />
      <FeedControlsPanel items={feedItems} />
      <ToastContainer />
      <InstallPrompt />
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

        {/* Admin panel page */}
        <Route
          path="/admin"
          element={
            <Layout>
              <AdminPage />
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
