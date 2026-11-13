import Link from "next/link";
import { auth } from "@/auth";
import { ROLE_DASHBOARD } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";

export const instant = false;

export default async function HomePage() {
  const session = await auth();
  const role = (session?.user as { role?: UserRole } | undefined)?.role;
  const dashboardHref = role ? ROLE_DASHBOARD[role] : "/login";

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#0071e3] selection:text-white antialiased font-sans">
      {/* ─── 1. Apple Global Navigation Bar (44px) ─────────────────────────── */}
      <header className="sticky top-0 z-50 h-11 bg-black/80 backdrop-blur-xl border-b border-white/[0.08] text-xs font-normal text-neutral-300">
        <nav className="mx-auto flex h-full max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition">
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 13.5l-7-3.18V17l7 3.5 7-3.5v-4.68l-7 3.18z" />
            </svg>
            <span className="text-xs font-semibold tracking-tight text-white uppercase">LMS Pro</span>
          </Link>

          {/* Center Links (Apple Store Navigation Style) */}
          <div className="hidden md:flex items-center gap-7 text-[12px] text-neutral-300/90 font-normal">
            <Link href="#overview" className="hover:text-white transition">Overview</Link>
            <Link href="#anti-cheat" className="hover:text-white transition">Anti-Cheat</Link>
            <Link href="#manager-studio" className="hover:text-white transition">Manager Studio</Link>
            <Link href="#curriculum" className="hover:text-white transition">Curriculum</Link>
            <Link href="#certificates" className="hover:text-white transition">Certificates</Link>
            <Link href="#enterprise" className="hover:text-white transition">Enterprise</Link>
          </div>

          {/* Right Action: Sign In / Go to Dashboard */}
          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href={dashboardHref}
                className="rounded-full bg-white px-3.5 py-1 text-[11px] font-medium text-black hover:bg-neutral-200 transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-[#0071e3] px-3.5 py-1 text-[11px] font-medium text-white hover:bg-[#0077ed] transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* ─── 2. Hero 1: Glossy Emerald Apple Hero Banner ───────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6 border-b border-white/10 bg-gradient-to-b from-[#114b3b] via-[#092920] to-[#041510]">
        {/* Layer 1: Radial Specular Light Cone (Top-Down Ambient Lighting) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(52, 211, 153, 0.35) 0%, rgba(16, 78, 60, 0.45) 40%, rgba(4, 21, 16, 0.95) 100%)",
          }}
        />

        {/* Layer 2: Glossy Diagonal Sheen Reflection (Apple Glass Reflection) */}
        <div className="absolute -inset-x-40 -top-40 h-[600px] pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent rotate-12 blur-2xl opacity-70" />

        {/* Layer 3: Ambient Blurred Emerald & Mint Orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-emerald-400/20 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-teal-300/15 blur-[140px] pointer-events-none" />

        {/* Layer 4: Subtle Geometric Apple Ribbon Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-200">
              The Restaurant Compliance Standard
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] drop-shadow-sm">
            Training they will actually finish.
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-emerald-100/85 font-normal leading-relaxed">
            Verified video streaming, frame-by-frame cheat prevention, and server-graded quizzes built for commercial kitchens.
          </p>

          {/* Action Buttons with Glossy Apple Styling */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              href="/login"
              className="rounded-full bg-[#0071e3] px-7 py-2.5 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(0,113,227,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:bg-[#0077ed] hover:scale-[1.02] active:scale-[0.99] transition duration-200"
            >
              Launch Live Prototype
            </Link>
            <Link
              href="#anti-cheat"
              className="rounded-full border border-white/25 bg-white/[0.08] backdrop-blur-xl px-7 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:bg-white/[0.16] hover:border-white/40 transition duration-200"
            >
              How Anti-Cheat Works
            </Link>
          </div>

          {/* Centerpiece: Floating Apple-Grade Glossy Glassmorphic Card */}
          <div className="relative mt-14 rounded-[32px] border border-white/20 bg-gradient-to-b from-white/[0.14] via-black/40 to-black/60 shadow-[0_30px_90px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.35)] backdrop-blur-2xl p-7 max-w-4xl mx-auto text-left">
            {/* Glossy top specular reflection line */}
            <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
                <div>
                  <p className="text-xs font-semibold text-white tracking-wide">Active Training Fleet</p>
                  <p className="text-[11px] text-emerald-200/70 font-mono">Restaurant A &middot; Tenant Rest-A</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300 border border-emerald-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  FDA Food Code 2026 Aligned
                </span>
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  90% Pass Gate
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
                <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Total Staff Enrolled</p>
                <p className="text-2xl font-bold text-white mt-1">2 Active</p>
                <p className="text-[11px] text-emerald-300 mt-1 font-medium">John Doe &amp; Jane Smith</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
                <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Current Module</p>
                <p className="text-2xl font-bold text-white mt-1">Safety Protocols</p>
                <p className="text-[11px] text-indigo-300 mt-1 font-medium">14 min &middot; Video + Quiz</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
                <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Skip Prevention</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">Active</p>
                <p className="text-[11px] text-neutral-400 mt-1">High-water mark locked</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Hero 2: Flagship Clean White Section ────────────────────────── */}
      <section id="overview" className="bg-[#f5f5f7] text-neutral-900 py-24 px-6 text-center">
        <div className="mx-auto max-w-4xl space-y-3">
          <h2 className="text-5xl sm:text-7xl font-bold tracking-tight text-neutral-900">
            LMS Pro.
          </h2>
          <p className="text-2xl sm:text-3xl font-medium text-neutral-600">
            Flawless compliance. Zero skipping.
          </p>
          <div className="flex items-center justify-center gap-4 pt-3">
            <Link
              href="/login"
              className="rounded-full bg-[#0071e3] px-6 py-2 text-sm font-semibold text-white hover:bg-[#0077ed] transition"
            >
              Sign In to Portal
            </Link>
            <Link
              href="#curriculum"
              className="text-[#0071e3] hover:underline text-sm font-medium flex items-center gap-1"
            >
              View Modules
            </Link>
          </div>

          {/* iPad / Tablet Mockup frame */}
          <div className="mt-14 max-w-3xl mx-auto rounded-[32px] border-[10px] border-neutral-900 bg-neutral-950 p-4 shadow-2xl text-left text-white">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-neutral-700" />
                <span className="h-3 w-3 rounded-full bg-neutral-700" />
                <span className="h-3 w-3 rounded-full bg-neutral-700" />
              </div>
              <span className="text-xs text-neutral-400 font-mono">lms-portal.internal/dashboard/staff</span>
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Welcome, John Doe</h3>
                  <p className="text-xs text-neutral-400">Restaurant A &middot; Staff Training Portal</p>
                </div>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30">
                  80% Watch Required
                </span>
              </div>

              {/* Video Bar Preview */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
                <div className="aspect-video w-full rounded-lg bg-neutral-950 flex flex-col items-center justify-center border border-neutral-800">
                  <svg className="w-10 h-10 text-neutral-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-white">Module 1: Safety Protocols</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Scrub-locked playback &middot; Rewind enabled</p>
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-indigo-600 w-2/5" />
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>40% Watched (0:15 / 0:38)</span>
                    <span className="text-indigo-400 font-medium">Scrubbing unlocked up to 0:15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Hero 3: High-Contrast Dark Pro Showcase ─────────────────────── */}
      <section id="manager-studio" className="bg-[#000000] text-white py-24 px-6 border-t border-neutral-900">
        <div className="mx-auto max-w-5xl text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            For General Managers &amp; Operations
          </p>
          <h2 className="text-5xl sm:text-7xl font-bold tracking-tight text-white">
            Manager Studio.
          </h2>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400 font-semibold text-2xl sm:text-3xl mt-1">
            Real-Time Telemetry. Zero Cross-Restaurant Leakage.
          </p>
          <div className="flex items-center justify-center gap-4 pt-3">
            <Link
              href="/login"
              className="rounded-full bg-[#0071e3] px-6 py-2 text-sm font-semibold text-white hover:bg-[#0077ed] transition"
            >
              Sign In as Manager
            </Link>
            <Link
              href="#anti-cheat"
              className="rounded-full border border-neutral-700 px-6 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition"
            >
              Explore Audit Logs
            </Link>
          </div>

          {/* Laptop Mockup */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-neutral-800 bg-[#0d0d0f] shadow-2xl p-6 text-left">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <p className="text-sm font-bold text-white">Restaurant A — Staff Progress Console</p>
                <p className="text-xs text-neutral-400">Manager: Alex Manager &middot; Tenant Rest-A</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-neutral-400">Live Auto-Polling Active</span>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Staff Member</th>
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3">Watch Progress</th>
                    <th className="py-2.5 px-3">Video Status</th>
                    <th className="py-2.5 px-3">Quiz Score</th>
                    <th className="py-2.5 px-3">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-medium">
                  <tr>
                    <td className="py-3 px-3 text-white">John Doe<br /><span className="text-neutral-500 font-normal">john.doe@restaurant-a.com</span></td>
                    <td className="py-3 px-3 text-neutral-300">Module 1: Safety Protocols</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 w-[40%]" />
                        </div>
                        <span className="text-neutral-300 font-mono">40%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3"><span className="rounded-full bg-blue-900/40 text-blue-300 px-2 py-0.5 text-[10px]">In Progress</span></td>
                    <td className="py-3 px-3 text-neutral-400">—</td>
                    <td className="py-3 px-3 text-neutral-500">—</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-white">Jane Smith<br /><span className="text-neutral-500 font-normal">jane.smith@restaurant-a.com</span></td>
                    <td className="py-3 px-3 text-neutral-300">Module 1: Safety Protocols</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-full" />
                        </div>
                        <span className="text-emerald-400 font-mono">100%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3"><span className="rounded-full bg-emerald-900/40 text-emerald-300 px-2 py-0.5 text-[10px]">Completed</span></td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">95%</td>
                    <td className="py-3 px-3"><span className="text-indigo-400 underline cursor-pointer">Download PDF</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Two-Column Bento Grid ───────────────────────────────────────── */}
      <section id="anti-cheat" className="bg-[#000000] py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Anti-Cheat Video Engine (Dark) */}
          <div className="rounded-3xl border border-neutral-800 bg-[#161617] p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Patented Precision</p>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Anti-Skip Video Engine.
              </h3>
              <p className="text-sm sm:text-base text-neutral-400">
                Staff can only scrub through sections they have already watched. Forward skipping is mathematically blocked on client and verified server-side.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300">Anti-Skip Guard Trigger</span>
                <span className="text-neutral-500">Snapback Active</span>
              </div>
              <p className="text-xs text-neutral-300">
                &ldquo;Forward skipping is disabled. Returned to your furthest watched position (0:15).&rdquo;
              </p>
              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[39%]" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full bg-[#0071e3] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0077ed] transition"
              >
                Test Player
              </Link>
              <Link href="#curriculum" className="text-xs text-[#2997ff] hover:underline flex items-center gap-0.5">
                Learn more
              </Link>
            </div>
          </div>

          {/* Card B: 90% Pass Threshold Quizzes (Dark) */}
          <div className="rounded-3xl border border-neutral-800 bg-[#161617] p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Rigorous Testing</p>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                90% Mastery Gate.
              </h3>
              <p className="text-sm sm:text-base text-neutral-400">
                Quizzes stay locked until 80% of the training video is completed. Scoring is evaluated server-side to guarantee zero client tamper.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm border border-emerald-500/30">
                95%
              </div>
              <div>
                <p className="text-base font-bold text-emerald-300">Passing Criteria Satisfied</p>
                <p className="text-xs text-emerald-200/80">Certificate automatically generated &amp; logged to health audit registry.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full bg-[#0071e3] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0077ed] transition"
              >
                Try Mock Quiz
              </Link>
              <Link href="#certificates" className="text-xs text-[#2997ff] hover:underline flex items-center gap-0.5">
                Certificate specs
              </Link>
            </div>
          </div>

          {/* Card C: Multi-Tenant Architecture (Light) */}
          <div className="rounded-3xl border border-neutral-200 bg-[#f5f5f7] p-8 sm:p-10 flex flex-col justify-between space-y-8 text-neutral-900">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">PostgreSQL RLS</p>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
                Multi-Tenant Isolation.
              </h3>
              <p className="text-sm sm:text-base text-neutral-600">
                Every restaurant franchise is completely siloed via Row-Level Security. General managers only ever access their assigned staff roster.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-300 bg-white p-5 shadow-sm space-y-2 text-xs font-mono">
              <div className="flex justify-between text-neutral-500">
                <span>Tenant Rest-A: Restaurant A</span>
                <span className="text-emerald-600 font-semibold">Active</span>
              </div>
              <div className="flex justify-between text-neutral-400 border-t border-neutral-200 pt-2">
                <span>Tenant Rest-B: Restaurant B</span>
                <span className="text-neutral-500 font-semibold">Protected</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full bg-neutral-900 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition"
              >
                Super Admin Console
              </Link>
              <span className="text-xs text-neutral-500">Zero data leakage</span>
            </div>
          </div>

          {/* Card D: Digital Certificates (Light) */}
          <div id="certificates" className="rounded-3xl border border-neutral-200 bg-[#f5f5f7] p-8 sm:p-10 flex flex-col justify-between space-y-8 text-neutral-900">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Digital Credentials</p>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
                Auditor-Grade Certificates.
              </h3>
              <p className="text-sm sm:text-base text-neutral-600">
                Instant PDF certificates generated upon passing. Ready for instant download or inspection by county food hygiene authorities.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Certified Food Handler</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">Jane Smith &middot; Restaurant A</p>
                <p className="text-[11px] text-amber-700">Issued: Nov 2026 &middot; Valid 3 Years</p>
              </div>
              <span className="rounded-full bg-amber-600/10 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-600/20">
                Verified
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full bg-neutral-900 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition"
              >
                View Sample Certificate
              </Link>
              <span className="text-xs text-neutral-500">PDFKit &amp; Puppeteer ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Endless Curriculum Section ──────────────────────────────────── */}
      <section id="curriculum" className="bg-[#000000] py-20 px-6 border-t border-neutral-900">
        <div className="mx-auto max-w-6xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Curriculum</p>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
            Endless training.
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl font-normal">
            Bite-sized, high-retention video modules crafted for cooks, servers, and kitchen managers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-8">
            {[
              { id: "01", title: "Module 1: Safety Protocols", desc: "Internal cooking temperatures, cold chains, and cross-contamination.", duration: "14 min", active: true },
              { id: "02", title: "Module 2: Kitchen Sanitization", desc: "Chemical sanitation cycles, dishwashing sanitizers, and wash stations.", duration: "12 min", active: false },
              { id: "03", title: "Module 3: Allergen Management", desc: "Big 9 food allergens, separate prep surfaces, and incident handling.", duration: "16 min", active: false },
              { id: "04", title: "Module 4: Fire & Burn Protocols", desc: "Grease fire suppression, suppression hoods, and kitchen first aid.", duration: "10 min", active: false },
              { id: "05", title: "Module 5: Cold Storage HACCP", desc: "Walk-in cooler logging, date labeling, FIFO rotation compliance.", duration: "15 min", active: false },
              { id: "06", title: "Module 6: Front-of-House Hygiene", desc: "Staff illness policy, handwashing cadences, and guest safety.", duration: "11 min", active: false },
            ].map((mod) => (
              <div
                key={mod.id}
                className="group relative rounded-3xl border border-neutral-800 bg-[#121214] p-6 hover:border-neutral-700 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-neutral-500 group-hover:text-white transition">
                      {mod.id}
                    </span>
                    {mod.active ? (
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        Prototype Ready
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-[10px] text-neutral-400">
                        Phase 2 Module
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white mt-4 group-hover:text-indigo-400 transition">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-800/80 pt-4 text-xs">
                  <span className="text-neutral-500">{mod.duration}</span>
                  <Link
                    href="/login"
                    className="font-semibold text-[#2997ff] hover:underline"
                  >
                    Start training
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. Quick Demo Launch Section ───────────────────────────────────── */}
      <section className="bg-[#121214] py-16 px-6 border-t border-neutral-800 text-center">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">14-Day Sprint Prototype</p>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Ready to test the portals?
          </h3>
          <p className="text-sm text-neutral-400">
            Select any of the three pre-seeded accounts to explore the Super Admin, Manager, or Staff dashboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href="/login"
              className="rounded-full bg-white px-6 py-2.5 text-xs font-semibold text-black hover:bg-neutral-200 transition"
            >
              Staff Portal (John Doe)
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[#0071e3] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#0077ed] transition"
            >
              Manager Portal (Alex)
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-neutral-700 px-6 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition"
            >
              Super Admin Console
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 8. Apple-Grade Footer ──────────────────────────────────────────── */}
      <footer id="enterprise" className="bg-[#000000] text-neutral-500 text-[11px] pt-14 pb-12 px-6 border-t border-neutral-900">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Legal Fine-Print Footnotes */}
          <div className="space-y-2 border-b border-neutral-900 pb-8 text-neutral-600 leading-relaxed">
            <p>
              1. Minimum completion threshold of 80% is measured using continuous server-validated playback intervals. Forward scrubbing attempts trigger automatic snapping back to the furthest verified position.
            </p>
            <p>
              2. Mastery quiz evaluation is executed server-side with strict 90% pass criteria based on FDA Food Code 2026 guidelines. Certificates are cryptographically generated and registered under tenant isolation policies.
            </p>
            <p>
              3. Multi-tenant isolation is enforced using PostgreSQL Row-Level Security (RLS). Cross-tenant queries are blocked at the engine layer to ensure zero data leakage between restaurant operators.
            </p>
          </div>

          {/* Sitemaps */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-[11px] pt-4">
            <div className="space-y-2.5">
              <p className="font-semibold text-neutral-300">Platform</p>
              <p><Link href="/login" className="hover:text-neutral-300 transition">Staff Portal</Link></p>
              <p><Link href="/login" className="hover:text-neutral-300 transition">Manager Studio</Link></p>
              <p><Link href="/login" className="hover:text-neutral-300 transition">Super Admin</Link></p>
              <p><Link href="#anti-cheat" className="hover:text-neutral-300 transition">Anti-Cheat Engine</Link></p>
            </div>

            <div className="space-y-2.5">
              <p className="font-semibold text-neutral-300">Compliance</p>
              <p><Link href="#curriculum" className="hover:text-neutral-300 transition">FDA Food Code</Link></p>
              <p><Link href="#curriculum" className="hover:text-neutral-300 transition">HACCP Logging</Link></p>
              <p><Link href="#curriculum" className="hover:text-neutral-300 transition">OSHA Commercial Kitchen</Link></p>
              <p><Link href="#certificates" className="hover:text-neutral-300 transition">Audit Readiness</Link></p>
            </div>

            <div className="space-y-2.5">
              <p className="font-semibold text-neutral-300">Architecture</p>
              <p><Link href="#anti-cheat" className="hover:text-neutral-300 transition">Row-Level Security</Link></p>
              <p><Link href="#anti-cheat" className="hover:text-neutral-300 transition">S3 / R2 Streaming</Link></p>
              <p><Link href="#anti-cheat" className="hover:text-neutral-300 transition">Digital PDF Signatures</Link></p>
              <p><Link href="#anti-cheat" className="hover:text-neutral-300 transition">RBAC Proxies</Link></p>
            </div>

            <div className="space-y-2.5">
              <p className="font-semibold text-neutral-300">For Restaurants</p>
              <p><Link href="/login" className="hover:text-neutral-300 transition">Single Location</Link></p>
              <p><Link href="/login" className="hover:text-neutral-300 transition">Franchise Groups</Link></p>
              <p><Link href="/login" className="hover:text-neutral-300 transition">Ghost Kitchens</Link></p>
              <p><Link href="/login" className="hover:text-neutral-300 transition">Corporate Hospitality</Link></p>
            </div>

            <div className="space-y-2.5">
              <p className="font-semibold text-neutral-300">LMS Prototype</p>
              <p><Link href="/login" className="hover:text-neutral-300 transition">Day 1 Execution</Link></p>
              <p><Link href="/login" className="hover:text-neutral-300 transition">Roadmap 14-Day Sprint</Link></p>
              <p><Link href="/login" className="hover:text-neutral-300 transition">System Status</Link></p>
              <p><Link href="/login" className="hover:text-neutral-300 transition">Privacy &amp; Terms</Link></p>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-600 text-[11px]">
            <p>Copyright &copy; 2026 LMS SaaS Inc. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 text-neutral-500">
              <Link href="/login" className="hover:text-neutral-300 transition">Privacy Policy</Link>
              <span>|</span>
              <Link href="/login" className="hover:text-neutral-300 transition">Terms of Use</Link>
              <span>|</span>
              <Link href="/login" className="hover:text-neutral-300 transition">Sales Policy</Link>
              <span>|</span>
              <Link href="/login" className="hover:text-neutral-300 transition">Legal</Link>
              <span>|</span>
              <Link href="/login" className="hover:text-neutral-300 transition">Site Map</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
