"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if there's a token in local storage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/auth/signin");
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
    </main>
  );
}
