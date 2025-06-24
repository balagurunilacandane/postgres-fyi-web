"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Database } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import SavedConnectionsList from "@/components/saved_connections_list";
import RecentConnectionsList from "@/components/recent_connections_list";
import { DatabaseSchemaSection } from "@/components/database-schema-section";
import { SavedQueriesSearchSection } from "@/components/saved-queries-search-section";
import { cn } from "@/lib/utils";

export function ConnectionsSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      </header>

      {/* Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-auto">
          <div className="space-y-0">
            {/* Saved Connections */}
            <div className="border-b border-border">
              <SavedConnectionsList />
            </div>
            
            {/* Recent Connections */}
            <div className="border-b border-border">
              <RecentConnectionsList />
            </div>
            
            {/* Saved Queries with Search */}
            <SavedQueriesSearchSection />
            
            {/* Database Schema */}
            <DatabaseSchemaSection />
          </div>
        </div>
      )}

      {/* Collapsed state - show only icons */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center pt-4 space-y-4">
          <div className="p-2 bg-primary/10 rounded-lg" title="PostgreSQL Database Manager">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <ThemeToggle />
        </div>
      )}
    </aside>
  );
}