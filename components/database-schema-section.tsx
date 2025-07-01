"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Database,
  Table,
  Columns,
  Key,
  Hash,
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useRouter } from "next/navigation";
import api from "@/utils/axiosInstance";

type Column = {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  position: number;
};

type TableSchema = {
  type: string;
  columns: Column[];
};

type SchemaResponse = {
  [tableName: string]: TableSchema;
};

export function DatabaseSchemaSection() {
  const [isOpen, setIsOpen] = useState(true);
  const [schema, setSchema] = useState<SchemaResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openTables, setOpenTables] = useState<Set<string>>(new Set());
  const router = useRouter();

  // Persist section state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("database-schema-section-open");
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState));
    }
  }, []);

  const handleToggleSection = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("database-schema-section-open", JSON.stringify(newState));
  };

  useEffect(() => {
    const fetchSchemas = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError("");
      try {
        const connId =
          typeof window !== "undefined"
            ? localStorage.getItem("current_conn_id")
            : null;
        if (!connId) {
          setError("No connection selected.");
          setLoading(false);
          return;
        }
        const res = await api.get(`/schema/${connId}`);
        setSchema(res.data.schema || {});
      } catch {
        setError("Failed to load database schema.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchemas();
  }, [isOpen]);

  // Toggle table expansion
  const handleTableToggle = (e: React.MouseEvent, table: string) => {
    e.stopPropagation();
    const newOpenTables = new Set(openTables);
    if (newOpenTables.has(table)) {
      newOpenTables.delete(table);
    } else {
      newOpenTables.add(table);
    }
    setOpenTables(newOpenTables);
  };

  // Navigate to table view with enhanced localStorage management
  const handleTableClick = (table: string) => {
    if (typeof window !== "undefined") {
      // Set the new table name
      localStorage.setItem("current_active_table", table);
      
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent("tableChanged", { detail: table }));
      
      // Dispatch storage event manually for same-tab detection
      window.dispatchEvent(new StorageEvent("storage", {
        key: "current_active_table",
        newValue: table,
        oldValue: localStorage.getItem("current_active_table"),
        storageArea: localStorage,
        url: window.location.href
      }));
    }
    
    router.push("/table");
  };

  const getColumnIcon = (column: Column) => {
    if (column.name.toLowerCase().includes('id') || column.name.toLowerCase().includes('key')) {
      return <Key className="h-3 w-3 text-yellow-500" />;
    }
    if (column.type.includes('int') || column.type.includes('numeric')) {
      return <Hash className="h-3 w-3 text-blue-500" />;
    }
    return <Columns className="h-3 w-3 text-gray-500" />;
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
          <Database className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Database Schema</h3>
          {Object.keys(schema).length > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              {Object.keys(schema).length}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-muted-foreground">Loading schema...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-destructive">{error}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect to a database to view schema
              </p>
            </div>
          ) : Object.keys(schema).length === 0 ? (
            <div className="text-center py-8">
              <Table className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No tables found</p>
              <p className="text-xs text-muted-foreground mt-1">
                This database appears to be empty
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(schema).map(([table, tableSchema]) => (
                <div
                  key={table}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:bg-muted/30 transition-all duration-200"
                >
                  {/* Table Header */}
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer"
                    onClick={() => handleTableClick(table)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Table className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-medium text-foreground truncate">
                        {table}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {tableSchema.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tableSchema.columns.length} cols
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleTableToggle(e, table)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      title={openTables.has(table) ? "Collapse columns" : "Expand columns"}
                    >
                      {openTables.has(table) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {/* Table Columns (Expandable) */}
                  {openTables.has(table) && (
                    <div className="border-t border-border bg-muted/20">
                      <div className="p-3 space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Columns ({tableSchema.columns.length})
                        </h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {tableSchema.columns
                            .sort((a, b) => a.position - b.position)
                            .map((col) => (
                              <div
                                key={col.name}
                                className="flex items-center gap-2 p-2 rounded bg-background/50 hover:bg-background transition-colors"
                              >
                                {getColumnIcon(col)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground truncate">
                                      {col.name}
                                    </span>
                                    {!col.nullable && (
                                      <span className="text-xs text-red-500 font-medium">
                                        NOT NULL
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {col.type}
                                    </span>
                                    {col.default && (
                                      <span className="text-xs text-blue-600 dark:text-blue-400">
                                        default: {col.default}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}