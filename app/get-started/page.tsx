"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Terminal,
  Play,
  CheckCircle,
  Copy,
  ExternalLink,
  ArrowRight,
  Download,
  Server,
  Database,
  Zap,
  Shield,
  Clock,
  Users,
  AlertTriangle,
  Info,
  ChevronRight,
  Home,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const installationSteps = [
  {
    id: 1,
    title: "Install postgres-fyi package",
    description: "Install the systemctl package using apt-get package manager",
    command: "sudo apt-get install postgres-fyi",
    note: "This will download and install the postgres-fyi service on your system",
    icon: Download,
    color: "blue",
  },
  {
    id: 2,
    title: "Start the service",
    description: "Start the postgres-fyi service using systemctl",
    command: "sudo systemctl start postgres-fyi",
    note: "The service will start and be ready to accept connections immediately",
    icon: Play,
    color: "green",
  },
  {
    id: 3,
    title: "Service runs on port 6240",
    description: "The service automatically runs on port 6240",
    command: "# Service available at http://localhost:6240",
    note: "No additional configuration needed - the service is ready to use",
    icon: Server,
    color: "purple",
    isInfo: true,
  },
];

const features = [
  {
    icon: Database,
    title: "Database Management",
    description: "Connect to multiple PostgreSQL databases and manage them efficiently",
  },
  {
    icon: Zap,
    title: "Fast Queries",
    description: "Execute SQL queries with syntax highlighting and auto-completion",
  },
  {
    icon: Shield,
    title: "Secure Connections",
    description: "Encrypted connections with support for SSL and authentication",
  },
  {
    icon: Users,
    title: "Multi-User Support",
    description: "Share saved queries and connections across your team",
  },
];

const troubleshootingItems = [
  {
    issue: "Permission denied during installation",
    solution: "Make sure you have sudo privileges and run the command with sudo",
    command: "sudo apt-get update && sudo apt-get install postgres-fyi",
  },
  {
    issue: "Service fails to start",
    solution: "Check if port 6240 is already in use by another service",
    command: "sudo netstat -tlnp | grep :6240",
  },
  {
    issue: "Cannot connect to service",
    solution: "Verify the service is running and check firewall settings",
    command: "sudo systemctl status postgres-fyi",
  },
];

export default function GetStartedPage() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleCopyCommand = async (command: string, stepId: number) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      setTimeout(() => setCopiedCommand(null), 2000);
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

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
      toast({
        title: "Step completed!",
        description: `Step ${stepId} marked as complete`,
      });
    }
  };

  const getStepColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
      green: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
      purple: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/connections")}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Back to App
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Get Started Guide</h1>
                  <p className="text-sm text-muted-foreground">PostgreSQL FYI Setup</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {completedSteps.length}/{installationSteps.length} steps completed
              </span>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${(completedSteps.length / installationSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Quick Setup Guide
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to PostgreSQL FYI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get up and running in minutes with our powerful PostgreSQL database management tool. 
            Follow these simple steps to install and configure the service.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Installation Steps */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Installation Steps</h2>
          </div>

          <div className="space-y-6">
            {installationSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const StepIcon = step.icon;
              
              return (
                <Card 
                  key={step.id} 
                  className={cn(
                    "transition-all duration-300 hover:shadow-md",
                    isCompleted && "ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-950/10"
                  )}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all",
                        isCompleted 
                          ? "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400"
                          : getStepColor(step.color)
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <StepIcon className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            Step {step.id}: {step.title}
                          </CardTitle>
                          {isCompleted && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Command Block */}
                    <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {step.isInfo ? "Information" : "Command"}
                        </span>
                        {!step.isInfo && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCommand(step.command, step.id)}
                            className="h-8 gap-2"
                            disabled={copiedCommand === step.command}
                          >
                            {copiedCommand === step.command ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copy
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      <code className="block font-mono text-sm text-foreground bg-background/50 p-3 rounded border">
                        {step.command}
                      </code>
                    </div>

                    {/* Note */}
                    <Alert className="mb-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>{step.note}</AlertDescription>
                    </Alert>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      {!isCompleted && !step.isInfo && (
                        <Button
                          onClick={() => handleStepComplete(step.id)}
                          className="gap-2"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark as Complete
                        </Button>
                      )}
                      {step.id === 3 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open("http://localhost:6240", "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Test Connection
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        <Card className="mb-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-800 dark:text-green-400">
              <CheckCircle className="h-6 w-6" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 dark:text-green-300 mb-6 leading-relaxed">
              Once the service is running, you can start creating database connections and querying your PostgreSQL databases. 
              The interface provides powerful tools for database management, query execution, and data visualization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push("/connections")}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Database className="h-4 w-4" />
                Create Your First Connection
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
                onClick={() => window.open("http://localhost:6240", "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                Open Service Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Having issues? Here are some common problems and their solutions:
            </p>
            <div className="space-y-6">
              {troubleshootingItems.map((item, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-amber-500" />
                    {item.issue}
                  </h4>
                  <p className="text-muted-foreground mb-3">{item.solution}</p>
                  <div className="bg-muted/50 border border-border rounded p-3">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-foreground">{item.command}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCommand(item.command, 0)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground mb-4">
            Need more help? Check out our documentation or contact support.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Documentation
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              Community Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}