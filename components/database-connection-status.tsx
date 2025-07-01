"use client";

import React, { useState, useEffect } from "react";
import { Database, Wifi, WifiOff, Server, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/utils/axiosInstance";

interface ConnectionInfo {
  id: string;
  host: string;
  port: string | number;
  database: string;
  username: string;
  isConnected: boolean;
  lastConnected?: number;
}

function ConnectionStatusSkeleton() {
  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center gap-4 animate-pulse">
        <div className="h-4 w-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-4 bg-muted rounded w-32" />
        <div className="h-4 bg-muted rounded w-20" />
        <div className="h-4 bg-muted rounded w-16" />
        <div className="ml-auto h-3 bg-muted rounded w-32" />
      </div>
    </div>
  );
}

export function DatabaseConnectionStatus() {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connectionId = localStorage.getItem("current_conn_id");
        if (!connectionId) {
          setConnectionInfo(null);
          setLoading(false);
          return;
        }

        // Get connection details from localStorage
        const recentConnections = localStorage.getItem("recentConnections");
        const savedConnections = localStorage.getItem("savedConnections");
        
        let connectionDetails = null;
        
        if (recentConnections) {
          const recent = JSON.parse(recentConnections);
          connectionDetails = recent.find((conn: any) => conn.id === connectionId);
        }
        
        if (!connectionDetails && savedConnections) {
          const saved = JSON.parse(savedConnections);
          connectionDetails = saved.find((conn: any) => conn.id === connectionId);
        }

        if (connectionDetails) {
          // Test the connection using health endpoint
          try {
            await api.get('/health');
            
            setConnectionInfo({
              ...connectionDetails,
              isConnected: true,
              lastConnected: Date.now(),
            });
          } catch (error) {
            setConnectionInfo({
              ...connectionDetails,
              isConnected: false,
            });
          }
        } else {
          setConnectionInfo(null);
        }
      } catch (error) {
        console.error("Failed to check connection:", error);
        setConnectionInfo(null);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
    
    // Check connection status every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <ConnectionStatusSkeleton />;
  }

  if (!connectionInfo) {
    return (
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 text-muted-foreground">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">No database connection</span>
          <span className="text-xs">Connect to a database to get started</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connectionInfo.isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                connectionInfo.isConnected ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
              )}
            >
              {connectionInfo.isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Database Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span className="font-medium text-foreground">{connectionInfo.database}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Server className="h-4 w-4" />
              <span>{connectionInfo.host}:{connectionInfo.port}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{connectionInfo.username}</span>
            </div>
          </div>
        </div>

        {/* Last Connected */}
        {connectionInfo.lastConnected && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Last connected: {new Date(connectionInfo.lastConnected).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}