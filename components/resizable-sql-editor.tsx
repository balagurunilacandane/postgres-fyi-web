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
  const [mounted, setMounted] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [editorHeight, setEditorHeight] = useState(400);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [queryName, setQueryName] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const MIN_HEIGHT = 200;
  const MAX_HEIGHT = 800;

  useEffect(() => {
    setMounted(true);
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

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun && !loading) {
        onRun();
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, (e: any) => {
      e.preventDefault();
      handleSaveQuery();
    });
  };

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
      editorRef.current.getAction("editor.action.formatDocument").run();
      toast({
        title: "Success",
        description: "Query formatted",
      });
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

  // Handle resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = editorHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + deltaY));
      setEditorHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center border rounded-md bg-muted/50"
        style={{ height: `${editorHeight}px` }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Editor Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={onRun}
            disabled={loading || !value.trim()}
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
            Ctrl+Enter to run
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
                    editorRef.current.focus();
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

      {/* Resizable Editor Container */}
      <div className="relative">
        <div 
          className="border rounded-md overflow-hidden"
          style={{ height: `${editorHeight}px` }}
        >
          <Editor
            height="100%"
            defaultLanguage="sql"
            value={value}
            onChange={(val) => onChange(val || "")}
            onMount={handleEditorDidMount}
            theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
            options={{
              minimap: { enabled: editorHeight > 500 },
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
        
        {/* Resize Handle */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-2 cursor-row-resize bg-transparent hover:bg-primary/20 transition-colors ${
            isResizing ? "bg-primary/30" : ""
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
      </div>

      {/* Height Indicator */}
      <div className="text-xs text-muted-foreground text-right">
        Editor height: {editorHeight}px (min: {MIN_HEIGHT}px, max: {MAX_HEIGHT}px)
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