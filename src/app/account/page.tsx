"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/auth/login");
        return;
      }

      setUser(session.user);
      setEmail(session.user.email || "");
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setMessage({ type: "error", text: "Please enter a new email" });
      return;
    }

    setUpdatingEmail(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      setMessage({
        type: "success",
        text: "Email update initiated. Check your new email for confirmation.",
      });
      setNewEmail("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setMessage({ type: "error", text: "Please enter a new password" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setUpdatingPassword(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setMessage({ type: "success", text: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-pokemon-dark">
      <header className="bg-pokemon-card border-b border-pokemon-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Account Settings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {message && (
          <div
            className={`mb-6 p-4 rounded ${
              message.type === "success"
                ? "bg-green-900 border border-green-700 text-green-100"
                : "bg-red-900 border border-red-700 text-red-100"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {/* Current Email */}
          <div className="bg-pokemon-card border border-pokemon-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Current Email</h2>
            <p className="text-gray-300">{email}</p>
          </div>

          {/* Change Email */}
          <div className="bg-pokemon-card border border-pokemon-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Change Email</h2>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-pokemon-dark border border-pokemon-border rounded focus:outline-none focus:border-blue-500"
                  placeholder="your-new-email@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={updatingEmail || !newEmail.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-semibold transition"
              >
                {updatingEmail ? "Updating..." : "Update Email"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-pokemon-card border border-pokemon-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-pokemon-dark border border-pokemon-border rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-pokemon-dark border border-pokemon-border rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={updatingPassword || !newPassword.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-semibold transition"
              >
                {updatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Logout */}
          <div className="bg-pokemon-card border border-pokemon-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Logout</h2>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
