"use client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth pages render without sidebar/topbar — just the children
  // The root layout wraps everything, but we hide sidebar/topbar via this layout
  return <>{children}</>;
}
