import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  clientIp,
  handleRouteError,
  jsonCreated,
  jsonError,
  parseJson,
} from "@/lib/recruit/api";
import { signupSchema } from "@/lib/recruit/validators";
import {
  createUserSession,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/recruit/audit";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request, signupSchema);

    if (body.role === "COMPANY" && !body.companyName) {
      return jsonError("companyName required for COMPANY signup", 400);
    }

    const existing = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (existing) {
      return jsonError("EMAIL_EXISTS", 409);
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: body.email.toLowerCase(),
          passwordHash,
          role: body.role as Role,
          name: body.name,
        },
      });

      if (body.role === "JOB_SEEKER") {
        await tx.jobSeekerProfile.create({
          data: {
            userId: created.id,
            name: body.name,
          },
        });
      } else {
        await tx.companyProfile.create({
          data: {
            userId: created.id,
            companyName: body.companyName!,
            contactEmail: body.email.toLowerCase(),
            contactName: body.name,
          },
        });
      }
      return created;
    });

    const { token, expiresAt } = await createUserSession({
      user,
      userAgent: request.headers.get("user-agent"),
      ipAddress: clientIp(request),
    });

    await writeAuditLog({
      userId: user.id,
      action: "AUTH_SIGNUP",
      entityType: "User",
      entityId: user.id,
      ipAddress: clientIp(request),
      meta: { role: user.role },
    });

    const response = NextResponse.json(
      {
        ok: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      },
      { status: 201 },
    );
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (e) {
    return handleRouteError(e);
  }
}
