"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Database, Plus, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import SavedConnectionsList from "@/components/saved_connections_list";
import RecentConnectionsList from "@/components/recent_connections_list";
import { DatabaseSchemaSection } from "@/components/database-schema-section";
import { SavedQueriesSearchSection } from "@/components/saved-queries-search-section";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";

interface ConnectionsSidebarProps {
  onLoadQuery?: (query: string) => void;
  refreshTrigger?: number;
}

export function ConnectionsSidebar({ onLoadQuery, refreshTrigger }: ConnectionsSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Persist sidebar state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("connections-sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("connections-sidebar-collapsed", JSON.stringify(newState));
  };

  const handleNewConnection = () => {
    router.push("/connections");
  };

  const handleGetStarted = () => {
    router.push("/get-started");
  };

  // Determine if we should show the database schema section
  const isConnectionsPage = pathname === "/connections";
  const isQueryPage = pathname === "/query";
  const isTablePage = pathname === "/table";

  return (
    <aside
      className={cn(
        "h-full bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-80"
      )}
    >
      {/* Header */}
      <header className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">PostgreSQL</h1>
                <p className="text-xs text-muted-foreground">Database Manager</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {!isCollapsed && <ThemeToggle />}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="h-8 w-8 p-0"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        {!isCollapsed && (
          <div className="space-y-2 mt-4">
            <Button
              onClick={handleNewConnection}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 btn-hover-lift"
            >
              <Plus className="h-4 w-4" />
              New Connection
            </Button>
          </div>
        )}
      </header>

      {/* Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-auto">
          <div className="space-y-0">
            {/* Get Started Navigation Link */}
            <div className="border-b border-border">
              <button
                onClick={handleGetStarted}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">Get Started</h3>
                  <p className="text-xs text-muted-foreground">Installation & setup guide</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            </div>
            
            {/* Saved Connections */}
            <div className="border-b border-border">
              <SavedConnectionsList />
            </div>
            
            {/* Recent Connections */}
            <div className="border-b border-border">
              <RecentConnectionsList />
            </div>
            
            {/* Saved Queries with Search - Show on query and table pages */}
            {(isQueryPage || isTablePage) && (
              <SavedQueriesSearchSection 
                onLoadQuery={onLoadQuery}
                refreshTrigger={refreshTrigger}
              />
            )}
            
            {/* Database Schema - Show on query and table pages */}
            {(isQueryPage || isTablePage) && (
              <DatabaseSchemaSection />
            )}
          </div>
        </div>
      )}

      {/* Collapsed state - show only icons */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center pt-4 space-y-4">
          <div className="p-2 bg-primary/10 rounded-lg" title="PostgreSQL Database Manager">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewConnection}
            className="h-8 w-8 p-0"
            title="New Connection"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGetStarted}
            className="h-8 w-8 p-0"
            title="Get Started Guide"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      )}
    </aside>
  );
}