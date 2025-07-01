import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/toaster';
import { AppLayout } from './components/layout/AppLayout';
import ConnectionsPage from './pages/ConnectionsPage';
import QueryPage from './pages/QueryPage';
import TablePage from './pages/TablePage';
import GetStartedPage from './pages/GetStartedPage';

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ErrorBoundary>
        <div className="h-screen w-screen relative bg-background">
          <Router>
            <Routes>
              <Route path="/get-started" element={<GetStartedPage />} />
              <Route path="/*" element={
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/connections" replace />} />
                    <Route path="/connections" element={<ConnectionsPage />} />
                    <Route path="/query" element={<QueryPage />} />
                    <Route path="/table" element={<TablePage />} />
                  </Routes>
                </AppLayout>
              } />
            </Routes>
          </Router>
          <Toaster />
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;