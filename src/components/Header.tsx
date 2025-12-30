"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, User, LogOut } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  const { user, logout } = useUserStore();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Check if dark class is already on document
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

    setMounted(true);
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!mounted) return null;

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const buttonHoverClass = isDark 
    ? "hover:text-yellow-400" 
    : "hover:text-yellow-500";

  return (
    <header className={`border-b ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            ◆
          </div>
          <h1 className={`text-xl font-bold ${textClass}`}>Pokédex Tracker</h1>
        </div>

        {/* Right: Theme Switcher, Get Started, My Account, Logout */}
        <div className="flex items-center gap-4">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition ${buttonHoverClass}`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={20} className={textClass} />
            ) : (
              <Moon size={20} className={textClass} />
            )}
          </button>

          {/* Get Started Button - Only show if not logged in */}
          {!user && (
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition text-sm"
            >
              Get Started
            </Link>
          )}

          {/* My Account Button - Only show if logged in */}
          {user && (
            <button
              className={`p-2 rounded-lg transition ${buttonHoverClass}`}
              aria-label="My account"
            >
              <User size={20} className={textClass} />
            </button>
          )}

          {/* Logout Button - Only show if logged in */}
          {user && (
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg transition ${buttonHoverClass}`}
              aria-label="Logout"
            >
              <LogOut size={20} className={textClass} />
            </button>
          )}

          {/* Children (for backward compatibility) */}
          {children && <div className="flex gap-4">{children}</div>}
        </div>
      </div>
    </header>
  );
}
