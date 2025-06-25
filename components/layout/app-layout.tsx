"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ConnectionsSidebar } from "@/components/connections-sidebar";
import { CollapsibleSidebar } from "@/components/collapsible-sidebar";
import { DatabaseConnectionStatus } from "@/components/database-connection-status";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Determine which sidebar to show based on the current route
  const isConnectionsPage = pathname === "/connections";
  const isGetStartedPage = pathname === "/get-started";
  const isQueryPage = pathname === "/query";
  
  // Don't show layout on get-started page (it has its own layout)
  if (isGetStartedPage) {
    return <>{children}</>;
  }

  const handleQuerySaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLoadQuery = (query: string) => {
    // This will be passed down to query page components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('loadQuery', { detail: query }));
    }
  };

  return (
    <div className="h-screen w-full bg-background flex">
      {/* Fixed Sidebar */}
      <div className="flex-shrink-0">
        {isConnectionsPage ? (
          <ConnectionsSidebar />
        ) : (
          <CollapsibleSidebar 
            onLoadQuery={handleLoadQuery}
            refreshTrigger={refreshTrigger}
            hideTablesSection={isQueryPage}
          />
        )}
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Database Connection Status Bar */}
        <DatabaseConnectionStatus />
        
        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {React.cloneElement(children as React.ReactElement, {
            onQuerySaved: handleQuerySaved,
            onLoadQuery: handleLoadQuery,
          })}
        </div>
      </div>
    </div>
  );
}