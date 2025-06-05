"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check admin status using API
        const response = await authAPI.checkAdminStatus();

        if (response.success && response.data) {
          // If authenticated, redirect to dashboard
          router.push("/dashboard");
        } else {
          // If not authenticated, redirect to sign in
          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        // In case of error, redirect to sign in
        router.push("/auth/signin");
      }
    }

    checkAuth();
  }, [router]);

  // Return loading state while checking auth and redirecting
  return (
    <div className="flex justify-center items-center h-screen bg-gray-950">
      <div className="w-12 h-12 border-4 border-gray-800 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );
}
