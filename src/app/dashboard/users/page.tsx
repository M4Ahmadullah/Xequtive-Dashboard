"use client";

import { useState, useEffect, useCallback } from "react";
import { usersAPI } from "@/lib/api";
import { User } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 20,
  });

  const fetchUsers = useCallback(
    async (params?: { page?: number; role?: string; query?: string }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await usersAPI.getAll({
          page: params?.page || pagination.currentPage,
          limit: pagination.limit,
          role: params?.role || role,
          query: params?.query || searchQuery,
        });

        if (response.success && response.data) {
          setUsers(response.data.users || []);
          const pagination = response.data.pagination;
          if (pagination) {
            setPagination((prev) => ({
              ...prev,
              total: pagination.total || 0,
              pages: pagination.pages || 0,
            }));
          }
        } else {
          setError(response.error?.message || "Failed to load users");
        }
      } catch {
        setError("An error occurred while fetching users");
      } finally {
        setLoading(false);
      }
    },
    [pagination.currentPage, pagination.limit, role, searchQuery]
  );

  useEffect(() => {
    fetchUsers({
      page: pagination?.currentPage,
      role: role || undefined,
      query: searchQuery || undefined,
    });
  }, [pagination?.currentPage, role, searchQuery, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers({ page: 1 });
  };

  const handleRoleFilter = (selectedRole: string | undefined) => {
    setRole(selectedRole);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 w-full max-w-3xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => fetchUsers()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">
            Manage and view all users. This dashboard allows you to search for
            users, filter by role, and view detailed user information.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <button
            onClick={() => handleRoleFilter(undefined)}
            className={`px-4 py-2 rounded-md ${
              role === undefined
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleRoleFilter("admin")}
            className={`px-4 py-2 rounded-md ${
              role === "admin"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => handleRoleFilter("user")}
            className={`px-4 py-2 rounded-md ${
              role === "user"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-10 h-10 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : users && users.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.uid} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {user.displayName || user.email}
                    </CardTitle>
                    <div
                      className={`px-3 py-1 rounded-full text-sm ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>

                    {user.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    )}

                    {user.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="font-medium">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-4">
                    <Link
                      href={`/dashboard/users/${user.uid}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      View Details
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-md ${
                      page === pagination.currentPage
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8">
          <p className="text-lg text-gray-600 mb-4">No users found</p>
        </div>
      )}
    </div>
  );
}

function getRoleColor(role: string): string {
  switch (role.toLowerCase()) {
    case "admin":
      return "bg-purple-100 text-purple-800";
    case "user":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
