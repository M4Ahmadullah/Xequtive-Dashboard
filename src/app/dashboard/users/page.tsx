"use client";

import { useState, useEffect, useCallback } from "react";

import { User } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(
    async (params?: { page?: number; role?: string; query?: string }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/dashboard/users?page=${params?.page || pagination.currentPage}&limit=${pagination.limit}&role=${params?.role || role || ""}&query=${params?.query || searchQuery || ""}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const apiResponse = { success: data.success, data: data.data, error: data.error };

        if (apiResponse.success && apiResponse.data) {
          setUsers(apiResponse.data.users || []);
          const pagination = apiResponse.data.pagination;
          if (pagination) {
            setPagination((prev) => ({
              ...prev,
              total: pagination.total || 0,
              pages: pagination.pages || 0,
            }));
          }
        } else {
          setError(apiResponse.error?.message || "Failed to load users");
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

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
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
    <div className="p-6 max-w-7xl mx-auto bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-gray-300">
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
            className="flex-1 px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 text-white placeholder-gray-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <button
            onClick={() => handleRoleFilter(undefined)}
            className={`px-4 py-2 rounded-md ${
              role === undefined
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleRoleFilter("admin")}
            className={`px-4 py-2 rounded-md ${
              role === "admin"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => handleRoleFilter("user")}
            className={`px-4 py-2 rounded-md ${
              role === "user"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
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
              <Card key={user.uid} className="overflow-hidden bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700 hover:border-purple-500/50 hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 border-b border-purple-700/50">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-white group-hover:text-purple-300 transition-colors">
                      {user.displayName || user.email}
                    </CardTitle>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                      <p className="text-xs text-purple-400 mb-1 font-semibold uppercase tracking-wide">Email</p>
                      <p className="font-semibold text-white">{user.email}</p>
                    </div>

                    {user.phone && (
                      <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                        <p className="text-xs text-blue-400 mb-1 font-semibold uppercase tracking-wide">Phone</p>
                        <p className="font-semibold text-white">{user.phone}</p>
                      </div>
                    )}

                    {user.createdAt && (
                      <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                        <p className="text-xs text-emerald-400 mb-1 font-semibold uppercase tracking-wide">Joined</p>
                        <p className="font-semibold text-white">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => openUserModal(user)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all duration-300 transform hover:scale-105 font-medium"
                    >
                      View Details
                    </button>
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

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-[95vw] h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-b border-purple-700/50 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedUser.displayName || selectedUser.email}
                  </h2>
                  <p className="text-purple-300 mt-1">
                    User ID: {selectedUser.uid}
                  </p>
                </div>
                <button
                  onClick={closeUserModal}
                  className="text-gray-400 hover:text-white text-2xl font-bold p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-purple-300">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Full Name</label>
                      <p className="text-white font-medium">{selectedUser.displayName || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Phone</label>
                      <p className="text-white font-medium">{selectedUser.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Role</label>
                      <p className="text-white font-medium">{selectedUser.role}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Details */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-blue-300">Account Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">User ID</label>
                      <p className="text-white font-medium font-mono text-sm">{selectedUser.uid}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Created At</label>
                      <p className="text-white font-medium">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Last Booking Date</label>
                      <p className="text-white font-medium">
                        {selectedUser.lastBookingDate ? new Date(selectedUser.lastBookingDate).toLocaleDateString() : "No bookings yet"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Statistics */}
                <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-emerald-300">Booking Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Total Bookings</label>
                        <p className="text-white font-medium text-lg">{selectedUser.bookingsCount || 0}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Total Spent</label>
                        <p className="text-white font-medium text-lg">
                          £{selectedUser.totalSpent?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
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
