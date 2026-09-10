import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { reportCreateSchema } from "@/lib/reports/validation";
import { errorResponse } from "@/lib/api/respond";
import { isRateLimited, clientIpFromHeaders } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const ip = clientIpFromHeaders(request.headers);
    if (isRateLimited(`report:${user.id}`, { windowMs: 60_000, max: 10 })) {
      return NextResponse.json(
        { error: "RATE_LIMITED", message: "신고가 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const input = reportCreateSchema.parse(await request.json());

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "REPORT_FILED",
        targetType: input.targetType,
        targetId: input.targetId,
        ipAddress: ip,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
