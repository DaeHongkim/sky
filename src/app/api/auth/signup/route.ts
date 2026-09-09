import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import {
  createSession,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/notifications";
import { signupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = signupSchema.parse(await request.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) return jsonError("EMAIL_ALREADY_EXISTS", 409);

    if (body.role === Role.COMPANY && !body.companyName) {
      return jsonError("COMPANY_NAME_REQUIRED", 400);
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: body.email.toLowerCase(),
          passwordHash,
          role: body.role,
          name: body.name,
        },
      });

      if (body.role === Role.JOB_SEEKER) {
        await tx.jobSeekerProfile.create({
          data: {
            userId: created.id,
            name: body.name,
            email: body.email.toLowerCase(),
          },
        });
      }

      if (body.role === Role.COMPANY) {
        await tx.companyProfile.create({
          data: {
            userId: created.id,
            companyName: body.companyName!,
            businessNumber: body.businessNumber,
            contactName: body.name,
            contactEmail: body.email.toLowerCase(),
          },
        });
      }

      return created;
    });

    const { token, expiresAt } = await createSession(user.id, {
      userAgent: request.headers.get("user-agent"),
    });
    await setSessionCookie(token, expiresAt);
    await writeAuditLog({
      actorId: user.id,
      action: "AUTH_SIGNUP",
      entityType: "User",
      entityId: user.id,
      meta: { role: user.role },
    });

    return jsonOk({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
