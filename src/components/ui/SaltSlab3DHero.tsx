"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SaltSlab3DHero() {
  const [mode, setMode] = useState<"hot" | "cold">("hot");

  return (
    <div className="relative mx-auto max-w-4xl rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#180e14] via-[#0d070b] to-[#050204] p-6 sm:p-10 shadow-[0_25px_80px_rgba(244,114,182,0.15)] overflow-hidden">
      {/* Specular Ambient Glows */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            mode === "hot"
              ? "radial-gradient(circle 400px at 50% 20%, rgba(245, 158, 11, 0.25), rgba(244, 114, 182, 0.15), transparent 70%)"
              : "radial-gradient(circle 400px at 50% 20%, rgba(56, 189, 248, 0.2), rgba(244, 114, 182, 0.15), transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Dual-Thermal Crystalline Matrix
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            The Himalayan Mineral Slab &bull; Interactive Simulator
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Hand-carved from 250-million-year-old rock salt. Switch between scorching table sears and chilled curing service.
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="inline-flex rounded-2xl border border-white/10 bg-neutral-950 p-1.5 shadow-inner">
          <button
            onClick={() => setMode("hot")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              mode === "hot"
                ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/25"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <span>Hot Sear (450&deg;F+)</span>
          </button>

          <button
            onClick={() => setMode("cold")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              mode === "cold"
                ? "bg-gradient-to-r from-sky-500 to-rose-500 text-white shadow-lg shadow-sky-500/25"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Chilled Platter (0&deg;F)</span>
          </button>
        </div>
      </div>

      {/* Main 3D Visual Rendering */}
      <div className="relative z-10 py-8">
        <AnimatePresence mode="wait">
          {mode === "hot" ? (
            <motion.div
              key="hot"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Searing Slab Graphic */}
              <div className="relative mx-auto max-w-lg rounded-3xl border border-amber-400/40 bg-gradient-to-b from-[#2a141a] via-[#1a0a0f] to-[#0a0406] p-7 shadow-[0_20px_60px_rgba(245,158,11,0.25)]">
                {/* Heat Wave Convection Glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-rose-500/20 via-amber-500/30 to-rose-500/20 blur-xl -z-10" />

                {/* Searing Temperature Gauge */}
                <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                      Searing Surface: 465&deg;F (240&deg;C)
                    </span>
                  </div>
                  <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                    Sizzle Ready
                  </span>
                </div>

                {/* Slab Layer Visual */}
                <div className="my-5 rounded-2xl border border-rose-400/40 bg-gradient-to-r from-rose-800/40 via-amber-800/40 to-rose-700/40 p-6 text-center space-y-3 relative overflow-hidden">
                  {/* Crystalline mineral shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent pointer-events-none" />

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-black/60 border border-amber-400/40 px-3 py-1 text-[11px] font-bold text-amber-200">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Wagyu &bull; Tomahawk &bull; Prime Ribeye</span>
                  </div>

                  <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Micro-Mineral Searing Crust
                  </h4>
                  <p className="text-xs text-rose-200/90 max-w-sm mx-auto leading-relaxed">
                    Extreme dry heat instantly sears the exterior, creating an impeccable golden Maillard crust without drawing out internal juices.
                  </p>

                  {/* Metal Ring Trivet Base Indicator */}
                  <div className="pt-2 border-t border-amber-400/20 flex items-center justify-center gap-2 text-[11px] text-amber-300 font-mono">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Resting on Protective Heavy-Duty Metal Ring Base</span>
                  </div>
                </div>

                {/* Micro metrics */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                  <div className="rounded-xl border border-white/10 bg-black/50 p-2.5">
                    <span className="block text-[10px] text-neutral-400">Salinity</span>
                    <strong className="text-amber-300 font-mono text-xs">Subtle &bull; 1.2%</strong>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/50 p-2.5">
                    <span className="block text-[10px] text-neutral-400">Trace Minerals</span>
                    <strong className="text-rose-300 font-mono text-xs">84 Elements</strong>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/50 p-2.5">
                    <span className="block text-[10px] text-neutral-400">Heat Retention</span>
                    <strong className="text-white font-mono text-xs">40+ Mins Table</strong>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="cold"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Chilled Slab Graphic */}
              <div className="relative mx-auto max-w-lg rounded-3xl border border-sky-400/40 bg-gradient-to-b from-[#0b1b24] via-[#061017] to-[#020508] p-7 shadow-[0_20px_60px_rgba(56,189,248,0.2)]">
                {/* Frost Glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500/20 via-rose-500/20 to-sky-500/20 blur-xl -z-10" />

                {/* Chilled Temperature Gauge */}
                <div className="flex items-center justify-between pb-4 border-b border-sky-500/20">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300">
                      Walk-in Chilled: 26&deg;F (-3&deg;C)
                    </span>
                  </div>
                  <span className="rounded-full bg-sky-500/20 border border-sky-400/30 px-2.5 py-0.5 text-[10px] font-bold text-sky-300">
                    Sub-Zero Presentation
                  </span>
                </div>

                {/* Slab Layer Visual */}
                <div className="my-5 rounded-2xl border border-sky-400/40 bg-gradient-to-r from-sky-900/30 via-rose-900/30 to-sky-900/30 p-6 text-center space-y-3 relative overflow-hidden">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-black/60 border border-sky-400/40 px-3 py-1 text-[11px] font-bold text-sky-200">
                    <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span>Beef Carpaccio &bull; Tuna Tartare &bull; Charcuterie</span>
                  </div>

                  <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Cold Mineral Curing &amp; Plating
                  </h4>
                  <p className="text-xs text-sky-200/90 max-w-sm mx-auto leading-relaxed">
                    Slight ambient curing as chilled thin cuts rest on the crystalline slab, imparting delicate seasoning without losing silkiness.
                  </p>

                  <div className="pt-2 border-t border-sky-400/20 flex items-center justify-center gap-2 text-[11px] text-sky-300 font-mono">
                    <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Maintains 0&deg;F to 32&deg;F For 90 Minutes At The Table</span>
                  </div>
                </div>

                {/* Micro metrics */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                  <div className="rounded-xl border border-white/10 bg-black/50 p-2.5">
                    <span className="block text-[10px] text-neutral-400">Serving Style</span>
                    <strong className="text-sky-300 font-mono text-xs">Raw &amp; Cured</strong>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/50 p-2.5">
                    <span className="block text-[10px] text-neutral-400">Freeze Holding</span>
                    <strong className="text-white font-mono text-xs">2 Hours Walk-In</strong>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/50 p-2.5">
                    <span className="block text-[10px] text-neutral-400">Table Chill</span>
                    <strong className="text-rose-300 font-mono text-xs">Zero Melting</strong>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Golden Rule Footer Callout */}
      <div className="relative z-10 rounded-2xl border border-amber-500/30 bg-black/70 p-4 text-xs text-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 font-bold">
            !
          </span>
          <div>
            <strong className="text-white font-bold block">The Salt Slab Master Rule:</strong>
            <span className="text-[11px] text-neutral-400">
              Always brush oil on the meat cut &mdash; never pour oil onto the salt slab.
            </span>
          </div>
        </div>

        <span className="rounded-full bg-rose-500/20 border border-rose-400/30 px-3 py-1 text-[11px] font-bold text-rose-300 whitespace-nowrap">
          Essential Searing Secret
        </span>
      </div>
    </div>
  );
}
