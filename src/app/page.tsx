import Link from "next/link";
import { auth } from "@/auth";
import { ROLE_DASHBOARD } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import TiltCard3D from "@/components/ui/TiltCard3D";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SaltSlab3DHero from "@/components/ui/SaltSlab3DHero";
import HealthMeterInteractiveDemo from "@/components/ui/HealthMeterInteractiveDemo";

export default async function HomePage() {
  const session = await auth();
  const role = (session?.user as { role?: UserRole } | undefined)?.role;
  const dashboardHref = role ? ROLE_DASHBOARD[role] : "/login";

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-rose-500 selection:text-white antialiased font-sans overflow-x-hidden">
      {/* ─── 0. Scroll Progress Bar (Pink & Gold) ──────────────────────────── */}
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
                &bull; Himalayan Culinary Slabs
              </span>
            </div>
          </Link>

          {/* Center Links (Consumer & Food Focused) */}
          <div className="hidden lg:flex items-center gap-7 text-[12px] text-neutral-300 font-medium">
            <Link href="#culinary-magic" className="hover:text-rose-300 transition">The Salt Experience</Link>
            <Link href="#interactive-slab" className="hover:text-amber-300 transition">Slab Simulator</Link>
            <Link href="#minerals" className="hover:text-rose-300 transition">84 Trace Minerals</Link>
            <Link href="#health-meter" className="hover:text-amber-300 transition">The 40-Cook Journey</Link>
            <Link href="#golden-rules" className="hover:text-rose-300 transition">Cooking Rules</Link>
            <Link href="#table-side" className="hover:text-amber-300 transition">Steak Inspiration</Link>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href={dashboardHref}
                className="rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-1 text-[11px] font-bold text-white hover:opacity-95 transition shadow-md shadow-rose-900/30"
              >
                My Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition backdrop-blur-md"
              >
                Restaurant Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* ─── 2. Hero: Pink, Black & Gold Luxury Culinary Showcase ────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6 border-b border-rose-500/20 bg-gradient-to-b from-[#1c0a15] via-[#0d040a] to-[#000000]">
        {/* Specular Radial Cone in Rose & Champagne Gold */}
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(244, 114, 182, 0.3) 0%, rgba(245, 158, 11, 0.2) 40%, rgba(0, 0, 0, 0.98) 100%)",
          }}
        />

        {/* Ambient Glossy Sheen */}
        <div className="absolute -inset-x-40 -top-40 h-[600px] pointer-events-none bg-gradient-to-tr from-transparent via-rose-300/[0.06] to-transparent rotate-12 blur-2xl opacity-60" />

        {/* Ambient Blurred Rose & Warm Gold Orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-rose-500/15 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-amber-500/15 blur-[150px] pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-6">
          <ScrollReveal variant="fade-down" delay={0.1}>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/40 px-4 py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-amber-200 to-amber-400">
                250-Million-Year-Old Ancient Rock Salt &bull; Khewra Foothills
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.2}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
              Pure Himalayan Salt Slabs.
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-rose-200 to-amber-300">
                The Ultimate Steak Sear &amp; Mineral Infusion.
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.3}>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-neutral-300/90 font-normal leading-relaxed">
              Hand-carved crystalline mineral blocks that transform everyday cooking into extraordinary steakhouse theater. Sizzle prime cuts at 450&deg;F+ with natural trace minerals, or chill to 0&deg;F for delicate beef carpaccio and sashimi.
            </p>
          </ScrollReveal>

          {/* Action CTAs */}
          <ScrollReveal variant="fade-up" delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
              <Link
                href="#interactive-slab"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:brightness-110 px-7 py-3 text-sm font-bold text-white transition shadow-xl shadow-rose-900/40"
              >
                <span>Try The 3D Slab Simulator</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                href="#culinary-magic"
                className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/60 hover:bg-neutral-900 px-6 py-3 text-sm font-semibold text-amber-200 transition backdrop-blur-md"
              >
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Why It Tastes Better</span>
              </Link>

              <Link
                href="#health-meter"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950 px-5 py-3 text-sm font-medium text-neutral-400 hover:text-white transition"
              >
                <span>The 40-Cook Lifespan</span>
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
      <section id="culinary-magic" className="relative py-24 px-6 border-b border-white/10 bg-[#050204]">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-950/30 px-3.5 py-1 text-xs text-rose-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              Gastronomic Alchemy
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Why Steaks Taste Better On Salt.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              Standard pans trap steam and boil your meat in its own moisture. Pure Himalayan crystalline slabs conduct dry, blistering heat, infuse subtle natural minerals, and create a crisp caramelized crust.
            </p>
          </div>

          {/* 4 Core Culinary Benefits (3D Tilt Cards) */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Benefit 1 */}
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
                  Unlike shaker salt that dissolves instantly into a harsh, stinging burst, solid crystalline rock salt has near-zero porosity. It transfers only a microscopic, delicate layer of minerals against the steak&apos;s natural surface moisture (~1.2% infusion rate). You taste pure, rich beef flavor elevated by sweet, natural minerals.
                </p>
                <div className="pt-2 text-[11px] font-mono text-rose-300 border-t border-rose-500/20">
                  Infusion Science: Micro-contact seasoning without fluid loss
                </div>
              </div>
            </TiltCard3D>

            {/* Benefit 2 */}
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
                  The iconic pink rose hue comes from natural elemental iron. Loaded with potassium, magnesium, and calcium, the ancient Khewra seabed mineral matrix imparts complex terroir and smooth, savory depth that processed table salt or nonstick skillets cannot replicate.
                </p>
                <div className="pt-2 text-[11px] font-mono text-amber-300 border-t border-amber-500/20">
                  Mineral Complex: Iron (Fe), Magnesium (Mg), Potassium (K), Calcium (Ca)
                </div>
              </div>
            </TiltCard3D>

            {/* Benefit 3 */}
            <TiltCard3D maxTilt={10}>
              <div className="h-full rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#18110a] to-[#0c0804] p-8 space-y-4 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-950 border border-amber-500/40 text-amber-400 shadow-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Blistering 450&deg;F+ Sear &bull; Table-Side Theater
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Dense mineral rock absorbs tremendous heat energy and holds it effortlessly. Heat the slab on your stovetop or outdoor grill, transfer it onto its metal base ring, and bring it straight to the dining table. Sizzle ribeye, wagyu, and tomahawk strips right before your guests&apos; eyes.
                </p>
                <div className="pt-2 text-[11px] font-mono text-amber-300 border-t border-amber-500/20">
                  Thermal Retention: Sizzles at dining tables for 40+ minutes
                </div>
              </div>
            </TiltCard3D>

            {/* Benefit 4 */}
            <TiltCard3D maxTilt={10}>
              <div className="h-full rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#180a13] to-[#0c0409] p-8 space-y-4 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-950 border border-rose-500/40 text-rose-400 shadow-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Dual Thermal Magic (Hot Sizzle &amp; Ice-Cold Curing)
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Pop the slab in the freezer for two hours to transform it into a sub-zero chilled serving platter. Thinly sliced beef carpaccio, tuna tartare, fresh sushi, or artisanal cheese served on cold salt undergo a gentle ambient cure, creating a silky texture with balanced seasoning.
                </p>
                <div className="pt-2 text-[11px] font-mono text-rose-300 border-t border-rose-500/20">
                  Chilled Range: Sub-zero holding down to 0&deg;F (-18&deg;C)
                </div>
              </div>
            </TiltCard3D>
          </div>
        </div>
      </section>

      {/* ─── 4. Section: The 84 Minerals & Taste Chemistry ─────────────────── */}
      <section id="minerals" className="py-24 px-6 border-b border-rose-500/20 bg-[#000000]">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                Natural Terroir &bull; Khewra Salt Mines
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
                The Himalayan Mineral Profile.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md">
              Formed over 250 million years ago under tectonic pressure. Unrefined, unbleached, and free from plastic or chemical micro-contaminants.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-rose-500/30 bg-[#12080f] p-5 space-y-2">
              <span className="text-xs font-mono text-rose-400 font-bold block">01 &bull; Natural Iron (Fe)</span>
              <h4 className="text-lg font-bold text-white">Rose Quartz Pink</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Gives the slab its unmistakable pink hue while aiding heat conduction and searing crust formation on meats.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#120d08] p-5 space-y-2">
              <span className="text-xs font-mono text-amber-400 font-bold block">02 &bull; Magnesium (Mg)</span>
              <h4 className="text-lg font-bold text-white">Velvety Finish</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Softens the sodium strike, turning raw saltiness into a mellow, savory sweetness that coats prime beef cuts.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#120d08] p-5 space-y-2">
              <span className="text-xs font-mono text-amber-400 font-bold block">03 &bull; Potassium (K)</span>
              <h4 className="text-lg font-bold text-white">Juicy Tenderness</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Supports natural cellular moisture retention, ensuring wagyu and ribeyes remain luscious and tender inside.
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-[#12080f] p-5 space-y-2">
              <span className="text-xs font-mono text-rose-400 font-bold block">04 &bull; Calcium (Ca)</span>
              <h4 className="text-lg font-bold text-white">Solid Crystal Core</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Forms the dense crystalline structure that enables the slab to withstand 40+ high-heat searing cycles.
              </p>
            </div>
          </div>

          {/* 3-Stage Heating Rule Card */}
          <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-[#1f0e16] via-[#150a10] to-[#120c05] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-xs text-amber-300 font-bold">
                The Secret To Long-Lasting Slabs
              </div>
              <h3 className="text-xl font-bold text-white">
                The 3-Stage Gentle Heating Curve
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                Never rush heating a cold salt slab. Start low at 200&deg;F for 15 minutes, step up to 300&deg;F for 15 minutes, then finish at 450&deg;F+ for your sear. This gently evaporates trapped moisture and ensures your slab lasts for 40+ wonderful dinners.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/60 p-4 text-center shrink-0 w-full md:w-auto">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-mono">
                Water Sizzle Test
              </span>
              <span className="text-xl font-bold text-amber-400 font-mono mt-0.5 block">
                Instant Evaporation
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                450&deg;F Perfect Sear Ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Section: The 40-Cook Journey & Equipment Trio ───────────────── */}
      <section id="health-meter" className="py-24 px-6 border-b border-rose-500/20 bg-[#060205]">
        <div className="mx-auto max-w-6xl space-y-14">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Slab Lifespan &amp; Care
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              The 40-Cook Journey.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              Every time you sear, a microscopic whisper of mineral salt seasons your steak. A single thick hand-carved slab provides approximately 40 unforgettable dinner parties before evolving into gourmet finishing salt.
            </p>
          </div>

          {/* Interactive Simulation Widget */}
          <HealthMeterInteractiveDemo />

          {/* The Equipment Trio Explained */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-rose-500/30 bg-[#10070d] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Salt Cooking Slab
                </span>
                <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                  ~40 Sizzles
                </span>
              </div>
              <h4 className="text-base font-bold text-white">Hand-Carved Mineral Block</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Solid 8x8x2-inch slab crafted for blistering heat. Retains thermal energy for 40+ minutes at the table so guests can cook each bite to their preferred doneness.
              </p>
            </div>

            <div className="rounded-3xl border border-amber-500/30 bg-[#100c06] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Metal Ring Trivet
                </span>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                  Essential Base
                </span>
              </div>
              <h4 className="text-base font-bold text-white">Flame Convection &amp; Safety</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Elevates your salt slab over gas burners to circulate heat evenly without direct flame hot-spots, and serves as an insulated trivet on dining tables.
              </p>
            </div>

            <div className="rounded-3xl border border-rose-500/30 bg-[#10070d] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Serving Platter
                </span>
                <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                  Cold Display
                </span>
              </div>
              <h4 className="text-base font-bold text-white">Chilled Presentation Board</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Keeps cold cuts, seafood, sushi, and tartare beautifully chilled for over 90 minutes while adding a hint of delicate mineral seasoning to every slice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Section: The 4 Golden Rules of Salt Cooking ────────────────── */}
      <section id="golden-rules" className="py-24 px-6 border-b border-rose-500/20 bg-[#000000]">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
              Culinary Best Practices
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              The 4 Golden Rules of Salt Slab Cooking.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Follow these simple timeless steps for foolproof results every time you cook.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-[#0c050a] p-6 space-y-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-950 border border-rose-500/40 text-rose-400 font-bold text-xs">
                01
              </span>
              <h3 className="text-base font-bold text-white">Oil Meat, Never The Slab</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Lightly brush avocado or grapeseed oil onto your steak directly. Never pour oil on the slab &mdash; hot oil traps into crystal fissures and causes smoking.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0c0905] p-6 space-y-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400 font-bold text-xs">
                02
              </span>
              <h3 className="text-base font-bold text-white">The Sizzle Test</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Always flick a drop of water onto the slab before cooking. It must sizzle, dance, and vaporize instantly. If it doesn&apos;t, keep heating.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0c050a] p-6 space-y-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-950 border border-rose-500/40 text-rose-400 font-bold text-xs">
                03
              </span>
              <h3 className="text-base font-bold text-white">Zero Soap, Zero Water Soaks</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Salt is naturally antimicrobial. Let the slab cool to room temperature, scrape charred bits with a damp sponge or scouring pad, and dry immediately. Never use soap.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0c0905] p-6 space-y-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400 font-bold text-xs">
                04
              </span>
              <h3 className="text-base font-bold text-white">Repurpose The Depleted Slab</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                When your slab eventually thins after ~40 cooks, don&apos;t throw it away! Crush the remaining mineral rock in a mortar for the most delectable finishing salt in your pantry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. Section: Table-Side Sizzle Inspiration ─────────────────────── */}
      <section id="table-side" className="py-24 px-6 border-b border-rose-500/20 bg-[#050204]">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Dining Inspiration
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              What To Cook On Your Salt Slab.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              From sizzling wagyu to chilled ceviche, explore how food lovers and top chefs elevate their meals with Himalayan salt.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#180a13] to-[#0c0409] p-6 space-y-3.5 shadow-xl">
              <span className="inline-block rounded-full bg-rose-500/20 px-3 py-1 text-[11px] font-bold text-rose-300 border border-rose-500/30">
                Hot Sear &bull; 450&deg;F
              </span>
              <h3 className="text-lg font-bold text-white">Prime Ribeye &amp; Wagyu Strips</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Sear thin strips for 45-60 seconds per side. The dry heat caramelizes exterior marbling while infusing natural minerals, yielding tender, melt-in-your-mouth perfection.
              </p>
            </div>

            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#18110a] to-[#0c0804] p-6 space-y-3.5 shadow-xl">
              <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                Hot Sear &bull; 450&deg;F
              </span>
              <h3 className="text-lg font-bold text-white">Jumbo Sea Scallops &amp; Salmon</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Sear dry diver scallops for 2 minutes on the salt slab. A golden crust forms with crisp, savory sweetness without ever needing added table salt.
              </p>
            </div>

            <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#180a13] to-[#0c0409] p-6 space-y-3.5 shadow-xl">
              <span className="inline-block rounded-full bg-rose-500/20 px-3 py-1 text-[11px] font-bold text-rose-300 border border-rose-500/30">
                Sub-Zero Chilled &bull; 0&deg;F
              </span>
              <h3 className="text-lg font-bold text-white">Chilled Beef Carpaccio &amp; Sashimi</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Arrange paper-thin beef tenderloin or fresh sashimi slices on a frozen slab with olive oil and fresh herbs. The slab gently cures the underside while keeping it chilled.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. Apple Luxury Footer (Pink, Black & Gold) ────────────────────── */}
      <footer className="border-t border-rose-500/20 bg-black py-16 px-6 text-xs text-neutral-400">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 text-white font-bold text-xs">
                  S
                </span>
                <span className="font-bold text-white tracking-tight uppercase text-sm">
                  Salt<span className="text-rose-400">Craft</span>
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                The premier guide to hand-carved Himalayan salt slabs, searing science, and luxury table-side dining.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
              >
                Restaurant Portal Sign In
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-neutral-400">
            <div>
              <h5 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wider text-rose-300">
                Culinary Science
              </h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="#interactive-slab" className="hover:text-white transition">450&deg;F Searing Physics</Link></li>
                <li><Link href="#minerals" className="hover:text-white transition">84 Trace Minerals</Link></li>
                <li><Link href="#interactive-slab" className="hover:text-white transition">Sub-Zero Chilled Service</Link></li>
                <li><Link href="#health-meter" className="hover:text-white transition">The 40-Cook Journey</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wider text-amber-300">
                Equipment &amp; Care
              </h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="#golden-rules" className="hover:text-white transition">3-Stage Preheating</Link></li>
                <li><Link href="#golden-rules" className="hover:text-white transition">Metal Trivet Ring Base</Link></li>
                <li><Link href="#golden-rules" className="hover:text-white transition">Zero-Soap Cleaning</Link></li>
                <li><Link href="#golden-rules" className="hover:text-white transition">Finishing Salt Repurposing</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wider text-rose-300">
                Steak Inspiration
              </h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="#table-side" className="hover:text-white transition">Prime Ribeye &amp; Wagyu</Link></li>
                <li><Link href="#table-side" className="hover:text-white transition">Chilled Beef Carpaccio</Link></li>
                <li><Link href="#table-side" className="hover:text-white transition">Seared Wild Scallops</Link></li>
                <li><Link href="#interactive-slab" className="hover:text-white transition">Table-Side Sizzle Theater</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
            <p>&copy; {new Date().getFullYear()} SaltCraft. All rights reserved. Crafted for food lovers and steak connoisseurs.</p>
            <p className="font-mono text-[10px] text-neutral-600">
              Himalayan Rose Quartz &bull; Molten Gold &bull; Obsidian Black
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
