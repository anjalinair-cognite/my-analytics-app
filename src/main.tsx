import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { defaultAsset360ViewModelContext } from './asset360/asset360ViewModelContext';
import { DefaultFileViewer } from './asset360/DefaultFileViewer';
import { shouldRetryQuery } from './shared/utils/throttleRetry';

import './styles.css';

const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (stored === 'dark' || (!stored && prefersDark)) {
  document.documentElement.classList.add('dark');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: shouldRetryQuery,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App
        viewModelContext={{
          ...defaultAsset360ViewModelContext,
          renderFileViewer: DefaultFileViewer,
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
