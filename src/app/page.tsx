"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PokemonCard } from "@/components/PokemonCard";
import { ArrowRight, Zap, BarChart3, Filter, Sparkles } from "lucide-react";
import { typeColors } from "@/constants/pokemon";

export default function Home() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check if dark class is on document
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

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        router.push("/dashboard");
      }
    };

    checkUser();
  }, [router]);

  if (!mounted) return null;

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-gray-950" : "bg-gradient-to-b from-white to-gray-50";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const secondaryTextClass = isDark ? "text-gray-400" : "text-gray-600";
  const cardBgClass = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm";
  const accentClass = "text-red-500";

  return (
    <main className={`min-h-screen ${bgClass}`}>
      <Header />

      {/* Hero Section */}
      <section className={`${bgClass} py-20`}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Text */}
          <div className="text-center mb-16">
            <div className="mb-4 flex justify-center">
              <span className={`text-sm font-medium px-3 py-1 rounded-full border flex items-center gap-2 ${isDark ? "border-red-500/30 text-red-400 bg-red-500/10" : "border-red-200 text-red-600 bg-red-50"}`}>
                <Sparkles size={16} className="text-yellow-400" />
                Track your journey to become a Pokédex Master!
              </span>
            </div>
            <h1 className={`text-6xl font-bold mb-6 ${textClass}`}>
              Your Personal <span className={accentClass}>Pokédex</span>
              <br />
              Companion
            </h1>
            <p className={`text-lg ${secondaryTextClass} mb-8 max-w-2xl mx-auto`}>
              Create custom Pokédex collections, track your caught Pokémon, and monitor your
              progress across all generations. The ultimate tool for collectors and trainers alike.
            </p>
            <div className="flex gap-4 justify-center mb-8">
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
              >
                Start Your Journey
                <ArrowRight size={18} />
              </Link>
              <span className={secondaryTextClass}>or continue as guest</span>
            </div>
          </div>

          {/* Pokemon Cards */}
          <div className="flex justify-center gap-8 mb-20">
            <div className="w-1/3 max-w-[140px]">
              <PokemonCard
                id={25}
                name="Pikachu"
                caught={true}
                types={["electric"]}
                onToggleCaught={() => {}}
                typeColors={typeColors}
              />
            </div>
            <div className="w-1/3 max-w-[140px]">
              <PokemonCard
                id={6}
                name="Charizard"
                caught={true}
                types={["fire", "flying"]}
                onToggleCaught={() => {}}
                typeColors={typeColors}
              />
            </div>
            <div className="w-1/3 max-w-[140px]">
              <PokemonCard
                id={150}
                name="Mewtwo"
                caught={false}
                types={["psychic"]}
                onToggleCaught={() => {}}
                typeColors={typeColors}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`${isDark ? "bg-gray-900" : "bg-gray-50"} py-20`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${textClass}`}>Everything You Need</h2>
            <p className={secondaryTextClass}>
              Powerful features to help you track, organize, and complete your Pokédex collections.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Track Progress */}
            <div className={`${cardBgClass} border rounded-lg p-8`}>
              <BarChart3 size={32} className="text-red-500 mb-4" />
              <h3 className={`text-xl font-bold mb-3 ${textClass}`}>Track Progress</h3>
              <p className={secondaryTextClass}>
                View your progress at a glance with detailed stats and visual progress bars for each Pokédex.
              </p>
            </div>

            {/* Multiple Collections */}
            <div className={`${cardBgClass} border rounded-lg p-8`}>
              <Filter size={32} className="text-red-500 mb-4" />
              <h3 className={`text-xl font-bold mb-3 ${textClass}`}>Multiple Collections</h3>
              <p className={secondaryTextClass}>
                Create separate Pokédexes for different generations or purposes. Organize your collections your way.
              </p>
            </div>

            {/* Quick Filtering */}
            <div className={`${cardBgClass} border rounded-lg p-8`}>
              <Zap size={32} className="text-red-500 mb-4" />
              <h3 className={`text-xl font-bold mb-3 ${textClass}`}>Quick Filtering</h3>
              <p className={secondaryTextClass}>
                Filter by type, generation, or caught status instantly. Find exactly what you're looking for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className={`${bgClass} py-20`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-4xl font-bold mb-6 ${textClass}`}>See Your Progress at a Glance</h2>
              <p className={`${secondaryTextClass} mb-6`}>
                Beautiful visualizations help you understand exactly where you are in your collection journey. Watch your Pokédex fill up as you catch more Pokémon.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
              >
                Create Your First Pokédex
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Overview Card */}
            <div className={`${cardBgClass} border rounded-lg p-8`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  ◆
                </div>
                <h3 className={`font-bold ${textClass}`}>Kanto Collection</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={secondaryTextClass}>151 HP caught</span>
                    <span className="text-green-500 font-bold">84%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-300"}`}>
                    <div className="w-5/6 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div>
                    <p className={secondaryTextClass}>Caught</p>
                    <p className={`text-2xl font-bold ${textClass}`}>127</p>
                  </div>
                  <div>
                    <p className={secondaryTextClass}>Missing</p>
                    <p className={`text-2xl font-bold ${textClass}`}>24</p>
                  </div>
                  <div>
                    <p className={secondaryTextClass}>Complete</p>
                    <p className={`text-2xl font-bold text-green-500`}>84%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`${isDark ? "bg-gray-900" : "bg-gray-50"} py-20`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`text-4xl font-bold mb-4 ${textClass}`}>Ready to Catch 'Em All?</h2>
          <p className={`${secondaryTextClass} mb-8`}>
            Join trainers worldwide in tracking their Pokémon collections. Start your journey today!
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-lg transition"
          >
            Get Started Free
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"} border-t py-8`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className={secondaryTextClass}>© 2024 Pokédex Tracker. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
