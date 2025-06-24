"use client";

import { useState, useEffect } from "react";
import api from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Database,
  Trash2,
  Plus,
  Sparkles,
} from "lucide-react";
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
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";

type Connection = {
  password: string;
  username: string;
  port: string | number;
  host: string;
  id: string;
  name: string;
  color: string;
  database: string;
};

import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

const LOCAL_STORAGE_KEY = "savedConnections";

function SavedConnectionsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between bg-muted rounded-md px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-muted-foreground/30 rounded" />
            <div className="space-y-1">
              <div className="h-4 w-24 bg-muted-foreground/30 rounded" />
              <div className="h-3 w-16 bg-muted-foreground/20 rounded" />
            </div>
          </div>
          <div className="h-4 w-4 bg-muted-foreground/30 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyConnectionsState({ onNewConnection }: { onNewConnection: () => void }) {
  return (
    <div className="text-center py-8 px-4">
      <div className="relative mb-4">
        <Database className="h-16 w-16 text-muted-foreground/40 mx-auto" />
        <Sparkles className="h-6 w-6 text-primary/60 absolute -top-1 -right-1 animate-pulse" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No saved connections yet
      </h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        Create your first database connection to get started with querying and managing your data.
      </p>
      <Button
        onClick={onNewConnection}
        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground btn-hover-lift"
        size="sm"
      >
        <Plus className="h-4 w-4" />
        Create Connection
      </Button>
    </div>
  );
}

export default function SavedConnectionsList() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Persist section state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("saved-connections-section-open");
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState));
    }
  }, []);

  const handleToggleSection = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("saved-connections-section-open", JSON.stringify(newState));
  };

  const loadConnections = () => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
    if (stored) {
      try {
        setConnections(JSON.parse(stored));
      } catch {
        setConnections([]);
      }
    } else {
      setConnections([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      loadConnections();
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const handleNewConnection = () => {
    router.push("/connections");
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const updated = connections.filter(conn => conn.id !== deleteId);
    setConnections(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
    setDeleteId(null);
    toast({
      title: "Success",
      description: "Connection deleted successfully",
    });
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
  };

  async function handleSaveConnection(id: string) {
    if (typeof window !== "undefined") {
      const connection_details = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (connection_details) {
        try {
          let connections: Connection[] = JSON.parse(connection_details);
          const connection = connections.find(conn => conn.id === id);
          if (connection) {
            const newId = uuidv4();
            await api.post("/connect", {
              id: newId,
              host: connection.host,
              port: connection.port,
              database: connection.database,
              username: connection.username,
              password: connection.password,
            });

            connections = connections.map(conn =>
              conn.id === id ? { ...conn, id: newId } : conn
            );
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(connections));
            localStorage.setItem("current_conn_id", newId);

            setConnections(connections);
            router.push("/query");
          }
        } catch (error) {
          console.error("Failed to connect:", error);
          toast({
            title: "Error",
            description: "Failed to connect to database",
            variant: "destructive",
          });
        }
      }
    }
  }

  return (
    <div className="group">
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
          <h3 className="font-semibold text-foreground">Saved Connections</h3>
          {connections.length > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              {connections.length}
            </span>
          )}
        </div>
        {connections.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleNewConnection();
            }}
            className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          {loading ? (
            <SavedConnectionsSkeleton />
          ) : connections.length === 0 ? (
            <EmptyConnectionsState onNewConnection={handleNewConnection} />
          ) : (
            <div className="space-y-2">
              {connections.map((conn) => (
                <div
                  key={conn.id + conn.name}
                  className="group bg-card border border-border rounded-lg p-3 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                  style={{
                    borderLeft: `4px solid ${conn.color}`,
                  }}
                  onClick={() => handleSaveConnection(conn.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {conn.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conn.host}:{conn.port}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conn.database}
                      </p>
                    </div>
                    <AlertDialog open={deleteId === conn.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(conn.id);
                          }}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          title="Delete connection"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Connection</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{conn.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={handleCancelDelete}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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