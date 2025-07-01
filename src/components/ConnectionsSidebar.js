import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Database, Plus, BookOpen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import SavedConnectionsList from "./SavedConnectionsList";
import RecentConnectionsList from "./RecentConnectionsList";
import { DatabaseSchemaSection } from "./DatabaseSchemaSection";
import { SavedQueriesSearchSection } from "./SavedQueriesSearchSection";
import { cn } from "../lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

export function ConnectionsSidebar({ onLoadQuery, refreshTrigger }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    navigate("/connections");
  };

  const handleGetStarted = () => {
    navigate("/get-started");
  };

  // Determine if we should show the database schema section
  const isConnectionsPage = location.pathname === "/connections";
  const isQueryPage = location.pathname === "/query";
  const isTablePage = location.pathname === "/table";

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
              className={cn(
                "h-8 w-8 p-0 transition-all duration-200 hover:scale-110",
                "bg-primary/10 hover:bg-primary/20 text-primary",
                "border border-primary/20 hover:border-primary/30",
                "shadow-sm hover:shadow-md",
                "relative overflow-hidden group"
              )}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {/* Animated background highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon with enhanced styling */}
              <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </div>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-md bg-primary/20 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300" />
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