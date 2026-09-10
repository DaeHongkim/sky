import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { signupSchema } from "@/lib/auth/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";
import { isRateLimited, clientIpFromHeaders } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFromHeaders(request.headers);
    if (isRateLimited(`signup:${ip}`, { windowMs: 60_000, max: 10 })) {
      throw new KnownApiError("RATE_LIMITED", "잠시 후 다시 시도해주세요.", 429);
    }

    const body = await request.json();
    const input = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new KnownApiError("EMAIL_TAKEN", "이미 가입된 이메일입니다.", 409);
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          role: input.role,
        },
      });

      if (input.role === "JOB_SEEKER") {
        await tx.jobSeekerProfile.create({
          data: {
            userId: createdUser.id,
            name: input.name,
          },
        });
      } else {
        const normalizedBrn = input.businessRegistrationNumber.replace(/-/g, "");
        const dupBrn = await tx.companyProfile.findUnique({
          where: { businessRegistrationNumber: normalizedBrn },
        });
        if (dupBrn) {
          throw new KnownApiError(
            "BUSINESS_NUMBER_TAKEN",
            "이미 등록된 사업자번호입니다.",
            409
          );
        }
        await tx.companyProfile.create({
          data: {
            userId: createdUser.id,
            companyName: input.companyName,
            businessRegistrationNumber: normalizedBrn,
            contactName: input.contactName,
            contactPhone: input.contactPhone,
            contactEmail: input.email,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorUserId: createdUser.id,
          action: "SIGNUP",
          targetType: "User",
          targetId: createdUser.id,
          ipAddress: ip,
        },
      });

      return createdUser;
    });

    const { token, maxAge } = await createSessionToken(
      { sub: user.id, role: user.role },
      false
    );
    await setSessionCookie(token, maxAge);

    return NextResponse.json(
      { id: user.id, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
