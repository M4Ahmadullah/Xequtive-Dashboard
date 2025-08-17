import { Button } from "@/components/ui/button";
import { FaBars, FaUserCircle, FaBell } from "react-icons/fa";
import { useState, useEffect } from "react";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { User } from "@/types/api";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Fetch user data from backend
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        // Check authentication with backend
        const response = await authAPI.checkAdminStatus();
        
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // Authentication failed, redirect to login
          localStorage.removeItem("userInfo");
          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Error getting user info:", error);
        localStorage.removeItem("userInfo");
        router.push("/auth/signin");
      }
    };

    getUserInfo();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      router.push("/auth/signin");
    } catch {
      console.error("Error signing out");
      // Still clear local state and redirect
      setUser(null);
      localStorage.removeItem("userInfo");
      router.push("/auth/signin");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-900 h-16">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side - Mobile menu toggle */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <FaBars className="h-5 w-5" />
          </Button>
        </div>

        {/* Page title - can be dynamic */}
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        </div>

        {/* Right side - user profile */}
        <div className="flex items-center gap-4">
          {/* Notification icon */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <FaBell className="h-5 w-5" />
          </Button>

          {/* User dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FaUserCircle className="h-6 w-6" />
              <span className="hidden md:inline-block">
                {user?.displayName || user?.email || "User"}
              </span>
            </Button>

            {/* Dropdown menu */}
            {mobileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
                  Signed in as
                  <br />
                  <span className="font-medium text-white">{user?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
