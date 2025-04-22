"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Auth pages (signin, signup)
      if (pathname?.startsWith("/auth/")) {
        if (user) {
          router.push("/dashboard/bookings");
        }
      }
      // Dashboard pages
      else if (pathname?.startsWith("/dashboard/")) {
        if (!user) {
          router.push("/auth/signin");
        }
      }
      // Root path
      else if (pathname === "/") {
        if (user) {
          router.push("/dashboard/bookings");
        } else {
          router.push("/auth/signin");
        }
      }
    }
  }, [user, loading, pathname, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return children;
}
