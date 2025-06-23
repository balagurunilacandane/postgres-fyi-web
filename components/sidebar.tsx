"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Database, Plus } from "lucide-react";
import SavedConnectionsList from "@/components/saved_connections_list";
import RecentConnectionsList from "@/components/recent_connections_list";
import SchemaList from "@/components/schema_list";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleConnect = () => {
    router.push("/connections");
  };

  const isConnectionsPage = pathname === "/connections";

  return (
    <aside className="h-full bg-card border-r border-border flex flex-col">
      <header className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PostgreSQL</h1>
              <p className="text-sm text-muted-foreground">Database Manager</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 btn-hover-lift"
          onClick={handleConnect}
        >
          <Plus className="h-4 w-4" />
          New Connection
        </Button>
      </header>
      
      <div className="flex-1 overflow-auto">
        {isConnectionsPage ? (
          <div className="space-y-6">
            <SavedConnectionsList />
            <RecentConnectionsList />
          </div>
        ) : (
          <SchemaList />
        )}
      </div>
    </aside>
  );
}