"use client";

import React, { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Save, Download, Upload, Settings, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useCtrlEnter, KeyUtils } from "@/hooks/use-keyboard-shortcut";
import { v4 as uuidv4 } from "uuid";

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  timestamp: number;
}

interface ResizableSqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  loading?: boolean;
  readOnly?: boolean;
  onSaveSuccess?: () => void;
}

export function ResizableSqlEditor({
  value,
  onChange,
  onRun,
  loading = false,
  readOnly = false,
  onSaveSuccess,
}: ResizableSqlEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const commandsRef = useRef<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [queryName, setQueryName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editorHeight, setEditorHeight] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced Ctrl+Enter hook with editor focus detection
  useCtrlEnter(
    () => {
      console.log('Ctrl+Enter triggered via hook');
      if (onRun && !loading && !readOnly && value.trim()) {
        onRun();
        toast({
          title: "Query Executed",
          description: "Running your SQL query...",
        });
      }
    },
    true, // enabled
    editorContainerRef.current // require focus on editor container
  );

  // Calculate available height for editor
  useEffect(() => {
    const calculateHeight = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        // Reserve space for controls (approximately 120px)
        const availableHeight = Math.max(200, containerHeight - 120);
        setEditorHeight(availableHeight);
      }
    };

    calculateHeight();
    
    // Recalculate on window resize
    const handleResize = () => {
      calculateHeight();
    };

    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver for more accurate container size tracking
    const resizeObserver = new ResizeObserver(() => {
      calculateHeight();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure SQL language features
    monaco.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [
          {
            label: "SELECT",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "SELECT ",
            documentation: "SELECT statement to query data",
          },
          {
            label: "FROM",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "FROM ",
            documentation: "FROM clause to specify table",
          },
          {
            label: "WHERE",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "WHERE ",
            documentation: "WHERE clause for filtering",
          },
          {
            label: "INSERT INTO",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "INSERT INTO ",
            documentation: "INSERT statement to add data",
          },
          {
            label: "UPDATE",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "UPDATE ",
            documentation: "UPDATE statement to modify data",
          },
          {
            label: "DELETE FROM",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "DELETE FROM ",
            documentation: "DELETE statement to remove data",
          },
          {
            label: "CREATE TABLE",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "CREATE TABLE ",
            documentation: "CREATE TABLE statement",
          },
          {
            label: "ALTER TABLE",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "ALTER TABLE ",
            documentation: "ALTER TABLE statement",
          },
          {
            label: "DROP TABLE",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "DROP TABLE ",
            documentation: "DROP TABLE statement",
          },
          {
            label: "JOIN",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "JOIN ",
            documentation: "JOIN clause to combine tables",
          },
          {
            label: "LEFT JOIN",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "LEFT JOIN ",
            documentation: "LEFT JOIN clause",
          },
          {
            label: "RIGHT JOIN",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "RIGHT JOIN ",
            documentation: "RIGHT JOIN clause",
          },
          {
            label: "INNER JOIN",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "INNER JOIN ",
            documentation: "INNER JOIN clause",
          },
          {
            label: "ORDER BY",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "ORDER BY ",
            documentation: "ORDER BY clause for sorting",
          },
          {
            label: "GROUP BY",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "GROUP BY ",
            documentation: "GROUP BY clause for grouping",
          },
          {
            label: "HAVING",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "HAVING ",
            documentation: "HAVING clause for group filtering",
          },
          {
            label: "LIMIT",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "LIMIT ",
            documentation: "LIMIT clause to restrict results",
          },
        ];
        return { suggestions };
      },
    });

    // Clear any existing commands
    commandsRef.current.forEach(command => {
      try {
        if (command && typeof command.dispose === 'function') {
          command.dispose();
        }
      } catch (error) {
        console.warn('Error disposing command:', error);
      }
    });
    commandsRef.current = [];

    // Enhanced Monaco Editor keyboard shortcuts with proper disposal tracking
    try {
      const runQueryCommand = editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        () => {
          console.log('Monaco Ctrl+Enter command triggered');
          if (onRun && !loading && !readOnly && value.trim()) {
            onRun();
          }
        }
      );

      const saveQueryCommand = editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        (e: any) => {
          e?.preventDefault?.();
          handleSaveQuery();
        }
      );

      // Store commands for proper disposal
      if (runQueryCommand) commandsRef.current.push(runQueryCommand);
      if (saveQueryCommand) commandsRef.current.push(saveQueryCommand);
    } catch (error) {
      console.warn('Error adding Monaco commands:', error);
    }

    // Additional cross-browser keyboard event handling
    const handleEditorKeyDown = (e: KeyboardEvent) => {
      // Handle Ctrl+Enter with multiple detection methods
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.keyCode === 13)) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Editor keydown Ctrl+Enter detected');
        if (onRun && !loading && !readOnly && value.trim()) {
          onRun();
        }
      }
      
      // Handle Ctrl+S
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
        e.preventDefault();
        e.stopPropagation();
        handleSaveQuery();
      }
    };

    // Add event listener to editor's DOM node
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener('keydown', handleEditorKeyDown, true);
    }

    // Store cleanup function on editor instance
    editor._keydownCleanup = () => {
      if (editorDomNode) {
        editorDomNode.removeEventListener('keydown', handleEditorKeyDown, true);
      }
      
      // Dispose Monaco commands safely
      commandsRef.current.forEach(command => {
        try {
          if (command && typeof command.dispose === 'function') {
            command.dispose();
          }
        } catch (error) {
          console.warn('Error disposing command during cleanup:', error);
        }
      });
      commandsRef.current = [];
    };

    // Focus the editor after mount
    setTimeout(() => {
      try {
        editor.focus();
      } catch (error) {
        console.warn('Error focusing editor:', error);
      }
    }, 100);
  };

  // Cleanup keyboard listeners when component unmounts
  useEffect(() => {
    return () => {
      if (editorRef.current?._keydownCleanup) {
        try {
          editorRef.current._keydownCleanup();
        } catch (error) {
          console.warn('Error during editor cleanup:', error);
        }
      }
      
      // Additional cleanup for commands
      commandsRef.current.forEach(command => {
        try {
          if (command && typeof command.dispose === 'function') {
            command.dispose();
          }
        } catch (error) {
          console.warn('Error disposing command during unmount:', error);
        }
      });
      commandsRef.current = [];
    };
  }, []);

  const handleDownloadQuery = () => {
    if (!value.trim()) {
      toast({
        title: "Warning",
        description: "No query to download",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = new Blob([value], { type: "text/sql" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `query-${new Date().toISOString().split("T")[0]}.sql`;
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

  const handleLoadQuery = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".sql,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onChange(content);
          toast({
            title: "Success",
            description: "Query loaded successfully",
          });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formatQuery = () => {
    if (editorRef.current) {
      try {
        editorRef.current.getAction("editor.action.formatDocument").run();
        toast({
          title: "Success",
          description: "Query formatted",
        });
      } catch (error) {
        toast({
          title: "Warning",
          description: "Format action not available",
        });
      }
    }
  };

  const handleSaveQuery = () => {
    if (!value.trim()) {
      toast({
        title: "Warning",
        description: "No query to save",
        variant: "destructive",
      });
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = async () => {
    if (!queryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a query name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const savedQuery: SavedQuery = {
        id: uuidv4(),
        name: queryName.trim(),
        query: value,
        timestamp: Date.now(),
      };

      // Get existing saved queries
      const existingQueries = localStorage.getItem("saved_queries");
      let queries: SavedQuery[] = [];
      
      if (existingQueries) {
        try {
          queries = JSON.parse(existingQueries);
        } catch (error) {
          console.error("Failed to parse existing queries:", error);
          queries = [];
        }
      }

      // Add new query to the beginning of the array
      queries.unshift(savedQuery);

      // Keep only the last 50 queries to prevent localStorage bloat
      queries = queries.slice(0, 50);

      // Save back to localStorage
      localStorage.setItem("saved_queries", JSON.stringify(queries));

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent("querySaved"));

      toast({
        title: "Success",
        description: `Query "${queryName}" saved successfully`,
      });

      setShowSaveDialog(false);
      setQueryName("");
      onSaveSuccess?.();
    } catch (error) {
      console.error("Failed to save query:", error);
      toast({
        title: "Error",
        description: "Failed to save query",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Enhanced run query handler with feedback
  const handleRunQuery = () => {
    if (onRun && !loading && !readOnly && value.trim()) {
      console.log('Run query button clicked');
      onRun();
    }
  };

  if (!mounted) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center border rounded-md bg-muted/50 h-full"
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      {/* Editor Controls - Fixed Height */}
      <div className="flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRunQuery}
              disabled={loading || !value.trim() || readOnly}
              size="sm"
              className="gap-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run Query
            </Button>
            <span className="text-xs text-muted-foreground">
              {KeyUtils.getShortcutText('Enter')} to run
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveQuery}
              disabled={!value.trim() || readOnly}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Query
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadQuery}
              disabled={!value.trim()}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLoadQuery}>
              <Upload className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={formatQuery}>
                  Format Query
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (editorRef.current) {
                      try {
                        editorRef.current.focus();
                      } catch (error) {
                        console.warn('Error focusing editor:', error);
                      }
                    }
                  }}
                >
                  Focus Editor
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onChange("");
                    toast({
                      title: "Success",
                      description: "Editor cleared",
                    });
                  }}
                >
                  Clear Editor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Editor Container - Flexible Height with Constraints */}
      <div className="flex-1 min-h-0 mt-4">
        <div 
          ref={editorContainerRef}
          className="border rounded-md overflow-hidden h-full focus-within:ring-2 focus-within:ring-primary/20"
          style={{ height: editorHeight > 0 ? `${editorHeight}px` : '100%' }}
          tabIndex={-1}
        >
          <Editor
            height="100%"
            defaultLanguage="sql"
            value={value}
            onChange={(val) => onChange(val || "")}
            onMount={handleEditorDidMount}
            theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
            options={{
              minimap: { enabled: editorHeight > 400 },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: "on",
              contextmenu: true,
              selectOnLineNumbers: true,
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              renderLineHighlight: "all",
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false,
              },
              suggest: {
                showKeywords: true,
                showSnippets: true,
                showFunctions: true,
              },
              quickSuggestions: {
                other: true,
                comments: false,
                strings: false,
              },
            }}
          />
        </div>
      </div>

      {/* Save Query Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Save Query
            </DialogTitle>
            <DialogDescription>
              Give your query a name to save it for later use.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="query-name" className="text-right">
                Name
              </Label>
              <Input
                id="query-name"
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                placeholder="Enter query name..."
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !saving) {
                    handleSaveConfirm();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveConfirm}
              disabled={saving || !queryName.trim()}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Query"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}