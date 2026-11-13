"use client";
import { signOut, useSession } from "next-auth/react";

export default function Navbar({ title }: { title: string }) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/80 px-6 backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/80">
      <span className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</span>
      <div className="flex items-center gap-4">
        <span className="hidden text-xs text-neutral-500 dark:text-neutral-400 sm:block">
          {session?.user?.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

