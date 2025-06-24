"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Trash2,
  Download,
  Copy,
  DownloadCloud,
  FileText,
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  timestamp: number;
}

interface SavedQueriesSectionProps {
  onLoadQuery: (query: string) => void;
  refreshTrigger?: number;
}

export function SavedQueriesSection({ onLoadQuery, refreshTrigger }: SavedQueriesSectionProps) {
  const [isOpen, setIsOpen] = useState(false); // Changed from true to false
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Persist section state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("saved-queries-section-open");
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState));
    }
  }, []);

  const handleToggleSection = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("saved-queries-section-open", JSON.stringify(newState));
  };

  // Load saved queries from localStorage
  const loadSavedQueries = () => {
    try {
      const stored = localStorage.getItem("saved_queries");
      if (stored) {
        const queries = JSON.parse(stored);
        setSavedQueries(queries);
      } else {
        setSavedQueries([]);
      }
    } catch (error) {
      console.error("Failed to load saved queries:", error);
      setSavedQueries([]);
      toast({
        title: "Error",
        description: "Failed to load saved queries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSavedQueries();
    }
  }, [refreshTrigger, isOpen]);

  // Delete a saved query
  const handleDelete = (id: string) => {
    try {
      const updatedQueries = savedQueries.filter(q => q.id !== id);
      setSavedQueries(updatedQueries);
      localStorage.setItem("saved_queries", JSON.stringify(updatedQueries));
      toast({
        title: "Success",
        description: "Query deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete query",
        variant: "destructive",
      });
    }
  };

  // Download a single query
  const handleDownload = (query: SavedQuery) => {
    try {
      const blob = new Blob([query.query], { type: "text/sql" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${query.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Query downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download query",
        variant: "destructive",
      });
    }
  };

  // Copy query to clipboard
  const handleCopy = async (query: SavedQuery) => {
    try {
      await navigator.clipboard.writeText(query.query);
      toast({
        title: "Success",
        description: "Query copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy query",
        variant: "destructive",
      });
    }
  };

  // Load query into editor
  const handleEdit = (query: SavedQuery) => {
    onLoadQuery(query.query);
    toast({
      title: "Success",
      description: `Loaded "${query.name}" into editor`,
    });
  };

  // Download all queries as a zip-like text file
  const handleDownloadAll = () => {
    if (savedQueries.length === 0) {
      toast({
        title: "Info",
        description: "No queries to download",
      });
      return;
    }

    try {
      const allQueries = savedQueries.map(query => 
        `-- Query: ${query.name}\n-- Created: ${new Date(query.timestamp).toLocaleString()}\n\n${query.query}\n\n${'='.repeat(80)}\n\n`
      ).join('');

      const blob = new Blob([allQueries], { type: "text/sql" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all_saved_queries_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: `Downloaded ${savedQueries.length} queries`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download all queries",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Saved Queries</h3>
          {savedQueries.length > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              {savedQueries.length}
            </span>
          )}
        </div>
        {savedQueries.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadAll();
            }}
            className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <DownloadCloud className="h-4 w-4" />
            Download All
          </Button>
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-muted-foreground">Loading queries...</span>
            </div>
          ) : savedQueries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No saved queries yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Save your first query to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedQueries.length > 1 && (
                <div className="flex justify-end mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadAll}
                    className="gap-2"
                  >
                    <DownloadCloud className="h-4 w-4" />
                    Download All
                  </Button>
                </div>
              )}
              
              {savedQueries.map((query) => (
                <div
                  key={query.id}
                  className="group bg-card border border-border rounded-lg p-3 hover:bg-muted/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {query.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(query.timestamp)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {query.query.substring(0, 60)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(query)}
                        className="h-8 w-8 p-0"
                        title="Load into editor"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(query)}
                        className="h-8 w-8 p-0"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(query)}
                        className="h-8 w-8 p-0"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Delete query"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Query</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{query.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(query.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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