import type { Metadata } from "next";
import "./globals.css";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Sidebar from "@/components/sidebar";
import api from "@/utils/axiosInstance";

export const metadata: Metadata = {
  title: "Postgresql FYI",
  description: "A web application for PostgreSQL enthusiasts",
};

// Server component for HealthBadge
async function HealthBadge() {
  let running: boolean | null = null;
  try {
    const data = await api.get("/health");
    if (data.data.success) {
      running = true;
    }
  } catch {
    running = false;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow bg-white border border-gray-200">
      <span
        className={`inline-block w-3 h-3 rounded-full ${
          running === null
            ? "bg-gray-400"
            : running
            ? "bg-green-500"
            : "bg-red-500"
        }`}
        title={running === null ? "Checking..." : running ? "Running" : "Not running"}
      />
      <span
        className={`text-sm font-semibold ${
          running === null
            ? "text-gray-500"
            : running
            ? "text-green-700"
            : "text-red-700"
        }`}
      >
        {running === null ? "Checking..." : running ? "Running" : "Not running"}
      </span>
    </div>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Removed meta refresh to prevent page reload */}
      </head>
      <body className="antialiased">
        <div className="h-screen w-screen relative">
          {/* Health badge in top right */}
          <div className="absolute top-4 right-4 z-50">
            <HealthBadge />
          </div>
          {/* Desktop: Resizable sidebar, mobile: stacked layout */}
          <div className="hidden md:flex h-full w-full">
            <ResizablePanelGroup direction="horizontal" style={{ height: "100vh", width: "100vw" }}>
              <ResizablePanel defaultSize={22} minSize={12} maxSize={40}>
                <Sidebar />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={78} minSize={60}>
                <main style={{ height: "100%", overflow: "auto" }}>
                  {children}
                </main>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          {/* Mobile: Sidebar on top, content below */}
          <div className="flex flex-col md:hidden h-full w-full">
            <div className="w-full border-b">
              <Sidebar />
            </div>
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
