import React from 'react';
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
import { mockFeedItems } from './data/mockFeed';

function AppContent() {
  return (
    <>
      <IconRail />
      <SourcesPanel />
      <FeadsPanel />
      <CollectionsPanel />
      <FeedControlsPanel items={mockFeedItems} />
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
