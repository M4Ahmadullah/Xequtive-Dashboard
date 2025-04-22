"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await signup(email, password);
      router.push("/dashboard/bookings");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create an account");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md rounded-2xl border border-gray-800/50 bg-gray-900/50 p-8 backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600/10">
            <svg
              className="h-8 w-8 text-purple-500"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-gray-400">Join us to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="group relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full rounded-xl border-2 border-gray-800 bg-gray-900/50 px-4 py-2.5 text-white placeholder-transparent transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-0 [&:-webkit-autofill]:!bg-[#111827] [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:![box-shadow:0_0_0_30px_#111827_inset] [&:-webkit-autofill]:[text-fill-color:rgb(255,255,255)]"
                placeholder="Email Address"
                required
              />
              <label
                htmlFor="email"
                className="absolute -top-2.5 left-4 bg-gray-900/50 px-1 text-sm text-gray-400 transition-all duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-purple-400"
              >
                Email Address
              </label>
            </div>

            <div className="group relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full rounded-xl border-2 border-gray-800 bg-gray-900/50 px-4 py-2.5 text-white placeholder-transparent transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-0 [&:-webkit-autofill]:!bg-[#111827] [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:![box-shadow:0_0_0_30px_#111827_inset] [&:-webkit-autofill]:[text-fill-color:rgb(255,255,255)]"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
              <label
                htmlFor="password"
                className="absolute -top-2.5 left-4 bg-gray-900/50 px-1 text-sm text-gray-400 transition-all duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-purple-400"
              >
                Password
              </label>
            </div>

            <div className="group relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="peer w-full rounded-xl border-2 border-gray-800 bg-gray-900/50 px-4 py-2.5 text-white placeholder-transparent transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-0 [&:-webkit-autofill]:!bg-[#111827] [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:![box-shadow:0_0_0_30px_#111827_inset] [&:-webkit-autofill]:[text-fill-color:rgb(255,255,255)]"
                placeholder="Confirm Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
              <label
                htmlFor="confirm-password"
                className="absolute -top-2.5 left-4 bg-gray-900/50 px-1 text-sm text-gray-400 transition-all duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-purple-400"
              >
                Confirm Password
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-purple-900/50 bg-purple-900/30 p-4 text-sm text-purple-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-purple-400 transition-colors duration-300 hover:text-purple-300"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
