"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
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
  const [mounted, setMounted] = useState(false);

  const isAuthPage = AUTH_PAGES.includes(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <html lang="en" className="light">
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-primary text-text-primary font-sans antialiased">
        {!mounted ? (
          <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="animate-pulse text-text-tertiary text-sm font-mono">
              Loading CUIScheduler...
            </div>
          </div>
        ) : isAuthPage ? (
          <>{children}</>
        ) : (
          <>
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <TopBar
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              sidebarCollapsed={sidebarCollapsed}
              userName={user?.name || "User"}
              userRole={user?.role || "student"}
            />
            <main
              className={cn(
                "pt-16 min-h-screen transition-all duration-300",
                sidebarCollapsed ? "ml-[68px]" : "ml-[220px]"
              )}
            >
              <div className="p-8">{children}</div>
            </main>
          </>
        )}

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#1a1c1c",
              border: "1px solid #e2e2e2",
              borderRadius: "12px",
              fontSize: "13px",
              fontFamily: "'Inter', system-ui, sans-serif",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            },
            success: {
              iconTheme: { primary: "#16a34a", secondary: "#dcfce7" },
            },
            error: {
              iconTheme: { primary: "#ba1a1a", secondary: "#ffdad6" },
            },
          }}
        />
      </body>
    </html>
  );
}
