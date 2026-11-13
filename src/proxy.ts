import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { ROLE_DASHBOARD } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl;
  // NextAuth v5 attaches the session on req.auth
  const role = (req.auth?.user as { role?: UserRole } | undefined)?.role;

  // ── Public routes ──────────────────────────────────────────────────────
  if (pathname === "/login") {
    if (role) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARD[role], req.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.next();
  }

  // ── Protected: /dashboard/** ───────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role) {
      const allowedBase = ROLE_DASHBOARD[role];
      if (!pathname.startsWith(allowedBase)) {
        return NextResponse.redirect(new URL(allowedBase, req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
