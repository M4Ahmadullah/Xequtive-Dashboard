"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

// Custom authentication check component
const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if there's a token in local storage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;

      if (!token) {
        router.push("/auth/signin");
        return;
      }

      try {
        // Verify the token with the API
        const response = await authAPI.verifyToken();

        if (response.success && response.data?.authenticated) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("adminToken");
          router.push("/auth/signin");
        }
      } catch {
        localStorage.removeItem("adminToken");
        router.push("/auth/signin");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch user information
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await authAPI.verifyToken();
        if (response.success && response.data?.user) {
          setUserEmail(response.data.user.email);
        }
      } catch {
        console.error("Error fetching user info");
      }
    };

    fetchUserInfo();
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "chart-pie" },
    { name: "Bookings", href: "/dashboard/bookings", icon: "calendar" },
    { name: "Users", href: "/dashboard/users", icon: "users" },
    { name: "Analytics", href: "/dashboard/analytics", icon: "chart-bar" },
    { name: "Settings", href: "/dashboard/settings", icon: "cog" },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      router.push("/auth/signin");
    } catch {
      console.error("Logout error");
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-indigo-700 transition-transform duration-300 lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <div className="text-xl font-bold text-white">Xequtive</div>
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1 text-indigo-200 hover:bg-indigo-800 hover:text-white lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="mt-5 px-2">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                        isActive
                          ? "bg-indigo-800 text-white"
                          : "text-indigo-100 hover:bg-indigo-600"
                      }`}
                    >
                      <i
                        className={`fas fa-${item.icon} mr-3 text-lg ${
                          isActive ? "text-white" : "text-indigo-300"
                        }`}
                      ></i>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="lg:pl-64">
          {/* Top Navigation */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="ml-auto flex items-center space-x-4">
              <div className="relative">
                <span className="text-sm font-medium text-gray-600">
                  {userEmail || "Loading..."}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </div>
      </div>
    </AuthCheck>
  );
}
