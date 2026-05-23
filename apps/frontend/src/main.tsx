import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Lock to portrait in installed PWA mode. Silently ignored in browser tabs
// and on iOS Safari which does not implement this API.
const orientationLock = (screen.orientation as any)?.lock;
if (typeof orientationLock === 'function') {
  orientationLock.call(screen.orientation, 'portrait').catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
