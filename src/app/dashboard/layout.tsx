"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  FaCar,
  FaChartLine,
  FaSignOutAlt,
  FaTimes,
  FaBars,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navigation = [
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: FaCar,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: FaChartLine,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          mobileOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 shadow-xl">
          <div className="flex flex-col h-16 px-4">
            <div className="flex items-center justify-between h-16 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-400 rounded-lg"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                    X
                  </span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Xequtive
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-purple-400 transition-colors duration-300"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
          </div>
          <nav className="mt-5 px-3 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                } transition-all duration-300`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    pathname === item.href
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  } transition-colors duration-300`}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 ease-in-out ${
          isExpanded ? "lg:w-64" : "lg:w-14"
        }`}
      >
        <div className="flex flex-col flex-grow bg-gray-900 shadow-xl">
          <div className="flex flex-col h-16 px-2">
            <div className="flex items-center h-16 border-b border-gray-800">
              <div className="flex items-center space-x-3 relative">
                <div className="relative w-8 h-8 flex-shrink-0 ml-1">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-400 rounded-lg"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                    X
                  </span>
                </div>
                <span
                  className={`text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent transition-opacity duration-300 ${
                    isExpanded ? "opacity-100" : "opacity-0 w-0"
                  }`}
                >
                  Xequtive
                </span>
              </div>
            </div>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2.5 text-sm font-medium rounded-xl ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                } transition-all duration-300`}
                title={item.name}
              >
                <item.icon
                  className={`h-5 w-5 ${
                    pathname === item.href
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  } transition-colors duration-300`}
                />
                <span
                  className={`ml-3 transition-opacity duration-300 ${
                    isExpanded ? "opacity-100" : "opacity-0 w-0 hidden"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -right-3 top-20 bg-gray-900 rounded-full p-1.5 text-gray-400 hover:text-white focus:outline-none transition-colors duration-300 shadow-lg"
          >
            {isExpanded ? (
              <FaChevronLeft className="h-4 w-4" />
            ) : (
              <FaChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "lg:pl-64" : "lg:pl-14"
        } flex flex-col flex-1`}
      >
        <div className="flex-1 flex flex-col">
          <header className="bg-gray-900 shadow-lg sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="lg:hidden text-gray-400 hover:text-white focus:outline-none"
                >
                  <FaBars className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-semibold text-white ml-4">
                  Bookings
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">{user?.email}</span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition-colors duration-300"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span className="text-sm">Sign out</span>
                </button>
              </div>
            </div>
          </header>
          <main className="flex-1 mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
