import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { Input } from "../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { LoadingSpinner } from "../components/LoadingSpinner";
import api from "../utils/axiosInstance";

// Helper to dynamically generate columns from fields
function generateColumnsFromFields(fields) {
  if (!fields || fields.length === 0) return [];
  return [
    ...fields.map((field) => ({
      accessorKey: field.name,
      header: field.name.charAt(0).toUpperCase() + field.name.slice(1),
      cell: ({ row }) => {
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
      cell: ({ row }) => (
        <button
          type="button"
          className="h-8 w-8 p-0 flex items-center justify-center text-gray-500 hover:text-blue-600 cursor-pointer"
          title="Copy row"
          aria-label="Copy row"
          onClick={() =>
            navigator.clipboard.writeText(JSON.stringify(row.original, null, 2))
          }
        >
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
  const navigate = useNavigate();
  const [tableName, setTableName] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const [result, setResult] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Table state
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const LIMIT = 50;
  const [offset, setOffset] = useState(0);

  const tableContainerRef = useRef(null);

  // Initialize table name from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("current_active_table");
    setTableName(stored || "");
    setIsInitialized(true);
  }, []);

  // Listen for localStorage changes to current_active_table
  useEffect(() => {
    if (!isInitialized) return;

    const handleStorageChange = (e) => {
      if (e.key === "current_active_table") {
        const newTableName = e.newValue || "";
        console.log(`Table changed from ${tableName} to ${newTableName}`);
        setTableName(newTableName);
        // Reset table state when table changes
        setResult([]);
        setFields([]);
        setOffset(0);
        setSorting([]);
        setColumnFilters([]);
        setColumnVisibility({});
        setRowSelection({});
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events for same-tab updates
    const handleCustomTableChange = (event) => {
      const newTableName = event.detail || "";
      console.log(`Table changed via custom event from ${tableName} to ${newTableName}`);
      if (newTableName !== tableName) {
        setTableName(newTableName);
        // Reset table state when table changes
        setResult([]);
        setFields([]);
        setOffset(0);
        setSorting([]);
        setColumnFilters([]);
        setColumnVisibility({});
        setRowSelection({});
      }
    };

    window.addEventListener("tableChanged", handleCustomTableChange);

    // Periodic check for localStorage changes (fallback for same-tab updates)
    const intervalId = setInterval(() => {
      const currentTableName = localStorage.getItem("current_active_table") || "";
      if (currentTableName !== tableName) {
        console.log(`Table changed via polling from ${tableName} to ${currentTableName}`);
        setTableName(currentTableName);
        // Reset table state when table changes
        setResult([]);
        setFields([]);
        setOffset(0);
        setSorting([]);
        setColumnFilters([]);
        setColumnVisibility({});
        setRowSelection({});
      }
    }, 1000); // Check every second

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tableChanged", handleCustomTableChange);
      clearInterval(intervalId);
    };
  }, [tableName, isInitialized]);

  // Fetch data with limit/offset
  const fetchTableData = useCallback(
    async (append = false) => {
      if (!tableName) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const connectionId = localStorage.getItem("current_conn_id");

      if (!connectionId) {
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
      } catch (error) {
        console.error("Failed to fetch table data:", error);
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
    if (isInitialized && tableName) {
      setOffset(0);
      fetchTableData(false);
    }
  }, [tableName, isInitialized, fetchTableData]);

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
    localStorage.removeItem("current_active_table");
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("tableChanged", { detail: "" }));
    navigate("/query");
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="layout-container">
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-muted-foreground">Initializing...</span>
        </div>
      </div>
    );
  }

  // Show message if no table is selected
  if (!tableName) {
    return (
      <div className="layout-container">
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
              <h1 className="text-2xl font-bold text-foreground">
                No Table Selected
              </h1>
              <p className="text-sm text-muted-foreground">
                Please select a table from the database schema to view its data
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                (table.getColumn("email")?.getFilterValue()) ?? ""
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