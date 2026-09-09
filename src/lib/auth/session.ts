import { createHash, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AccountStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_TTL_DAYS,
  getAuthSecret,
  type SessionUser,
} from "@/lib/auth/constants";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

function secretKey() {
  return new TextEncoder().encode(getAuthSecret());
}

export async function createSession(
  userId: string,
  meta?: { userAgent?: string | null; ip?: string | null },
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + AUTH_TOKEN_TTL_DAYS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: meta?.userAgent ?? null,
      ipHash: meta?.ip ? hashToken(meta.ip) : null,
    },
  });

  return { token, expiresAt };
}

export async function destroySession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const jar = await cookies();
  jar.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE_NAME)?.value;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          name: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    return null;
  }

  if (session.user.status !== AccountStatus.ACTIVE) {
    return null;
  }

  return session.user;
}

export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const error = new Error("UNAUTHORIZED") as Error & { status: number };
    error.status = 401;
    throw error;
  }
  if (roles && roles.length > 0) {
    const ok =
      roles.includes(user.role) ||
      (roles.includes(Role.ADMIN) && (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN));
    if (!ok) {
      const error = new Error("FORBIDDEN") as Error & { status: number };
      error.status = 403;
      throw error;
    }
  }
  return user;
}

/** Signed short-lived JWT for password reset links (not used as session). */
export async function signResetJwt(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, typ: "pwd_reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey());
}

export async function verifyResetJwt(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.typ !== "pwd_reset" || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
