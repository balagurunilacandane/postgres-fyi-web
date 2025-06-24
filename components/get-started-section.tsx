"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Terminal,
  Play,
  CheckCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const installationSteps = [
  {
    id: 1,
    title: "Install postgres-fyi package",
    description: "Install the systemctl package using apt-get",
    command: "sudo apt-get install postgres-fyi",
    note: "This will install the postgres-fyi service on your system",
  },
  {
    id: 2,
    title: "Start the service",
    description: "Start the postgres-fyi service using systemctl",
    command: "sudo systemctl start postgres-fyi",
    note: "The service will start and be ready to accept connections",
  },
  {
    id: 3,
    title: "Service runs on port 6240",
    description: "The service automatically runs on port 6240",
    command: "# Service will be available at http://localhost:6240",
    note: "No additional configuration needed - the service is ready to use",
    isInfo: true,
  },
];

export function GetStartedSection() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Persist section state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("get-started-section-open");
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState));
    }
  }, []);

  const handleToggleSection = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("get-started-section-open", JSON.stringify(newState));
  };

  const handleCopyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      toast({
        title: "Copied!",
        description: "Command copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy command",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border-b border-border group">
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
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Get Started</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            Setup Guide
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          <div className="space-y-6">
            {/* Introduction */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Welcome to PostgreSQL FYI
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Follow these simple steps to install and run the postgres-fyi service on your system. 
                    The service provides a powerful interface for managing PostgreSQL databases.
                  </p>
                </div>
              </div>
            </div>

            {/* Installation Steps */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                Installation Steps
              </h4>
              
              {installationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="bg-card border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5",
                      step.isInfo 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-primary/10 text-primary"
                    )}>
                      {step.isInfo ? "i" : step.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-foreground mb-1">
                        {step.title}
                      </h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        {step.description}
                      </p>
                      
                      {/* Command Block */}
                      <div className="bg-muted/50 border border-border rounded-md p-3 font-mono text-sm">
                        <div className="flex items-center justify-between">
                          <code className="text-foreground flex-1 break-all">
                            {step.command}
                          </code>
                          {!step.isInfo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyCommand(step.command)}
                              className="h-8 w-8 p-0 ml-2 flex-shrink-0"
                              title="Copy command"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Note */}
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        {step.note}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                    What's Next?
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed mb-3">
                    Once the service is running, you can create database connections and start querying your PostgreSQL databases.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
                      onClick={() => window.open("http://localhost:6240", "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Service (Port 6240)
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">
                Troubleshooting
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Make sure you have sudo privileges to install packages</li>
                <li>• Check if the service is running: <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded">sudo systemctl status postgres-fyi</code></li>
                <li>• Verify port 6240 is not being used by another service</li>
                <li>• Check system logs if the service fails to start</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}