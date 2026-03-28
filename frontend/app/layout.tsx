"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { OSConceptSidebar } from "@/components/layout/OSConceptSidebar";
import { getToken, getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import "./globals.css";

const AUTH_PAGES = ["/login", "/register"];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [osPanelOpen, setOsPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAuthPage = AUTH_PAGES.includes(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth guard: redirect to login if not authenticated and not on auth page
  useEffect(() => {
    if (!mounted) return;
    const token = getToken();
    if (!token && !isAuthPage) {
      router.replace("/login");
    }
    if (token && isAuthPage) {
      router.replace("/dashboard");
    }
  }, [mounted, pathname, isAuthPage, router]);

  const user = mounted ? getUser() : null;

  // Don't render anything until client is mounted to avoid hydration errors
  const showApp = mounted && !isAuthPage;

  return (
    <html lang="en" className="dark">
      <head>
        <title>CUIScheduler — Intelligent Campus Resource Scheduling</title>
        <meta
          name="description"
          content="CUIScheduler: Intelligent Campus Resource Scheduling System for COMSATS University Islamabad, Wah Campus."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-primary text-text-primary font-sans antialiased">
        {!mounted ? (
          // Loading state while client mounts
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-text-tertiary text-sm font-mono">Loading CUIScheduler...</div>
          </div>
        ) : isAuthPage ? (
          // Auth pages: no sidebar, no topbar — full screen
          <>
            {children}
          </>
        ) : (
          // App pages: sidebar + topbar + content
          <>
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <TopBar
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              onToggleOSPanel={() => setOsPanelOpen(!osPanelOpen)}
              sidebarCollapsed={sidebarCollapsed}
              unreadCount={3}
              userName={user?.name || "User"}
              userEmail={user?.email || ""}
              userRole={user?.role || "student"}
            />
            <main
              className={cn(
                "pt-16 min-h-screen transition-all duration-300",
                sidebarCollapsed ? "ml-[68px]" : "ml-[280px]",
                osPanelOpen ? "mr-[320px]" : "mr-0"
              )}
            >
              <div className="p-6">{children}</div>
            </main>
            <OSConceptSidebar
              open={osPanelOpen}
              onClose={() => setOsPanelOpen(false)}
              concepts={[]}
            />
          </>
        )}

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#161b27",
              color: "#f0f4ff",
              border: "1px solid #2a3347",
              borderRadius: "12px",
              fontSize: "13px",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#0a2e17" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#2d0a0a" },
            },
          }}
        />
      </body>
    </html>
  );
}
