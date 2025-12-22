"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { Pokeball } from "@/components/Pokeball";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      router.push("/auth/login?message=Check+your+email+to+confirm+your+account");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-light-bg dark:bg-pokemon-dark flex flex-col items-center justify-center px-4 transition-colors">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-lg bg-light-border dark:bg-pokemon-card hover:bg-light-border/80 dark:hover:bg-pokemon-card/80 transition"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div className="w-full max-w-md">
        {/* Pokéball Logo */}
        <Pokeball />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-light-text dark:text-white">
            Pokédex Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Create your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-light-card dark:bg-pokemon-card border border-light-border dark:border-pokemon-border rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-light-text dark:text-white">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-light-bg dark:bg-pokemon-dark border border-light-border dark:border-pokemon-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pokemon-red text-light-text dark:text-white placeholder-gray-400"
                  placeholder="trainer@pokemon.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-light-text dark:text-white">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔒
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-light-bg dark:bg-pokemon-dark border border-light-border dark:border-pokemon-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pokemon-red text-light-text dark:text-white placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-light-text dark:text-white">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔒
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-light-bg dark:bg-pokemon-dark border border-light-border dark:border-pokemon-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pokemon-red text-light-text dark:text-white placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pokemon-red hover:bg-red-500 disabled:bg-gray-400 text-white font-bold rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-pokemon-red hover:text-red-500 font-semibold transition"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Demo Info */}
        <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          This is a demo. Data is stored securely in Supabase.
        </p>
      </div>
    </main>
  );
}
