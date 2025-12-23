"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";

export default function Home() {
  const router = useRouter();

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

  return (
    <main className="min-h-screen bg-pokemon-dark">
      <Header title="Pokédex Tracker">
        <Link
          href="/auth/login"
          className="px-4 py-2 text-blue-400 hover:text-blue-300 transition"
        >
          Login
        </Link>
        <Link
          href="/auth/signup"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold transition"
        >
          Sign Up
        </Link>
      </Header>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">Track Your Pokédex Journey</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Create multiple Pokédexes, track your progress across all generations,
            and compete with friends to see who completes their collection first.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-pokemon-card border border-pokemon-border rounded-lg p-8">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-3">Multiple Pokédexes</h3>
            <p className="text-gray-400">
              Create as many Pokédexes as you want. Name them, track each one separately,
              and manage your collections with ease.
            </p>
          </div>

          <div className="bg-pokemon-card border border-pokemon-border rounded-lg p-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">Track Progress</h3>
            <p className="text-gray-400">
              See your progress at a glance with detailed stats. Filter by generation,
              type, and caught status to find what you need.
            </p>
          </div>

          <div className="bg-pokemon-card border border-pokemon-border rounded-lg p-8">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-3">Compete & Share</h3>
            <p className="text-gray-400">
              Challenge friends to complete Pokédexes first. Share your progress with
              shareable preview links.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 mb-6">Ready to start tracking?</p>
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition inline-block"
          >
            Create Your Account
          </Link>
        </div>
      </div>
    </main>
  );
}
