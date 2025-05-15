import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaBars } from "react-icons/fa";
import { useState, useEffect } from "react";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { User } from "@/types/api";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI.verifyToken();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      } catch {
        console.error("Failed to fetch user data");
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await authAPI.logout();
      router.push("/auth/signin");
    } catch {
      console.error("Error signing out");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-gray-900/50 backdrop-blur supports-[backdrop-filter]:bg-gray-900/50">
      <div className="container flex h-14 items-center">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 mr-6"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="text-xl font-bold text-white">X</span>
          <span className="hidden md:inline-block text-white">Xequtive</span>
        </Link>

        <div className="flex-1 flex items-center justify-between">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {/* Navigation items */}
          </nav>

          {/* Desktop view */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <FaBars className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800/50">
          <div className="container py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-400">{user?.email}</span>
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white justify-start"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
