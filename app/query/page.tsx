"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { ChevronDown } from "lucide-react";
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
        // Render objects as JSON string for display
        if (typeof value === "object" && value !== null) {
          return (
            <pre className="whitespace-pre-wrap break-all text-xs">
              {JSON.stringify(value, null, 2)}
            </pre>
          );
        }
        return <div>{value !== undefined ? String(value) : ""}</div>;
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

export default function QueryPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<TableRow[]>([]);
  const [fields, setFields] = useState<TableField[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const LIMIT = 50;
  const [offset, setOffset] = useState(0);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll fetch
  const fetchQueryData = useCallback(
    async (append = false) => {
      const connectionId =
        typeof window !== "undefined"
          ? localStorage.getItem("current_conn_id")
          : null;

      if (!connectionId || !query) return;

      setLoading(true);
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
    [query, offset]
  );

  // Run query (reset offset)
  const handleRunQuery = async () => {
    setOffset(0);
    await fetchQueryData(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

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

  return (
    <div className="h-screen w-full overflow-auto">
      {/* Desktop: Resizable vertical panels */}
      <div className="hidden md:block h-full w-full">
        <ResizablePanelGroup
          direction="vertical"
          className="min-h-[200px] h-screen w-full rounded-lg border"
        >
          <ResizablePanel defaultSize={30} minSize={15} maxSize={70}>
            <div className="h-full flex flex-col p-4 md:p-6">
              <h1 className="text-xl font-bold mb-2">Query Editor</h1>
              <Textarea
                className="flex-1 mb-4 resize-none"
                placeholder="Write your SQL query here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={6}
              />
              <div>
                <Button onClick={handleRunQuery} disabled={loading}>
                  {loading ? "Running..." : "Run Query"}
                </Button>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={70} minSize={30} maxSize={85}>
            <div className="h-full p-4 md:p-6 flex flex-col">
              <h2 className="text-lg font-semibold mb-2">Result</h2>
              {result.length > 0 ? (
                <div className="w-full flex-1 flex flex-col">
                  <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
                    {table.getColumn("email") && (
                      <Input
                        placeholder="Filter emails..."
                        value={
                          (table.getColumn("email")?.getFilterValue() as string) ??
                          ""
                        }
                        onChange={(event) =>
                          table.getColumn("email")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                      />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                          Columns <ChevronDown />
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
                  <div
                    ref={tableContainerRef}
                    className="rounded-md border flex-1 overflow-auto max-h-[60vh]"
                  >
                    <Table>
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
                              className="h-16"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="p-2 align-top">
                                  <div className="max-h-32 overflow-auto">
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </div>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center"
                            >
                              No results.
                            </TableCell>
                          </TableRow>
                        )}
                        {loading && result.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={columns.length} className="text-center">
                              Loading more...
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">No results to display.</div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      {/* Mobile: stacked layout */}
      <div className="flex flex-col md:hidden h-full w-full overflow-auto">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-2">Query Editor</h1>
          <Textarea
            className="mb-4 resize-none"
            placeholder="Write your SQL query here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
          />
          <Button onClick={handleRunQuery} disabled={loading} className="w-full">
            {loading ? "Running..." : "Run Query"}
          </Button>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <h2 className="text-lg font-semibold mb-2">Result</h2>
          {result.length > 0 ? (
            <div className="w-full">
              <div className="flex flex-col gap-2 py-2">
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
                    <Button variant="outline" className="w-full">
                      Columns <ChevronDown />
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
              <div
                ref={tableContainerRef}
                className="rounded-md border overflow-auto max-h-[50vh]"
              >
                <Table>
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
                          className="h-16"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="p-2 align-top">
                              <div className="max-h-32 overflow-auto">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                    {loading && result.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="text-center">
                          Loading more...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">No results to display.</div>
          )}
        </div>
      </div>
    </div>
  );
}