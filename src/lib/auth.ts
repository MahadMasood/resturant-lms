// ─── Seed Data & Auth Helpers ─────────────────────────────────────────────
// Day 1 Prototype: hardcoded users. Replace with DB queries in Phase 2.

export type UserRole = "SUPER_ADMIN" | "MANAGER" | "STAFF";

export interface SeedUser {
  id: string;
  email: string;
  password: string; // plain text for prototype only
  name: string;
  role: UserRole;
  tenantId: string | null;
  tenantName: string | null;
}

export const SEED_USERS: SeedUser[] = [
  {
    id: "u1",
    email: "admin@platform.com",
    password: "admin123",
    name: "Super Admin",
    role: "SUPER_ADMIN",
    tenantId: null,
    tenantName: null,
  },
  {
    id: "u2",
    email: "manager@restaurant-a.com",
    password: "manager123",
    name: "Alex Manager",
    role: "MANAGER",
    tenantId: "Rest-A",
    tenantName: "Restaurant A",
  },
  {
    id: "u3",
    email: "john.doe@restaurant-a.com",
    password: "staff123",
    name: "John Doe",
    role: "STAFF",
    tenantId: "Rest-A",
    tenantName: "Restaurant A",
  },
  {
    id: "u4",
    email: "jane.smith@restaurant-a.com",
    password: "staff123",
    name: "Jane Smith",
    role: "STAFF",
    tenantId: "Rest-A",
    tenantName: "Restaurant A",
  },
];

export function findUserByEmail(email: string): SeedUser | undefined {
  return SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  SUPER_ADMIN: "/dashboard/super-admin",
  MANAGER: "/dashboard/manager",
  STAFF: "/dashboard/staff",
};

