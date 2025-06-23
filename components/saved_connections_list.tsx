"use client";

import { useState, useEffect } from "react";
import api from "@/utils/axiosInstance";
type Connection = {
  password: string;
  username: string;
  port: string | number;
  host: string;
  id: string;
  name: string;
  color: string; // hex code
  database: string;
};
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LOCAL_STORAGE_KEY = "savedConnections";

function SavedConnectionsSkeleton() {
  return (
    <ul className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center justify-between bg-muted rounded-md px-4 py-2"
        >
          <span className="h-4 w-32 bg-gray-200 rounded block" />
        </li>
      ))}
    </ul>
  );
}

export default function SavedConnectionsList() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [asc, setAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const stored =
        typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
      if (stored) {
        try {
          setConnections(JSON.parse(stored));
        } catch {
          setConnections([]);
        }
      }
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const handleSort = () => {
    const sorted = [...connections].sort((a, b) =>
      asc
        ? a.color.localeCompare(b.color)
        : b.color.localeCompare(a.color)
    );
    setConnections(sorted);
    setAsc(!asc);
  };

  // Open modal and set which connection to delete
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowModal(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const updated = connections.filter(conn => conn.id !== deleteId);
    setConnections(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
    setShowModal(false);
    setDeleteId(null);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowModal(false);
    setDeleteId(null);
  };

  // Move useRouter inside the component and pass router to the handler
  async function handleSaveConnection(id: string) {
    if (typeof window !== "undefined") {
      const connection_details = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (connection_details) {
        try {
          let connections: Connection[] = JSON.parse(connection_details);
          const connection = connections.find(conn => conn.id === id);
          if (connection) {
            // Generate a new id for this connection
            const newId = uuidv4();
            // Call the /connect API
            await api.post("/connect", {
              id: newId,
              host: connection.host,
              port: connection.port,
              database: connection.database,
              username: connection.username,
              password: connection.password,
            });

            // Replace the saved connection's id with the new id
            connections = connections.map(conn =>
              conn.id === id ? { ...conn, id: newId } : conn
            );
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(connections));
            // Update current_conn_id with the new id
            localStorage.setItem("current_conn_id", newId);

            // Update state so UI reflects the new id
            setConnections(connections);

            // Navigate to the query page
            router.push("/query");
          }
        } catch (error) {
          console.error("Failed to parse saved connections:", error);
        }
      }
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-500">Saved Connections</h2>
        <button
          type="button"
          onClick={handleSort}
          className="p-1 rounded hover:bg-gray-100 transition"
          title="Sort by color"
        >
          {/* Modern sort icon (vertical arrows) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l-4-4m4 4l4-4"
            />
          </svg>
        </button>
      </div>
      {loading ? (
        <SavedConnectionsSkeleton />
      ) : connections.length > 0 ? (
        <ul
          className="space-y-3"
          style={
            connections.length > 7
              ? {
                  maxHeight: "20rem",
                  overflowY: "auto",
                  paddingRight: "0.25rem",
                }
              : undefined
          }
        >
          {connections.map((conn) => (
            <li
              key={conn.id + conn.name}
              className="flex flex-col sm:flex-row sm:items-center bg-muted rounded-md px-4 py-2 group cursor-pointer hover:bg-gray-100 transition"
              style={
                conn.color
                  ? {
                      borderLeft: `6px solid ${conn.color}`,
                      borderRadius: "0.375rem",
                    }
                  : { borderRadius: "0.375rem" }
              }
              onClick={() => handleSaveConnection(conn.id)}
            >
              <div className="flex-1">
                <span className="font-medium">{conn.name}</span>
                <span className="text-xs text-gray-500 mt-0.5 block">{conn.database}</span>
              </div>
              <button
                className="ml-auto mt-2 sm:mt-0 text-red-500 hover:text-red-700 transition"
                title="Delete connection"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(conn.id);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <Image
            src="/no_saved_connection.svg"
            alt="No connections"
            width={96}
            height={96}
            className="mb-4 opacity-70"
          />
          <span className="text-gray-400 text-sm">No saved connections found</span>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h3 className="text-lg font-semibold mb-2">Delete Connection</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this connection?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={handleCancelDelete}
              >
                No
              </button>
              <button
                className="px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={handleConfirmDelete}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}