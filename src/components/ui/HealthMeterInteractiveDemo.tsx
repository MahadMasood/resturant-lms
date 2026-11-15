"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function HealthMeterInteractiveDemo() {
  const [cooks, setCooks] = useState<number>(14);
  const maxCooks = 40;

  const percentage = Math.max(0, Math.round(((maxCooks - cooks) / maxCooks) * 100));
  const usedPercentage = Math.min(100, Math.round((cooks / maxCooks) * 100));
  const thickness = Math.max(0.8, +(2.0 - (cooks / maxCooks) * 1.1).toFixed(2));

  const getStageMeta = () => {
    if (cooks >= 40) {
      return {
        stage: "Depleted (40/40)",
        color: "from-rose-600 to-rose-700",
        badge: "bg-rose-950 border-rose-500/40 text-rose-300",
        barColor: "bg-rose-500",
        action: "Retire Slab & Repurpose",
        advisory:
          "Slab has completed its 40-cook thermal cycle. Repurpose into crushed finishing salt or decorative chilled bases.",
      };
    }
    if (cooks >= 35) {
      return {
        stage: "Critical Wear (35-39/40)",
        color: "from-amber-600 to-amber-700",
        badge: "bg-amber-950 border-amber-500/40 text-amber-300",
        barColor: "bg-amber-500",
        action: "Thickness Alert & Replacement Order",
        advisory:
          "Thickness dropped below 1.2 inches. High risk of thermal shock if heated too rapidly. Manager inspection required.",
      };
    }
    if (cooks >= 22) {
      return {
        stage: "Mid-Life Seasoned (22-34/40)",
        color: "from-sky-600 to-sky-700",
        badge: "bg-sky-950 border-sky-500/40 text-sky-300",
        barColor: "bg-sky-500",
        action: "Active Dinner Service",
        advisory:
          "Optimal mineral seasoning balance. Micro-fissures present but stable. Always verify metal ring placement.",
      };
    }
    return {
      stage: "Prime Condition (1-21/40)",
      color: "from-emerald-600 to-emerald-700",
      badge: "bg-emerald-950 border-emerald-500/40 text-emerald-300",
      barColor: "bg-emerald-500",
      action: "Peak Sear Performance",
      advisory:
        "Full 2.0-inch density and maximum heat storage. Water-drop sizzle test holds heat for over 45 minutes table-side.",
    };
  };

  const meta = getStageMeta();

  return (
    <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#140b11] via-[#0a0508] to-[#040204] p-6 sm:p-8 space-y-6 shadow-[0_20px_60px_rgba(244,114,182,0.12)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-rose-600 text-white font-bold text-xs shadow-md">
            40
          </span>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Interactive 40-Cook Health Meter Simulation
            </h4>
            <p className="text-xs text-neutral-400">
              Drag the cook cycle slider to see how kitchen wear triggers automatic manager alerts
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${meta.badge}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          {meta.stage}
        </span>
      </div>

      {/* Main Interactive Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-400">Recorded Sears:</span>
          <span className="text-white font-bold text-sm">
            {cooks} of {maxCooks} Cooks ({usedPercentage}% Consumed)
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="40"
          value={cooks}
          onChange={(e) => setCooks(parseInt(e.target.value, 10))}
          className="w-full h-2.5 rounded-lg appearance-none cursor-pointer bg-neutral-800 accent-rose-500 focus:outline-none"
        />

        {/* Quick Click presets */}
        <div className="flex items-center justify-between gap-1 text-[11px] pt-1">
          <button
            onClick={() => setCooks(4)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-neutral-300 hover:text-white hover:border-emerald-500/40 transition"
          >
            4 Cooks (Prime)
          </button>
          <button
            onClick={() => setCooks(18)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-neutral-300 hover:text-white hover:border-sky-500/40 transition"
          >
            18 Cooks (Seasoned)
          </button>
          <button
            onClick={() => setCooks(37)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-neutral-300 hover:text-white hover:border-amber-500/40 transition"
          >
            37 Cooks (Critical)
          </button>
          <button
            onClick={() => setCooks(40)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-neutral-300 hover:text-white hover:border-rose-500/40 transition"
          >
            40 Cooks (Depleted)
          </button>
        </div>
      </div>

      {/* Visual Health Gauge Bar */}
      <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">Remaining Life Span:</span>
            <span className="font-mono font-bold text-rose-300">{percentage}%</span>
          </div>
          <span className="font-mono text-neutral-400">Thickness: {thickness}&quot; / 2.0&quot;</span>
        </div>

        <div className="h-3 w-full rounded-full bg-neutral-800 overflow-hidden relative">
          <motion.div
            className={`h-full rounded-full ${meta.barColor} transition-all duration-200`}
            style={{ width: `${usedPercentage}%` }}
          />
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed pt-1">
          <strong className="text-white block sm:inline mr-1">Kitchen Advisory:</strong>
          {meta.advisory}
        </p>
      </div>

      {/* Equipment Trio Context Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-3.5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">
            01 &bull; Salt Cooking Plate
          </span>
          <p className="text-[11px] text-neutral-300">
            Heat slowly at 200&deg;F &rarr; 300&deg;F &rarr; 450&deg;F. Never quench with water.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3.5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
            02 &bull; Metal Support Ring
          </span>
          <p className="text-[11px] text-neutral-300">
            Mandatory base trivet for air convection gap. Prevents flame fracture.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-3.5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 block">
            03 &bull; Serving Platter
          </span>
          <p className="text-[11px] text-neutral-300">
            Chill in walk-in for tabletop beef carpaccio, tuna tartare, and carved steak.
          </p>
        </div>
      </div>
    </div>
  );
}
