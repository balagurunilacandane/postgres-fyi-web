"use client";

import React, { useEffect, useState } from "react";

type RecentConnection = {
  id: string;
  host: string;
  database: string
};

const LOCAL_STORAGE_KEY = "recentConnections";

export default function RecentConnectionsList() {
  const [recentConnections, setRecentConnections] = useState<RecentConnection[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to load connections from localStorage
  const loadConnections = () => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
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
    // Initial load
    loadConnections();

    // Listen for localStorage changes (from other tabs/windows)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_KEY) {
        loadConnections();
      }
    };
    window.addEventListener("storage", handleStorage);

    // Listen for changes in this tab as well
    const interval = setInterval(() => {
      loadConnections();
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  if (!loading && recentConnections.length === 0) {
    return null;
  }

  return (
    <div className="p-4">
      <h4 className="text-xl font-bold mb-4 text-gray-500">Recent Connections</h4>
      {loading ? (
        <ul className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center bg-muted rounded-md px-4 py-2"
            >
              <span className="h-4 w-32 bg-gray-200 rounded block" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-3">
          {recentConnections.map((conn) => (
            <li
              key={conn.id}
              className="flex items-center bg-muted rounded-md px-4 py-2"
            >
              <div className="flex-1">
                <span
                  className="font-medium truncate max-w-[12rem] sm:max-w-xs md:max-w-sm lg:max-w-md"
                  title={conn.host}
                >
                  {conn.host}
                </span>
                <span className="text-xs text-gray-500 mt-0.5 block">{conn.database}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}