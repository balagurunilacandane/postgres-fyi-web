import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ConnectionsSidebar } from "../ConnectionsSidebar";
import { DatabaseConnectionStatus } from "../DatabaseConnectionStatus";

export function AppLayout({ children }) {
  const location = useLocation();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Don't show layout on get-started page (it has its own layout)
  const isGetStartedPage = location.pathname === "/get-started";
  
  if (isGetStartedPage) {
    return <>{children}</>;
  }

  // Listen for query saved events to refresh sidebar
  useEffect(() => {
    const handleQuerySaved = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('querySaved', handleQuerySaved);
    return () => {
      window.removeEventListener('querySaved', handleQuerySaved);
    };
  }, []);

  const handleLoadQuery = (query) => {
    // Dispatch event for query page to listen to
    window.dispatchEvent(new CustomEvent('loadQuery', { detail: query }));
  };

  return (
    <div className="h-screen w-full bg-background flex">
      {/* Fixed Sidebar - Same for all pages */}
      <div className="flex-shrink-0">
        <ConnectionsSidebar 
          onLoadQuery={handleLoadQuery}
          refreshTrigger={refreshTrigger}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Database Connection Status Bar */}
        <DatabaseConnectionStatus />
        
        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}