"use client";

import React, { useEffect, useState } from "react";
import api from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";

// Modern skeleton loader component
function SchemaListSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="h-6 bg-muted rounded w-20 animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted/70 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

export default function SchemaList() {
  const [schema, setSchema] = useState<SchemaResponse>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openTable, setOpenTable] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSchemas = async () => {
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
        setError("Failed to load schemas.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchemas();
  }, []);

  // Arrow click: show/hide columns, Table name click: redirect
  const handleArrowClick = (e: React.MouseEvent, table: string) => {
    e.stopPropagation();
    setOpenTable((prev) => (prev === table ? null : table));
  };

  const handleTableClick = (table: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("current_active_table", table);
    }
    router.push("/table");
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Tables</h2>
      {loading ? (
        <SchemaListSkeleton />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <ul className="pl-0">
          {Object.keys(schema).length === 0 ? (
            <li className="text-gray-400">No tables found.</li>
          ) : (
            Object.entries(schema).map(([table, tableSchema]) => (
              <li key={table} className="mb-2">
                <div
                  className="w-full text-left font-medium flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 transition cursor-pointer"
                  aria-expanded={openTable === table}
                  aria-controls={`schema-table-${table}`}
                  onClick={() => handleTableClick(table)}
                >
                  <span
                    onClick={(e) => handleArrowClick(e, table)}
                    className="flex items-center"
                  >
                    {openTable === table ? (
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          d="M6 15l6-6 6 6"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          d="M6 9l6 6 6-6"
                        />
                      </svg>
                    )}
                  </span>
                  <span>{table}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {tableSchema.type}
                  </span>
                </div>
                {/* Show columns and types if openTable === table */}
                {openTable === table && (
                  <div className="ml-6 mt-1">
                    <table className="text-xs w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left pr-2 py-1 font-semibold">
                            Column
                          </th>
                          <th className="text-left pr-2 py-1 font-semibold">
                            Type
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableSchema.columns.map((col) => (
                          <tr key={col.name}>
                            <td className="pr-2 py-1">{col.name}</td>
                            <td className="pr-2 py-1 text-gray-500">
                              {col.type}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}