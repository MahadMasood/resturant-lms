"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SEED_USERS } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";
import { ROLE_DASHBOARD } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick-fill from seed user buttons
  const fillUser = (role: UserRole) => {
    const user = SEED_USERS.find((u) => u.role === role);
    if (user) { setEmail(user.email); setPassword(user.password); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      // Find role to redirect
      const user = SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (user) router.push(ROLE_DASHBOARD[user.role]);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / Title */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 13.5l-7-3.18V17l7 3.5 7-3.5v-4.68l-7 3.18z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">LMS Pro</h1>
          <p className="mt-1 text-sm text-neutral-400">Restaurant Training Platform</p>
        </div>

        {/* Quick-login pills (Day 1 prototype helper) */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-wider text-neutral-500">
            Prototype — Quick Login
          </p>
          <div className="flex flex-wrap gap-2">
            {(["SUPER_ADMIN", "MANAGER", "STAFF"] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => fillUser(role)}
                className="flex-1 rounded-lg bg-neutral-800 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-indigo-700 hover:text-white"
              >
                {role === "SUPER_ADMIN" ? "Super Admin" : role === "MANAGER" ? "Manager" : "Staff (John)"}
              </button>
            ))}
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

