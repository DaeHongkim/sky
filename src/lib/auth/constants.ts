import { Role, AccountStatus } from "@prisma/client";

export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "hr_session";
export const AUTH_TOKEN_TTL_DAYS = Number(process.env.AUTH_TOKEN_TTL_DAYS || 14);

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
  status: AccountStatus;
  name: string | null;
};

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be set and at least 16 characters");
  }
  return secret;
}

export function isAdminRole(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

export function assertRole(user: SessionUser, allowed: Role[]): void {
  if (!allowed.includes(user.role) && !(allowed.includes(Role.ADMIN) && isAdminRole(user.role))) {
    const error = new Error("FORBIDDEN") as Error & { status: number };
    error.status = 403;
    throw error;
  }
}
