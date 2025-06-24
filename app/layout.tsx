import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { ConnectionStatusBadge } from "@/components/connection-status-badge";

export const metadata: Metadata = {
  title: "PostgreSQL FYI - Database Management Tool",
  description: "A modern web application for PostgreSQL database management and querying",
};

export default function RootLayout({
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
              {/* Connection Status Badge in top right */}
              <div className="absolute top-4 right-4 z-50">
                <ConnectionStatusBadge />
              </div>
              
              {/* Main content */}
              <main className="h-full w-full">
                {children}
              </main>
            </div>
            <Toaster />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}