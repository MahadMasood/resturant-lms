import Link from "next/link";
import { auth } from "@/auth";
import { ROLE_DASHBOARD } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import TiltCard3D from "@/components/ui/TiltCard3D";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SaltSlab3DHero from "@/components/ui/SaltSlab3DHero";
import HealthMeterInteractiveDemo from "@/components/ui/HealthMeterInteractiveDemo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const role = (session?.user as { role?: UserRole } | undefined)?.role;
  const dashboardHref = role ? ROLE_DASHBOARD[role] : "/login";

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-rose-500 selection:text-white antialiased font-sans overflow-x-hidden">
      {/* ─── 0. Scroll Progress Bar (Pink & Gold Gradient) ──────────────────── */}
      <ScrollProgressBar />

      {/* ─── 1. Apple Luxury Navigation Bar (44px) ─────────────────────────── */}
      <header className="sticky top-0 z-50 h-11 bg-black/85 backdrop-blur-xl border-b border-rose-500/20 text-xs font-normal text-neutral-300">
        <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand Mark (Pink & Gold Salt Crystal Emblem) */}
          <Link href="/" className="flex items-center gap-2.5 text-white hover:opacity-90 transition">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 text-white shadow-sm shadow-rose-900/40">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zm0 18l-8-4v-5l8 4 8-4v5l-8 4z" />
              </svg>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-extrabold tracking-tight text-white uppercase">
                Salt<span className="text-rose-400">Craft</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] text-amber-300 font-mono tracking-wider">
                &bull; Mineral LMS
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden lg:flex items-center gap-7 text-[12px] text-neutral-300 font-medium">
            <Link href="#culinary-alchemy" className="hover:text-rose-300 transition">Culinary Alchemy</Link>
            <Link href="#interactive-slab" className="hover:text-amber-300 transition">Slab Simulator</Link>
            <Link href="#minerals" className="hover:text-rose-300 transition">84 Trace Minerals</Link>
            <Link href="#health-meter" className="hover:text-amber-300 transition">40-Cook Health Meter</Link>
            <Link href="#curriculum" className="hover:text-rose-300 transition">Staff Accreditation</Link>
            <Link href="#verification" className="hover:text-amber-300 transition">Public Registry</Link>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href={dashboardHref}
                className="rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-1 text-[11px] font-bold text-white hover:opacity-95 transition shadow-md shadow-rose-900/30"
              >
                Enter Portal
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 px-3.5 py-1 text-[11px] font-bold text-white hover:brightness-110 transition shadow-[0_2px_12px_rgba(244,114,182,0.35)]"
                >
                  Academy Portal
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ─── 2. Hero: Pink, Black & Gold Apple Showcase ─────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6 border-b border-rose-500/20 bg-gradient-to-b from-[#1c0a15] via-[#0d040a] to-[#000000]">
        {/* Layer 1: Radial Specular Light Cone in Rose & Champagne Gold */}
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(244, 114, 182, 0.3) 0%, rgba(245, 158, 11, 0.2) 40%, rgba(0, 0, 0, 0.98) 100%)",
          }}
        />

        {/* Layer 2: Glossy Diagonal Sheen Reflection */}
        <div className="absolute -inset-x-40 -top-40 h-[600px] pointer-events-none bg-gradient-to-tr from-transparent via-rose-300/[0.06] to-transparent rotate-12 blur-2xl opacity-60" />

        {/* Layer 3: Ambient Blurred Rose & Warm Gold Orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-rose-500/15 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-amber-500/15 blur-[150px] pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-6">
          <ScrollReveal variant="fade-down" delay={0.1}>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/40 px-4 py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-amber-200 to-amber-400">
                250-Million-Year-Old Himalayan Mineral Matrix
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.2}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
              Pure Himalayan Salt Slabs.
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-rose-200 to-amber-300">
                The Science of Searing &bull; Certified.
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.3}>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-neutral-300/90 font-normal leading-relaxed">
              Hand-carved ancient crystalline rock salt for high-temperature steak searing and cold presentation. Infuse cuts with 84 essential minerals, track the 40-cook health meter lifecycle, and verify kitchen staff accreditation.
            </p>
          </ScrollReveal>

          {/* Action CTAs */}
          <ScrollReveal variant="fade-up" delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:brightness-110 px-7 py-3 text-sm font-bold text-white transition shadow-xl shadow-rose-900/40"
              >
                <span>Enter Training Academy</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                href="/verify"
                className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/60 hover:bg-neutral-900 px-6 py-3 text-sm font-semibold text-amber-200 transition backdrop-blur-md"
              >
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Verify Public Certificate</span>
              </Link>

              <Link
                href="#health-meter"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950 px-5 py-3 text-sm font-medium text-neutral-400 hover:text-white transition"
              >
                <span>40-Cook Health Meter</span>
              </Link>
            </div>
          </ScrollReveal>

          {/* Interactive Dual-Mode 3D Salt Slab Simulator */}
          <div id="interactive-slab" className="pt-12">
            <ScrollReveal variant="scale-up" delay={0.45}>
              <SaltSlab3DHero />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── 3. Section: The Culinary Alchemy (Why Salt Slabs?) ─────────────── */}
      <section id="culinary-alchemy" className="relative py-24 px-6 border-b border-white/10 bg-[#050204]">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-950/30 px-3.5 py-1 text-xs text-rose-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              Gastronomic Superiority
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Why Premier Steakhouses Sear On Salt.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              Standard cast iron pans trap steam and scorch meat juices. Pure Himalayan crystalline slabs conduct uniform intense heat, natural mineral seasoning, and immediate crust caramelization.
            </p>
          </div>

          {/* 4 Core Pillars (3D Tilt Cards) */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pillar 1: Subtle Mineral Seasoning */}
            <TiltCard3D maxTilt={10}>
              <div className="h-full rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#180a13] to-[#0c0409] p-8 space-y-4 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-950 border border-rose-500/40 text-rose-400 shadow-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Subtle Salinity &bull; Never Over-Salted
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Unlike granule table salt that dissolves into a harsh saline burst, crystalline rock salt has near-zero porosity. It dissolves only microscopically against the meat&apos;s natural surface moisture, delivering delicate, balanced seasoning that enhances the beef&apos;s natural umami profile.
                </p>
                <div className="pt-2 text-[11px] font-mono text-rose-300 border-t border-rose-500/20">
                  Micro-Dissolution: ~1.2% sodium chloride infusion rate
                </div>
              </div>
            </TiltCard3D>

            {/* Pillar 2: 84 Essential Trace Minerals */}
            <TiltCard3D maxTilt={10}>
              <div className="h-full rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#18110a] to-[#0c0804] p-8 space-y-4 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-950 border border-amber-500/40 text-amber-400 shadow-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  84 Synergistic Trace Minerals
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  The distinctive pink crystalline hue is produced by natural trace iron. Rich in magnesium, potassium, and calcium, the ancient Khewra mineral matrix imparts a deep, earthy terroir that synthetic salts and stainless pans simply cannot duplicate.
                </p>
                <div className="pt-2 text-[11px] font-mono text-amber-300 border-t border-amber-500/20">
                  Matrix: Fe, Mg, K, Ca, Zn, Cu &bull; Ancient Khewra Mine Origin
                </div>
              </div>
            </TiltCard3D>

            {/* Pillar 3: Scorching 450°F+ Thermal Convection */}
            <TiltCard3D maxTilt={10}>
              <div className="h-full rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#18110a] to-[#0c0804] p-8 space-y-4 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-950 border border-amber-500/40 text-amber-400 shadow-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Intense 450&deg;F+ Sear &bull; Table-Side Sizzle
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  High specific heat capacity allows dense salt blocks to absorb and store thermal energy, retaining searing temperatures for 40+ minutes at guest tables. Direct dry heat ensures instantaneous Maillard crusting while locking inside all tender juices.
                </p>
                <div className="pt-2 text-[11px] font-mono text-amber-300 border-t border-amber-500/20">
                  Heat Range: 200&deg;F &rarr; 450&deg;F+ Sear &bull; Sustained Convection
                </div>
              </div>
            </TiltCard3D>

            {/* Pillar 4: Dual Hot & Cold Versatility */}
            <TiltCard3D maxTilt={10}>
              <div className="h-full rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#180a13] to-[#0c0409] p-8 space-y-4 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-950 border border-rose-500/40 text-rose-400 shadow-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Dual Thermal Searing &amp; Curing Platters
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  When frozen down to 0&deg;F (-18&deg;C) in walk-in freezers, salt serving platters hold sub-zero temperatures for 90 minutes. Presenting beef carpaccio, tuna tartare, sashimi, and carved steaks on cold salt initiates a light curing reaction that creates unrivaled texture.
                </p>
                <div className="pt-2 text-[11px] font-mono text-rose-300 border-t border-rose-500/20">
                  Sub-Zero Holding: 0&deg;F to 32&deg;F &bull; Zero Melting Dilution
                </div>
              </div>
            </TiltCard3D>
          </div>
        </div>
      </section>

      {/* ─── 4. Section: The 84 Minerals & Searing Science ─────────────────── */}
      <section id="minerals" className="py-24 px-6 border-b border-rose-500/20 bg-[#000000]">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                Trace Chemistry &bull; Khewra Salt Mines
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
                The Himalayan Mineral Breakdown.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md">
              Formed during the Precambrian era when a primordial ocean evaporated. Hand-selected slabs undergo strict purity screening before kitchen commissioning.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-rose-500/30 bg-[#12080f] p-5 space-y-2">
              <span className="text-xs font-mono text-rose-400 font-bold block">01 &bull; Iron (Fe)</span>
              <h4 className="text-lg font-bold text-white">Rose Pink Hue</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Natural oxidized iron crystals provide the signature Himalayan blush. Accelerates surface caramelization during high-temp sears.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#120d08] p-5 space-y-2">
              <span className="text-xs font-mono text-amber-400 font-bold block">02 &bull; Magnesium (Mg)</span>
              <h4 className="text-lg font-bold text-white">Palate Softness</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Tempers sharp sodium bites, transforming simple saltiness into complex, lingering savory terroir on wagyu and prime cuts.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#120d08] p-5 space-y-2">
              <span className="text-xs font-mono text-amber-400 font-bold block">03 &bull; Potassium (K)</span>
              <h4 className="text-lg font-bold text-white">Cellular Moisture</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Balances osmotic pressure across meat fibers, preventing excessive fluid loss during 450&deg;F contact.
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-[#12080f] p-5 space-y-2">
              <span className="text-xs font-mono text-rose-400 font-bold block">04 &bull; Calcium (Ca)</span>
              <h4 className="text-lg font-bold text-white">Crystalline Density</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Reinforces the mineral lattice, granting immense thermal inertia and durability under repeated 40-cook cycles.
              </p>
            </div>
          </div>

          {/* Golden Operating Protocol Card */}
          <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-[#1f0e16] via-[#150a10] to-[#120c05] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-xs text-amber-300 font-bold">
                Kitchen Protocol Standard
              </div>
              <h3 className="text-xl font-bold text-white">
                The 3-Stage Heating Protocol (Prevent Fracturing)
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                Stage 1: 200&deg;F (15 min) &rarr; Stage 2: 300&deg;F (15 min) &rarr; Stage 3: 450&deg;F+ Sear (15 min). Slow gradual heating safely vaporizes ambient moisture trapped in the crystal matrix, preventing thermal cracks.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/60 p-4 text-center shrink-0 w-full md:w-auto">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-mono">
                Water-Drop Test
              </span>
              <span className="text-xl font-bold text-amber-400 font-mono mt-0.5 block">
                Instant Sizzle
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                450&deg;F Readiness Indicator
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Section: The 40-Cook Health Meter & Equipment Lifecycle ─────── */}
      <section id="health-meter" className="py-24 px-6 border-b border-rose-500/20 bg-[#060205]">
        <div className="mx-auto max-w-6xl space-y-14">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Equipment Lifecycle Architecture
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              The 40-Cook Health Meter.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              Salt slabs naturally surrender microscopic layers of mineral during searing and maintenance. Our platform automates the 40-cook lifecycle, alerting managers before slabs reach critical wear.
            </p>
          </div>

          {/* Interactive Simulation Widget */}
          <HealthMeterInteractiveDemo />

          {/* The Equipment Trio Explained */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-rose-500/30 bg-[#10070d] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Salt Cooking Plate
                </span>
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                  40 Max Cooks
                </span>
              </div>
              <h4 className="text-base font-bold text-white">Hot Sear Mineral Slabs</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Hand-carved 8x8x2-inch slabs designed specifically for searing steaks. Managers track each plate&apos;s exact cook count with instant &apos;+1 Cook&apos; logging buttons.
              </p>
            </div>

            <div className="rounded-3xl border border-amber-500/30 bg-[#100c06] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Metal Support Ring
                </span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                  Heavy-Duty Trivet
                </span>
              </div>
              <h4 className="text-base font-bold text-white">Heat Convection Base Rings</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Heavy cast iron or stainless rings that elevate the salt slab above open burner flames, ensuring uniform heat circulation and preventing hot-spot fracture points.
              </p>
            </div>

            <div className="rounded-3xl border border-rose-500/30 bg-[#10070d] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Serving Platters
                </span>
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                  Cold Service
                </span>
              </div>
              <h4 className="text-base font-bold text-white">Chilled Presentation Slabs</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Smooth-polished slabs used for dining room presentation of chilled carpaccio, tomahawk steak carving, and cured meat boards at optimal temperatures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Section: Staff Accreditation (Anti-Cheat LMS) ──────────────── */}
      <section id="curriculum" className="py-24 px-6 border-b border-rose-500/20 bg-[#000000]">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
                Hospitality LMS &bull; Anti-Cheat Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
                Accredited Salt Slab Mastery.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md">
              Line cooks and service staff complete verified video masterclasses, master temperature protocols, and pass strict 90% examinations.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#0c050a] p-6 space-y-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-950 border border-rose-500/40 text-rose-300 font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-white">Sequential Anti-Cheat Player</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Seek-scrubbing is strictly prevented. Staff must watch full video demonstrations of gradual pre-heating, steak searing, and wire-brush cleaning before evaluations unlock.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0c0905] p-6 space-y-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950 border border-amber-500/40 text-amber-300 font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-white">Strict 90% Passing Threshold</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Graded securely on the server. Questions randomize and test internal steak temperatures, metal base ring safety, oiling protocols, and 40-cook retirement standards.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0c050a] p-6 space-y-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-950 border border-rose-500/40 text-rose-300 font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-white">Cryptographic Digital Certificate</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Upon graduation, an official PDF certificate is generated with a unique tamper-proof accreditation hash, verifiable by dining guests and health inspectors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. Section: Public Verification & Health Registry ─────────────── */}
      <section id="verification" className="py-24 px-6 border-b border-rose-500/20 bg-[#050204]">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Public Accreditation Portal
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">
            Instant Certificate Verification For Health Audits.
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Inspectors and dining patrons can verify employee training certificates by ID without logging in. Ensures food safety compliance, zero soap contamination, and kitchen integrity.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/verify?certId=CERT-GRANDBISTRO-001"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:brightness-110 px-7 py-3.5 text-xs font-bold text-white transition shadow-xl shadow-amber-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Verify Sample Certificate (CERT-GRANDBISTRO-001)</span>
            </Link>

            <Link
              href="/verify"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
            >
              <span>Search Accreditation Registry</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 8. Section: Multi-Tenant Architecture & Roles ─────────────────── */}
      <section className="py-24 px-6 border-b border-rose-500/20 bg-[#000000]">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              Multi-Tenant Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Enterprise Control Across Every Venue.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Complete isolation for multi-location steakhouse groups, regional managers, and kitchen teams.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Super Admin */}
            <div className="rounded-3xl border border-rose-500/30 bg-[#11070e] p-6 space-y-4">
              <span className="rounded-full bg-rose-950 px-3 py-1 text-[10px] font-bold text-rose-300 border border-rose-500/40 uppercase tracking-wider">
                Super Admin
              </span>
              <h3 className="text-lg font-bold text-white">Global Command</h3>
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span>Provision new restaurant venues in seconds</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span>Restaurant-wise audit of salt slabs and 40-cook meters</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span>Full staff directory drilldown and certificate oversight</span>
                </li>
              </ul>
            </div>

            {/* General Manager */}
            <div className="rounded-3xl border border-amber-500/30 bg-[#110d06] p-6 space-y-4">
              <span className="rounded-full bg-amber-950 px-3 py-1 text-[10px] font-bold text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                General Manager
              </span>
              <h3 className="text-lg font-bold text-white">Restaurant Hub</h3>
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Log cooking plate sears with instant &apos;+1 Cook&apos; buttons</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Manage metal base rings and steak presentation platters</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Export Inspector-ready compliance CSV reports</span>
                </li>
              </ul>
            </div>

            {/* Kitchen Staff */}
            <div className="rounded-3xl border border-rose-500/30 bg-[#11070e] p-6 space-y-4">
              <span className="rounded-full bg-rose-950 px-3 py-1 text-[10px] font-bold text-rose-300 border border-rose-500/40 uppercase tracking-wider">
                Kitchen Staff
              </span>
              <h3 className="text-lg font-bold text-white">Training Portal</h3>
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span>Anti-cheat video player with progressive unlock</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span>Interactive 90% threshold multiple-choice quiz</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span>Official downloadable &amp; printable PDF certificate</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. Apple Luxury Footer (Pink, Black & Gold) ────────────────────── */}
      <footer className="border-t border-rose-500/20 bg-black py-16 px-6 text-xs text-neutral-400">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 text-white font-bold text-xs">
                  S
                </span>
                <span className="font-bold text-white tracking-tight uppercase text-sm">
                  Salt<span className="text-rose-400">Craft</span> Academy
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                The global hospitality standard for Himalayan salt block culinary mastery and equipment lifecycle management.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
              >
                Sign In
              </Link>
              <Link
                href="/verify"
                className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2 text-xs font-bold text-white hover:brightness-110 transition shadow-md shadow-rose-900/30"
              >
                Verify Certificate
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-neutral-400">
            <div>
              <h5 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wider text-rose-300">
                Culinary Science
              </h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="#interactive-slab" className="hover:text-white transition">450&deg;F Searing Physics</Link></li>
                <li><Link href="#minerals" className="hover:text-white transition">84 Trace Minerals</Link></li>
                <li><Link href="#interactive-slab" className="hover:text-white transition">Sub-Zero Curing Platters</Link></li>
                <li><Link href="#health-meter" className="hover:text-white transition">40-Cook Health Meter</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wider text-amber-300">
                Equipment Hub
              </h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><span className="text-neutral-300">Cooking Slabs (8x8x2&quot;)</span></li>
                <li><span className="text-neutral-300">Metal Base Trivet Rings</span></li>
                <li><span className="text-neutral-300">Cold Steak Platters</span></li>
                <li><span className="text-neutral-300">Wire Scour Maintenance</span></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wider text-rose-300">
                Staff Academy
              </h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/login" className="hover:text-white transition">Anti-Cheat Video Player</Link></li>
                <li><Link href="/login" className="hover:text-white transition">90% Passing Standard</Link></li>
                <li><Link href="/verify" className="hover:text-white transition">Digital Accreditation</Link></li>
                <li><Link href="/verify" className="hover:text-white transition">Inspector CSV Audits</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wider text-amber-300">
                Enterprise Venues
              </h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/dashboard/super-admin" className="hover:text-white transition">Super Admin Console</Link></li>
                <li><Link href="/dashboard/manager" className="hover:text-white transition">General Manager Portal</Link></li>
                <li><Link href="/dashboard/staff" className="hover:text-white transition">Staff Member Portal</Link></li>
                <li><Link href="/verify" className="hover:text-white transition">Public Verification</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
            <p>&copy; {new Date().getFullYear()} SaltCraft Academy &bull; Multi-Tenant Restaurant LMS SaaS. All rights reserved.</p>
            <p className="font-mono text-[10px] text-neutral-600">
              Obsidian &bull; Himalayan Rose &bull; Molten Gold &bull; SF Pro Engine
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
