import { createHash, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AccountStatus, Role, User } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "hr_session";
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 14);

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be set (min 16 chars)");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  role: Role;
  email: string;
  sid: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateRawToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export async function createSessionToken(payload: SessionPayload): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await new SignJWT({
    role: payload.role,
    email: payload.email,
    sid: payload.sid,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecretKey());
  return { token, expiresAt };
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || !payload.role || !payload.email || !payload.sid) {
      return null;
    }
    return {
      sub: payload.sub,
      role: payload.role as Role,
      email: String(payload.email),
      sid: String(payload.sid),
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date,
) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function createUserSession(params: {
  user: Pick<User, "id" | "email" | "role" | "status">;
  userAgent?: string | null;
  ipAddress?: string | null;
}) {
  if (params.user.status !== AccountStatus.ACTIVE) {
    const err = new Error("ACCOUNT_INACTIVE");
    (err as Error & { status: number }).status = 403;
    throw err;
  }

  const rawRefresh = generateRawToken();
  const tokenHash = hashToken(rawRefresh);
  const session = await prisma.session.create({
    data: {
      userId: params.user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000),
      userAgent: params.userAgent || undefined,
      ipAddress: params.ipAddress || undefined,
    },
  });

  const { token, expiresAt } = await createSessionToken({
    sub: params.user.id,
    role: params.user.role,
    email: params.user.email,
    sid: session.id,
  });

  await prisma.user.update({
    where: { id: params.user.id },
    data: { lastLoginAt: new Date() },
  });

  return { token, expiresAt, sessionId: session.id };
}

export async function destroySession(sessionId: string) {
  await prisma.session.deleteMany({ where: { id: sessionId } });
}

export async function getSessionFromCookies(): Promise<{
  user: User;
  sessionId: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return getSessionFromToken(token);
}

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<{ user: User; sessionId: string } | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return getSessionFromToken(token);
}

async function getSessionFromToken(token: string) {
  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const session = await prisma.session.findUnique({
    where: { id: payload.sid },
  });
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  if (session.userId !== payload.sub) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status !== AccountStatus.ACTIVE) {
    return null;
  }

  // Server is source of truth for role — ignore any client-supplied role.
  if (user.role !== payload.role) {
    return null;
  }

  return { user, sessionId: session.id };
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export { COOKIE_NAME };
