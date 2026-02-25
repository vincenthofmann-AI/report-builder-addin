/**
 * Entry Point
 * MyGeotab add-in initialization
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

/**
 * MyGeotab Add-In Initialization
 * This function is called by MyGeotab when the add-in is loaded
 */
(window as any).OverviewBuilder = {
  initialize: (api: any, state: any, callback: () => void) => {
    console.log('Initializing Overview-Builder Add-In');

    // Create root container
    const container = document.getElementById('overview-builder-root');

    if (!container) {
      console.error('Container element not found');
      return;
    }

    // Render React app
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App api={api} state={state} />
        </QueryClientProvider>
      </React.StrictMode>
    );

    // Notify MyGeotab that initialization is complete
    callback();
  },

  /**
   * Called when add-in receives focus
   */
  focus: (_api: any, _state: any) => {
    console.log('Overview-Builder focused');
  },

  /**
   * Called when user navigates away
   */
  blur: (_api: any, _state: any) => {
    console.log('Overview-Builder blurred');
  }
};

// Auto-initialize for standalone/demo mode
// This runs when viewing the page directly (not inside MyGeotab)
const initializeStandalone = () => {
  const container = document.getElementById('overview-builder-root');
  if (container && !container.hasChildNodes()) {
    console.log('Initializing in standalone mode');
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App api={{}} state={{ database: 'demo', userName: 'developer' }} />
        </QueryClientProvider>
      </React.StrictMode>
    );
  }
};

// Try to initialize after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeStandalone);
} else {
  // DOM is already ready
  initializeStandalone();
}
