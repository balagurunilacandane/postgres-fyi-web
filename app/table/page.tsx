"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { ChevronDown, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
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
      header: "Action",
      cell: ({ row }: { row: { original: TableRow } }) => (
        <button
          type="button"
          className="h-8 w-8 p-0 flex items-center justify-center text-gray-500 hover:text-blue-600 cursor-pointer"
          title="Copy row"
          aria-label="Copy row"
          onClick={() =>
            navigator.clipboard.writeText(JSON.stringify(row.original, null, 2))
          }
        >
          {/* Copy SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          <span className="sr-only">Copy row</span>
        </button>
      ),
    },
  ];
}

export default function TablePage() {
  const router = useRouter();
  // Get table name from localStorage (client-side only)
  const [tableName, setTableName] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("current_active_table");
      setTableName(stored || "");
    }
  }, []);

  const [result, setResult] = useState<TableRow[]>([]);
  const [fields, setFields] = useState<TableField[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const LIMIT = 50;
  const [offset, setOffset] = useState(0);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Fetch data with limit/offset
  const fetchTableData = useCallback(
    async (append = false) => {
      setLoading(true);
      const connectionId =
        typeof window !== "undefined"
          ? localStorage.getItem("current_conn_id")
          : null;

      if (!connectionId || !tableName) {
        setLoading(false);
        return;
      }

      const query = `SELECT * FROM "${tableName}" LIMIT ${LIMIT} OFFSET ${append ? offset : 0}`;

      try {
        const response = await api.post("/query", {
          connectionId,
          sql: query,
        });
        const apiData = response.data.data;
        if (append) {
          setResult((prev) => [...prev, ...(apiData.rows || [])]);
        } else {
          setResult(apiData.rows || []);
        }
        setFields(apiData.fields || []);
        // If less than LIMIT rows returned, no more data
        setHasMore((apiData.rows?.length || 0) === LIMIT);
      } catch {
        if (!append) {
          setResult([]);
          setFields([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [tableName, offset]
  );

  // Initial load and when tableName changes
  useEffect(() => {
    setOffset(0);
    fetchTableData(false);
  }, [tableName, fetchTableData]);

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
    fetchTableData(true);
  }, [offset, fetchTableData]);

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // In your "Back to Query Page" button, clear the localStorage key before navigating
  const handleBackToQuery = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("current_active_table");
    }
    router.push("/query");
  };

  return (
    <div className="layout-container">
      {/* Table Header - Fixed */}
      <div className="table-page-header">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={handleBackToQuery}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Query Page
          </Button>
          <div>
            <h1 className="text-2xl font-bold capitalize text-foreground">
              {tableName} Table
            </h1>
            <p className="text-sm text-muted-foreground">
              {result.length} row{result.length !== 1 ? "s" : ""} loaded
              {hasMore && " (more available)"}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {table.getColumn("email") && (
            <Input
              placeholder="Filter emails..."
              value={
                (table.getColumn("email")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Columns <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
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
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Table Content - Scrollable */}
      <div className="table-page-content">
        <div
          ref={tableContainerRef}
          className="h-full overflow-auto border border-border rounded-lg"
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
              {loading && result.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24">
                    <LoadingSpinner className="mx-auto" />
                    <span className="ml-2 text-muted-foreground">Loading...</span>
                  </TableCell>
                </TableRow>
              ) : result.length > 0 ? (
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
                    No results.
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
    </div>
  );
}