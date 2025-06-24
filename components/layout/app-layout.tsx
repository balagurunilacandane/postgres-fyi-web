"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ConnectionsSidebar } from "@/components/connections-sidebar";
import { CollapsibleSidebar } from "@/components/collapsible-sidebar";
import { DatabaseConnectionStatus } from "@/components/database-connection-status";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Determine which sidebar to show based on the current route
  const isConnectionsPage = pathname === "/connections";
  const isGetStartedPage = pathname === "/get-started";
  
  // Don't show layout on get-started page (it has its own layout)
  if (isGetStartedPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-full bg-background flex">
      {/* Fixed Sidebar */}
      <div className="flex-shrink-0">
        {isConnectionsPage ? (
          <ConnectionsSidebar />
        ) : (
          <CollapsibleSidebar 
            onLoadQuery={() => {}} 
            refreshTrigger={0}
          />
        )}
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