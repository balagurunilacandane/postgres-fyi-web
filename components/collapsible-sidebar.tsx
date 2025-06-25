"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Database, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import SchemaList from "@/components/schema_list";
import { SavedQueriesSection } from "@/components/saved-queries-section";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CollapsibleSidebarProps {
  onLoadQuery: (query: string) => void;
  refreshTrigger?: number;
  hideTablesSection?: boolean;
}

export function CollapsibleSidebar({ onLoadQuery, refreshTrigger, hideTablesSection = false }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  // Persist sidebar state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("query-sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("query-sidebar-collapsed", JSON.stringify(newState));
  };

  const handleGetStarted = () => {
    router.push("/get-started");
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
                <h1 className="text-lg font-bold text-foreground">Database Schema</h1>
                <p className="text-xs text-muted-foreground">Query Interface</p>
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
            
            {/* Saved Queries Section */}
            <SavedQueriesSection onLoadQuery={onLoadQuery} refreshTrigger={refreshTrigger} />
            
            {/* Schema Section - Hidden on query page */}
            {!hideTablesSection && (
              <div className="p-4">
                <SchemaList />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed state - show only icons */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center pt-4 space-y-4">
          <div className="p-2 bg-primary/10 rounded-lg" title="Database Schema">
            <Database className="h-6 w-6 text-primary" />
          </div>
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