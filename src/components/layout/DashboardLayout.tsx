import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Xequtive Admin</h1>
          {user && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          )}
        </div>
        <nav className="mt-6">
          <Link
            href="/dashboard/bookings"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Bookings
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Analytics
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
