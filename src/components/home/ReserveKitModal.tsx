"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ReserveKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultKit?: string;
}

const KIT_OPTIONS = [
  {
    id: "master-set",
    title: "The Master Searing Set",
    description: "8 × 8 × 2 in hand-carved cooking slab, flame-convection ring trivet, and culinary care guide.",
    badge: "Most Popular",
  },
  {
    id: "dual-temp",
    title: "Dual Temperature Presentation Set",
    description: "One high-heat searing slab, one chilled serving platter for raw fish/carpaccio, and dual bases.",
    badge: "Table Service",
  },
  {
    id: "commercial-bulk",
    title: "Commercial Restaurant Searing Program",
    description: "12+ hand-selected culinary slabs with matching stainless steel table cradles and kitchen certification access.",
    badge: "Venues",
  },
];

const PURPOSE_OPTIONS = [
  "Home Chef & Steak Connoisseur",
  "Executive Chef / Kitchen Director",
  "Restaurant / Hospitality Group",
  "Culinary Gift / Private Collector",
];

export default function ReserveKitModal({ isOpen, onClose, defaultKit }: ReserveKitModalProps) {
  const [selectedKit, setSelectedKit] = useState(defaultKit || KIT_OPTIONS[0].title);
  const [purpose, setPurpose] = useState(PURPOSE_OPTIONS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    referenceCode: string;
    kitType: string;
  } | null>(null);

  useEffect(() => {
    if (defaultKit) {
      setSelectedKit(defaultKit);
    }
  }, [defaultKit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          purpose,
          kitType: selectedKit,
          city,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit reservation.");
      }

      setConfirmation({
        referenceCode: data.referenceCode,
        kitType: data.kitType,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting inquiry.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setConfirmation(null);
    setError(null);
    setName("");
    setEmail("");
    setCity("");
    setNotes("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0d0d10] p-6 sm:p-8 text-white shadow-2xl shadow-rose-950/20 max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={resetAndClose}
              className="absolute right-5 top-5 rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {confirmation ? (
              /* Success Confirmation View */
              <div className="py-6 text-center space-y-5 animate-in fade-in duration-300">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-500/20 to-amber-500/10 text-rose-300 shadow-lg shadow-rose-500/20">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">
                    Reservation Allocation Secured
                  </h3>
                  <p className="mt-1.5 text-xs text-neutral-400 max-w-sm mx-auto">
                    Your request for <strong className="text-rose-200">{confirmation.kitType}</strong> has been logged in our salt cellar allocation registry.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 max-w-sm mx-auto space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400">
                    Reservation Code
                  </span>
                  <p className="font-mono text-base font-bold text-rose-300 tracking-wider">
                    {confirmation.referenceCode}
                  </p>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
                  Our team will review your culinary delivery location and send allocation details, pre-conditioning instructions, and dispatch timings to{" "}
                  <span className="text-white font-medium">{email}</span>.
                </p>

                <div className="pt-2">
                  <button
                    onClick={resetAndClose}
                    className="w-full sm:w-auto rounded-full bg-white px-8 py-3 text-xs font-bold text-black transition hover:bg-neutral-200"
                  >
                    Return to Experience
                  </button>
                </div>
              </div>
            ) : (
              /* Inquiry Form View */
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                    Direct Artisan Allocation
                  </div>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Reserve a Himalayan Salt Slab Kit
                  </h3>
                  <p className="mt-1 text-xs text-neutral-400">
                    Hand-carved from pristine 250-million-year-old salt veins. Tell us where to deliver your set.
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Select Kit Card Radio List */}
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
                      Select Your Slab Set
                    </label>
                    <div className="space-y-2">
                      {KIT_OPTIONS.map((kit) => {
                        const isSelected = selectedKit === kit.title;
                        return (
                          <div
                            key={kit.id}
                            onClick={() => setSelectedKit(kit.title)}
                            className={`cursor-pointer rounded-2xl border p-3.5 transition ${
                              isSelected
                                ? "border-rose-400 bg-rose-950/20 shadow-md shadow-rose-950/40"
                                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{kit.title}</span>
                              <span
                                className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                                  isSelected
                                    ? "bg-rose-500/30 text-rose-200 border border-rose-500/50"
                                    : "bg-white/10 text-neutral-400"
                                }`}
                              >
                                {kit.badge}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-neutral-400 leading-snug">
                              {kit.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name and Email Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-rose-400 transition"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="elena@culinary.com"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-rose-400 transition"
                      />
                    </div>
                  </div>

                  {/* Purpose & City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                        Intended Usage
                      </label>
                      <select
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#16161a] px-3.5 py-2.5 text-xs text-white outline-none focus:border-rose-400 transition"
                      >
                        {PURPOSE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-neutral-900 text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                        Delivery City / State
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Austin, Texas"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-rose-400 transition"
                      />
                    </div>
                  </div>

                  {/* Notes / Special Requests */}
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                      Notes or Custom Requests (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Inquiring about custom laser engraved stainless frames or specific thickness..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-rose-400 transition resize-none"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={resetAndClose}
                      className="rounded-full border border-white/10 bg-transparent px-5 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-rose-400 via-rose-500 to-amber-400 px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-rose-500/20 transition hover:brightness-110 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Reserving Allocation...</span>
                        </div>
                      ) : (
                        <span>Request Allocation</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
