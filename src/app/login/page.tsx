"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const DEMO_ACCOUNTS = [
  { role: "Super Admin", email: "admin@platform.com", pass: "admin123" },
  { role: "Manager", email: "manager@restaurant-a.com", pass: "manager123" },
  { role: "Staff (John)", email: "john.doe@restaurant-a.com", pass: "staff123" },
  { role: "Staff (Jane)", email: "jane.smith@restaurant-a.com", pass: "staff123" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fillAccount = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please verify credentials.");
        setLoading(false);
        return;
      }

      // Fetch authenticated session to determine role routing
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (role === "SUPER_ADMIN") {
        router.push("/dashboard/super-admin");
      } else if (role === "MANAGER") {
        router.push("/dashboard/manager");
      } else if (role === "STAFF") {
        router.push("/dashboard/staff");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred during authentication.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / Title */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 13.5l-7-3.18V17l7 3.5 7-3.5v-4.68l-7 3.18z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">LMS Pro Portal</h1>
          <p className="mt-1 text-xs text-neutral-400">
            Multi-Tenant Enterprise Restaurant Training & Accreditation
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 text-center">
            Demo Accounts (Neon Postgres Seeded)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillAccount(acc.email, acc.pass)}
                className="rounded-xl border border-neutral-800 bg-neutral-800/80 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-indigo-500 hover:bg-neutral-800 hover:text-white transition text-center truncate"
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-neutral-800 bg-neutral-900 p-6 md:p-7 shadow-xl"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="name@restaurant.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60 shadow-lg shadow-indigo-600/30"
          >
            {loading ? "Verifying Credentials..." : "Sign In to Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
