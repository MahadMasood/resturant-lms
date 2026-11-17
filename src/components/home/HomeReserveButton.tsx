"use client";

import { useState } from "react";
import ReserveKitModal from "./ReserveKitModal";

interface HomeReserveButtonProps {
  className?: string;
  variant?: "nav" | "hero" | "final";
  defaultKit?: string;
  children?: React.ReactNode;
}

export default function HomeReserveButton({
  className = "",
  variant = "nav",
  defaultKit,
  children,
}: HomeReserveButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "final") {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-rose-400 via-rose-500 to-amber-400 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-rose-500/25 transition-[transform,filter] duration-300 hover:brightness-110 active:scale-95 ${className}`}
        >
          <span>{children || "Reserve a Slab Kit"}</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 12h13m-5-6 6 6-6 6" />
          </svg>
        </button>
        <ReserveKitModal isOpen={isOpen} onClose={() => setIsOpen(false)} defaultKit={defaultKit} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-[11px] font-semibold text-rose-300 transition-colors hover:border-rose-400 hover:bg-rose-500/20 active:scale-95 ${className}`}
      >
        {children || "Reserve Kit"}
      </button>
      <ReserveKitModal isOpen={isOpen} onClose={() => setIsOpen(false)} defaultKit={defaultKit} />
    </>
  );
}
