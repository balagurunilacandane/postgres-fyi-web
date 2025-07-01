import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Zap,
} from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";

const LOCAL_STORAGE_KEY = "recentConnections";

function RecentConnectionsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-lg p-3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-muted rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted/70 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyRecentState() {
  return (
    <div className="text-center py-6 px-4">
      <div className="relative mb-3">
        <Clock className="h-12 w-12 text-muted-foreground/40 mx-auto" />
        <Zap className="h-4 w-4 text-primary/60 absolute -top-1 -right-1 animate-pulse" />
      </div>
      <p className="text-sm text-muted-foreground mb-1">
        No recent connections
      </p>
      <p className="text-xs text-muted-foreground">
        Your recent database connections will appear here
      </p>
    </div>
  );
}

export default function RecentConnectionsList() {
  const [recentConnections, setRecentConnections] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Persist section state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("recent-connections-section-open");
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState));
    }
  }, []);

  const handleToggleSection = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("recent-connections-section-open", JSON.stringify(newState));
  };

  const loadConnections = () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setRecentConnections(JSON.parse(stored));
      } catch {
        setRecentConnections([]);
      }
    } else {
      setRecentConnections([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadConnections();

    const handleStorage = (event) => {
      if (event.key === LOCAL_STORAGE_KEY) {
        loadConnections();
      }
    };
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(() => {
      loadConnections();
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  if (!loading && recentConnections.length === 0) {
    return (
      <div className="group">
        <button
          onClick={handleToggleSection}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Recent Connections</h3>
          </div>
        </button>

        {isOpen && (
          <div className="px-4 pb-4">
            <EmptyRecentState />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group">
      <button
        onClick={handleToggleSection}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Recent Connections</h3>
          {recentConnections.length > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              {recentConnections.length}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          {loading ? (
            <RecentConnectionsSkeleton />
          ) : (
            <div className="space-y-2">
              {recentConnections.map((conn) => (
                <div
                  key={conn.id}
                  className="group bg-card border border-border rounded-lg p-3 hover:bg-muted/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {conn.host}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {conn.database}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}