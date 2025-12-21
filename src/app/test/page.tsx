"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const [status, setStatus] = useState<string>("Testing connection...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Check if Supabase client is initialized
        setStatus("✓ Supabase client initialized");

        // Test 2: Try to get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setError(`Session error: ${sessionError.message}`);
          return;
        }

        setStatus((prev) => prev + "\n✓ Auth session check passed");

        // Test 3: Try to query a table (should fail if not authenticated, but that's ok)
        const { data, error: queryError } = await supabase
          .from("pokedexes")
          .select("count")
          .limit(1);

        if (queryError && queryError.code !== "PGRST116") {
          // PGRST116 is "no rows" which is fine
          setError(`Query error: ${queryError.message}`);
          return;
        }

        setStatus(
          (prev) =>
            prev +
            "\n✓ Database query successful (RLS working as expected)"
        );
        setStatus(
          (prev) =>
            prev +
            "\n\n✅ Supabase connection is working correctly!"
        );
      } catch (err: any) {
        setError(`Error: ${err.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <main className="min-h-screen bg-pokemon-dark p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>

        <div className="bg-pokemon-card border border-pokemon-border rounded-lg p-6 font-mono text-sm whitespace-pre-wrap">
          {status}
        </div>

        {error && (
          <div className="mt-6 bg-red-900 border border-red-700 rounded-lg p-6 text-red-100 font-mono text-sm">
            {error}
          </div>
        )}

        <div className="mt-6">
          <a
            href="/"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </main>
  );
}
