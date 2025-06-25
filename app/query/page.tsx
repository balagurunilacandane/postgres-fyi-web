"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDown, Copy, Download, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResizableSqlEditor } from "@/components/resizable-sql-editor";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/axiosInstance";

// Types for table fields and rows
type TableField = { name: string };
type TableRow = Record<string, unknown>;

// Helper to dynamically generate columns from fields
function generateColumnsFromFields(fields: TableField[]): ColumnDef<TableRow>[] {
  if (!fields || fields.length === 0) return [];
  return [
    ...fields.map((field) => ({
      accessorKey: field.name,
      header: field.name.charAt(0).toUpperCase() + field.name.slice(1),
      cell: ({ row }: { row: { original: TableRow } }) => {
        const value = row.original[field.name];
        if (typeof value === "object" && value !== null) {
          return (
            <pre className="table-cell-json">
              {JSON.stringify(value, null, 2)}
            </pre>
          );
        }
        return (
          <div className="table-cell-content" title={String(value || "")}>
            {value !== undefined ? String(value) : ""}
          </div>
        );
      },
    })),
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }: { row: { original: TableRow } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(JSON.stringify(row.original, null, 2))
              }
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Row
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const csv = Object.values(row.original).join(",");
                navigator.clipboard.writeText(csv);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

interface QueryPageProps {
  onQuerySaved?: () => void;
  onLoadQuery?: (query: string) => void;
}

export default function QueryPage({ onQuerySaved }: QueryPageProps) {
  const [query, setQuery] = useState("SELECT * FROM information_schema.tables LIMIT 10;");
  const [result, setResult] = useState<TableRow[]>([]);
  const [fields, setFields] = useState<TableField[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const LIMIT = 50;
  const [offset, setOffset] = useState(0);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Listen for load query events from sidebar
  useEffect(() => {
    const handleLoadQuery = (event: CustomEvent) => {
      setQuery(event.detail);
    };

    window.addEventListener('loadQuery', handleLoadQuery as EventListener);
    return () => {
      window.removeEventListener('loadQuery', handleLoadQuery as EventListener);
    };
  }, []);

  // Infinite scroll fetch
  const fetchQueryData = useCallback(
    async (append = false) => {
      const connectionId =
        typeof window !== "undefined"
          ? localStorage.getItem("current_conn_id")
          : null;

      if (!connectionId || !query.trim()) return;

      setLoading(true);
      setError("");
      try {
        const pagedQuery = `${query.trim().replace(/;*$/, "")} LIMIT ${LIMIT} OFFSET ${append ? offset : 0}`;
        const response = await api.post("/query", {
          connectionId,
          sql: pagedQuery,
        });
        const apiData = response.data.data;
        if (append) {
          setResult((prev) => [...prev, ...(apiData.rows || [])]);
        } else {
          setResult(apiData.rows || []);
        }
        setFields(apiData.fields || []);
        setHasMore((apiData.rows?.length || 0) === LIMIT);
      } catch (err) {
        const errorMessage = 
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "data" in err.response &&
          err.response.data &&
          typeof err.response.data === "object" &&
          "message" in err.response.data
            ? (err.response.data as { message?: string }).message
            : "Failed to execute query";
        
        setError(errorMessage || "Failed to execute query");
        if (!append) {
          setResult([]);
          setFields([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [query, offset]
  );

  // Run query (reset offset)
  const handleRunQuery = async () => {
    setOffset(0);
    setGlobalFilter("");
    await fetchQueryData(false);
  };

  // Handle save success to refresh sidebar
  const handleSaveSuccess = () => {
    onQuerySaved?.();
  };

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const container = tableContainerRef.current;
      if (
        container &&
        hasMore &&
        !loading &&
        container.scrollTop + container.clientHeight >= container.scrollHeight - 50
      ) {
        setOffset((prev) => prev + LIMIT);
      }
    };

    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [hasMore, loading]);

  // Fetch more data when offset increases
  useEffect(() => {
    if (offset === 0) return;
    fetchQueryData(true);
  }, [offset, fetchQueryData]);

  const columns = generateColumnsFromFields(fields);

  const table = useReactTable({
    data: result,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const exportToCSV = () => {
    if (result.length === 0) {
      toast({
        title: "Warning",
        description: "No data to export",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const headers = fields.map(field => field.name).join(",");
      const rows = result.map(row => 
        fields.map(field => {
          const value = row[field.name];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        }).join(",")
      ).join("\n");
      
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `query-results-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Data exported to CSV successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="layout-container">
      {/* Query Editor Panel - Fixed Height */}
      <div className="query-editor-panel">
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Query Editor</h1>
            <div className="flex items-center gap-2">
              {result.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResizableSqlEditor
              value={query}
              onChange={setQuery}
              onRun={handleRunQuery}
              loading={loading}
              onSaveSuccess={handleSaveSuccess}
            />
          </div>
        </div>
      </div>
      
      {/* Results Panel - Flexible Height with Fixed Table */}
      <div className="results-panel">
        <div className="h-full p-6 flex flex-col bg-background">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Results</h2>
            {result.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {result.length} row{result.length !== 1 ? "s" : ""}
                {hasMore && " (more available)"}
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result.length > 0 ? (
            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <Input
                  placeholder="Search all columns..."
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="max-w-sm"
                />
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Columns
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div
                ref={tableContainerRef}
                className="flex-1 overflow-auto border border-border rounded-lg min-h-0"
              >
                <Table className="data-table">
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No results found.
                        </TableCell>
                      </TableRow>
                    )}
                    {loading && result.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="text-center py-4">
                          <LoadingSpinner className="mx-auto" />
                          <span className="ml-2 text-muted-foreground">Loading more...</span>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground">Executing query...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">No results to display</p>
                <p className="text-sm text-muted-foreground">
                  Run a query to see results here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}