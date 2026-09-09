import { Role } from "@prisma/client";

export const ROLE = {
  JOB_SEEKER: "JOB_SEEKER",
  COMPANY: "COMPANY",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type AppRole = (typeof ROLE)[keyof typeof ROLE];

export function isAdminRole(role: Role | string): boolean {
  return role === ROLE.ADMIN || role === ROLE.SUPER_ADMIN;
}

export function canManageCompany(role: Role | string): boolean {
  return role === ROLE.COMPANY || isAdminRole(role);
}

export function canManageSeeker(role: Role | string): boolean {
  return role === ROLE.JOB_SEEKER || isAdminRole(role);
}

export function assertRole(
  role: Role | string | undefined | null,
  allowed: Array<Role | string>,
): void {
  if (!role || !allowed.includes(role)) {
    const err = new Error("FORBIDDEN");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}
