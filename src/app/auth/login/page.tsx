"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Pokeball } from "@/components/Pokeball";
import { Mail, Lock, Eye, EyeOff, Sun, Moon } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const router = useRouter();

  // Initialize theme and listen for changes
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setTheme(isDarkMode ? "dark" : "light");
    }

    // Listen for theme changes via MutationObserver
    const observer = new MutationObserver(() => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setTheme(isDarkMode ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/dashboard");
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
        {theme === "dark" ? (
          <Sun size={20} className="text-yellow-500" />
        ) : (
          <Moon size={20} className="text-blue-400" />
        )}
      </button>

      <div className="w-full max-w-md">
        {/* Pokéball Logo */}
        <Pokeball />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-light-text dark:text-white">
            Pokédex Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, Trainer!</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-light-card dark:bg-pokemon-card border border-light-border dark:border-pokemon-border rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-light-text dark:text-white">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
                  {showPassword ? (
                    <Eye size={20} />
                  ) : (
                    <EyeOff size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pokemon-red hover:bg-red-500 disabled:bg-gray-400 text-white font-bold rounded-lg btn-glow"
            >
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-pokemon-red hover:text-red-500 font-semibold transition"
            >
              Sign up
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
