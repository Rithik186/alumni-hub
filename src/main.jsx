import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents refetching when switching tabs
      refetchOnMount: false, // Prevents refetching when navigating back to a page
      staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
      gcTime: 30 * 60 * 1000,   // Keep in cache for 30 minutes
      retry: 1, // Minimize retry spam on errors
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
