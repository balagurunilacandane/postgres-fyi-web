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
  AlertTriangle,
  Info,
  ChevronRight,
  Home,
  Users,
  Linkedin,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const installationSteps = [
  {
    id: 1,
    title: "Quick Install",
    description: "Run this single command in your Linux machine to install PostgreSQL FYI",
    command: "curl -sSL https://raw.githubusercontent.com/AkbarHabeeb/postgresql-fyi-e2e/main/remote-install.sh | bash",
    note: "This will download and install the PostgreSQL FYI service on your system. The service will automatically start and run on port 6240.",
    icon: Download,
    color: "blue",
  },
];

const uninstallStep = {
  title: "Uninstall (if needed)",
  description: "Run this command to completely remove PostgreSQL FYI from your system",
  command: "curl -fsSL https://raw.githubusercontent.com/AkbarHabeeb/postgresql-fyi-e2e/main/scripts/uninstall.sh | sudo bash",
  note: "This will completely remove the service and all related files",
  icon: Trash2,
  color: "red",
};

const features = [
  {
    icon: Database,
    title: "Database Management",
    description: "Connect to multiple PostgreSQL databases and manage them efficiently",
  },
];

const troubleshootingItems = [
  {
    issue: "Permission denied during installation",
    solution: "Make sure you have sudo privileges and the script will handle permissions automatically",
    command: "# The installation script handles permissions automatically",
  },
  {
    issue: "Service fails to start",
    solution: "Check if port 6240 is already in use by another service",
    command: "sudo netstat -tlnp | grep :6240",
  },
  {
    issue: "Cannot connect to service",
    solution: "Verify the service is running and check firewall settings",
    command: "sudo systemctl status postgresql-fyi",
  },
];

const contributors = [
  {
    name: "Balaguru Nilacandane",
    linkedin: "https://www.linkedin.com/in/balagurunilacandane/",
  },
  {
    name: "Akbar Habeeb B",
    linkedin: "https://www.linkedin.com/in/akbarhabeebb/",
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
        description: `Installation step marked as complete`,
      });
    }
  };

  const getStepColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
      green: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
      purple: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
      red: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
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
                {completedSteps.length}/{installationSteps.length} step completed
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
            PostgreSQL FYI Service 🐘
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get up and running in minutes with our powerful PostgreSQL database management tool. 
            One simple command installs everything you need.
          </p>
        </div>

        {/* Features Overview */}
        <div className="flex justify-center mb-12">
          <Card className="text-center hover:shadow-md transition-shadow max-w-sm">
            <CardContent className="pt-6">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Database Management</h3>
              <p className="text-sm text-muted-foreground">Connect to multiple PostgreSQL databases and manage them efficiently</p>
            </CardContent>
          </Card>
        </div>

        {/* Installation Steps */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">🚀 Quick Install</h2>
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
                            {step.title}
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
                          Installation Command
                        </span>
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
                      </div>
                      <code className="block font-mono text-sm text-foreground bg-background/50 p-3 rounded border break-all">
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
                      {!isCompleted && (
                        <Button
                          onClick={() => handleStepComplete(step.id)}
                          className="gap-2"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark as Complete
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open("http://localhost:6240", "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Test Connection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Uninstall Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-bold text-foreground">Uninstall Steps</h2>
          </div>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all",
                  getStepColor(uninstallStep.color)
                )}>
                  <Trash2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg text-red-700 dark:text-red-400">
                    {uninstallStep.title}
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">{uninstallStep.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">
                    Uninstall Command
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCommand(uninstallStep.command, 0)}
                    className="h-8 gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
                    disabled={copiedCommand === uninstallStep.command}
                  >
                    {copiedCommand === uninstallStep.command ? (
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
                </div>
                <code className="block font-mono text-sm text-red-700 dark:text-red-300 bg-background/50 p-3 rounded border break-all">
                  {uninstallStep.command}
                </code>
              </div>

              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {uninstallStep.note}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
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
              Once the service is running on port 6240, you can start creating database connections and querying your PostgreSQL databases. 
              The interface provides powerful tools for database management, query execution, and data visualization.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => router.push("/connections")}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Database className="h-4 w-4" />
                Create Your First Connection
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contributors Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Meet the talented developers who made PostgreSQL FYI possible:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contributors.map((contributor, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Linkedin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <a
                      href={contributor.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {contributor.name}
                    </a>
                    <p className="text-xs text-muted-foreground">Developer</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
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
                      <code className="text-sm font-mono text-foreground break-all">{item.command}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCommand(item.command, 0)}
                        className="h-8 w-8 p-0 ml-2 flex-shrink-0"
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
      </div>
    </div>
  );
}