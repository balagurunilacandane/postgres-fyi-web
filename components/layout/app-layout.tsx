"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ConnectionsSidebar } from "@/components/connections-sidebar";
import { DatabaseConnectionStatus } from "@/components/database-connection-status";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Don't show layout on get-started page (it has its own layout)
  const isGetStartedPage = pathname === "/get-started";
  
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

  const handleLoadQuery = (query: string) => {
    // Dispatch event for query page to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('loadQuery', { detail: query }));
    }
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