import type { Metadata } from "next";
import "./globals.css";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ThemeProvider } from "@/providers/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import Sidebar from "@/components/sidebar";
import api from "@/utils/axiosInstance";

export const metadata: Metadata = {
  title: "PostgreSQL FYI - Database Management Tool",
  description: "A modern web application for PostgreSQL database management and querying",
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
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm bg-card border border-border backdrop-blur-sm">
      <span
        className={`inline-block w-3 h-3 rounded-full transition-colors ${
          running === null
            ? "bg-muted-foreground"
            : running
            ? "bg-green-500 animate-pulse"
            : "bg-destructive"
        }`}
        title={running === null ? "Checking..." : running ? "Connected" : "Disconnected"}
      />
      <span
        className={`text-sm font-medium transition-colors ${
          running === null
            ? "text-muted-foreground"
            : running
            ? "text-green-700 dark:text-green-400"
            : "text-destructive"
        }`}
      >
        {running === null ? "Checking..." : running ? "Connected" : "Disconnected"}
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <div className="h-screen w-screen relative bg-background">
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
                  <ResizableHandle className="w-1 bg-border hover:bg-border/80 transition-colors" />
                  <ResizablePanel defaultSize={78} minSize={60}>
                    <main style={{ height: "100%", overflow: "auto" }} className="bg-background">
                      {children}
                    </main>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
              {/* Mobile: Sidebar on top, content below */}
              <div className="flex flex-col md:hidden h-full w-full">
                <div className="w-full border-b border-border">
                  <Sidebar />
                </div>
                <main className="flex-1 overflow-auto bg-background">
                  {children}
                </main>
              </div>
            </div>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}