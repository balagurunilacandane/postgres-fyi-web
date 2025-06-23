"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
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
    <aside
      className="p-4"
      style={{
        background: "#fff",
        height: "100%",
        borderRight: "1px solid #e5e5e5",
      }}
    >
      <header
        className="mb-6 pb-4 border-b"
        style={{
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <h4 className="scroll-m-20 text-center text-balance flex items-center gap-2 justify-center text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          {/* <span role="img" aria-label="elephant">
            🐘
          </span> */}
          <span className="truncate max-w-full">postgresql.fyi</span>
        </h4>
      </header>
      <section>
        <Button
          className="w-full mt-2 bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
          onClick={handleConnect}
        >
          {/* SVG plus icon with white color */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: "white" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New connection
        </Button>
        {isConnectionsPage ? (
          <>
            <div className="mt-6">
              <SavedConnectionsList />
            </div>
            <div className="mt-6">
              <RecentConnectionsList />
            </div>
          </>
        ) : (
          <div className="mt-6">
            <SchemaList />
          </div>
        )}
      </section>
    </aside>
  );
}