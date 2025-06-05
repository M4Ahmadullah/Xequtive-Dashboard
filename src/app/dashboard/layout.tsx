"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { FaBars } from "react-icons/fa";

interface AuthCheckProps {
  children: React.ReactNode;
}

function AuthCheck({ children }: AuthCheckProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthentication() {
      try {
        // Use the check-admin endpoint instead of localStorage
        const response = await fetch("/api/dashboard/auth/check-admin", {
          credentials: "include", // Important for cookies
        });

        if (!response.ok) {
          // If response is not OK, redirect to sign in page
          router.push("/auth/signin");
          return;
        }

        const data = await response.json();

        // Verify both successful response and admin role
        if (data.success && data.data.role === "admin") {
          // Store user info in localStorage for UI display only
          localStorage.setItem("userInfo", JSON.stringify(data.data));
          setLoading(false);
        } else {
          // If user is not an admin, redirect to sign in
          localStorage.removeItem("userInfo");
          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        localStorage.removeItem("userInfo");
        router.push("/auth/signin");
      }
    }

    checkAuthentication();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-close sidebar on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <AuthCheck>
        <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
          {/* Mobile sidebar toggle button */}
          <div className="md:hidden fixed top-4 left-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="bg-gray-800/80 border border-gray-700 hover:bg-gray-700 transition-colors backdrop-blur-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars className="h-5 w-5" />
            </Button>
          </div>

          {/* Sidebar - hidden on mobile unless toggled */}
          <div
            className={`
            ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"} 
            fixed md:relative md:translate-x-0 z-40 transition-transform duration-300 ease-in-out h-full
            md:shadow-xl
          `}
          >
            <Sidebar />
          </div>

          {/* Overlay to close sidebar on mobile */}
          {sidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-60 z-30 backdrop-blur-sm transition-all duration-300"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-950 to-gray-900 p-4 md:p-6">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </AuthCheck>
    </>
  );
}
