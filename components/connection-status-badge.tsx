"use client";

import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionStatusBadgeProps {
  className?: string;
}

export function ConnectionStatusBadge({ className }: ConnectionStatusBadgeProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try to connect to the postgres-fyi service on port 6240
        const response = await fetch('http://localhost:6240/health', {
          method: 'GET',
          timeout: 5000,
        } as RequestInit);
        
        if (response.ok) {
          setStatus('connected');
        } else {
          setStatus('disconnected');
        }
      } catch (error) {
        setStatus('disconnected');
      }
    };

    // Initial check
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: Loader2,
          text: 'Checking...',
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
          iconClass: 'animate-spin',
        };
      case 'connected':
        return {
          icon: Wifi,
          text: 'Connected',
          bgColor: 'bg-[#4CAF50]',
          textColor: 'text-white',
          iconClass: '',
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'Disconnected',
          bgColor: 'bg-[#F44336]',
          textColor: 'text-white',
          iconClass: '',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm backdrop-blur-sm transition-all duration-300",
        config.bgColor,
        config.textColor,
        className
      )}
      title={`postgres-fyi service is ${status === 'checking' ? 'being checked' : status}`}
    >
      <Icon className={cn("h-4 w-4", config.iconClass)} />
      <span className="text-sm font-medium">
        {config.text}
      </span>
    </div>
  );
}