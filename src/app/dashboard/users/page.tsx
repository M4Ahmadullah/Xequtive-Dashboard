"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaUserAlt, FaEnvelope, FaPhone, FaCalendarAlt, FaSearch } from "react-icons/fa";
import { usersAPI } from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);

      try {
        const response = await usersAPI.getAllUsers();

        if (response.success && response.data?.users) {
          setUsers(response.data.users);
        } else {
          setError('Failed to load users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeUserModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-500';
      case 'user':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500';
      case 'premium':
        return 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-500';
      case 'vip':
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-500';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '👑';
      case 'user':
        return '👤';
      case 'premium':
        return '⭐';
      case 'vip':
        return '💎';
      default:
        return '👤';
    }
  };

  const filteredUsers = users.filter(user => {
    if (activeFilter !== "all" && user.role !== activeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.displayName?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="w-16 h-16 border-4 border-gray-800 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserAlt className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Users</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-purple-900/40 border border-purple-700/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 animate-pulse"></div>
          <div className="relative p-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent mb-3">
              User Management 👥
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Manage and monitor all user accounts. View detailed profiles, track activity, and maintain user relationships.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-500"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <FaSearch className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setActiveFilter("all")}
            className={`px-6 py-4 rounded-2xl transition-all duration-300 ${
              activeFilter === "all"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
            }`}
          >
            All ({users.length})
          </Button>
          <Button
            onClick={() => setActiveFilter("admin")}
            className={`px-6 py-4 rounded-2xl transition-all duration-300 ${
              activeFilter === "admin"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
            }`}
          >
            Admins ({users.filter(u => u.role === "admin").length})
          </Button>
          <Button
            onClick={() => setActiveFilter("user")}
            className={`px-6 py-4 rounded-2xl transition-all duration-300 ${
              activeFilter === "user"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
            }`}
          >
            Users ({users.filter(u => u.role === "user").length})
          </Button>
        </div>
      </div>

      {/* Enhanced Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.uid} className="group bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700 hover:border-purple-500/50 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 border-b border-purple-700/50 relative">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-white group-hover:text-purple-300 transition-colors duration-300 flex items-center gap-2">
                  <span className="text-2xl">{getRoleIcon(user.role)}</span>
                  {user.displayName || user.email}
                </CardTitle>
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${getRoleColor(user.role)}`}>
                  {user.role}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 relative">
              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FaEnvelope className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Email</p>
                    <p className="font-semibold text-white text-sm truncate">{user.email}</p>
                  </div>
                </div>

                {/* Phone */}
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <FaPhone className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-1">Phone</p>
                      <p className="font-semibold text-white text-sm">{user.phone}</p>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Member Since</p>
                    <p className="font-semibold text-white text-sm">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Account Status */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <FaUserAlt className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => openUserModal(user)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl"
                >
                  View Details
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUserAlt className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">No users found</h3>
          <p className="text-gray-400 text-lg">
            {searchQuery ? `No users match "${searchQuery}"` : `No ${activeFilter === "all" ? "" : activeFilter} users available`}
          </p>
        </div>
      )}

      {/* Enhanced User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-[95vw] h-[95vh] bg-gray-900 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{getRoleIcon(selectedUser.role)}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">User Profile</h2>
                  <p className="text-gray-400">{selectedUser.role} Account</p>
                </div>
              </div>
              <button
                onClick={closeUserModal}
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center gap-2">
                      <FaUserAlt className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Full Name</label>
                      <p className="text-white font-semibold text-lg">{selectedUser.displayName || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Email Address</label>
                      <p className="text-white font-semibold text-lg break-all">{selectedUser.email}</p>
                    </div>
                    {selectedUser.phone && (
                      <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                        <label className="text-sm text-gray-400 mb-2 block">Phone Number</label>
                        <p className="text-white font-semibold text-lg">{selectedUser.phone}</p>
                      </div>
                    )}
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">User ID</label>
                      <p className="text-white font-mono text-sm">{selectedUser.uid}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Details */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-blue-300 flex items-center gap-2">
                      <FaEnvelope className="h-5 w-5" />
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Account Role</label>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getRoleColor(selectedUser.role)}`}>
                          {getRoleIcon(selectedUser.role)} {selectedUser.role}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Account Status</label>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-semibold">Active</span>
                      </div>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Member Since</label>
                      <p className="text-white font-semibold">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <label className="text-sm text-gray-400 mb-2 block">Last Activity</label>
                      <p className="text-white font-semibold">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Statistics */}
                <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-emerald-300 flex items-center gap-2">
                      <FaCalendarAlt className="h-5 w-5" />
                      Booking Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-4 rounded-xl border border-blue-700/50">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-300 mb-1">0</div>
                          <p className="text-blue-400 text-sm">Total Bookings</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-4 rounded-xl border border-green-700/50">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-300 mb-1">0</div>
                          <p className="text-green-400 text-sm">Completed</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 p-4 rounded-xl border border-yellow-700/50">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-300 mb-1">0</div>
                          <p className="text-yellow-400 text-sm">Pending</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-4 rounded-xl border border-purple-700/50">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-300 mb-1">£0</div>
                          <p className="text-purple-400 text-sm">Total Spent</p>
                        </div>
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
