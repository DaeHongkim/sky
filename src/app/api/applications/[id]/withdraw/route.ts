import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  requireAuth,
} from "@/lib/recruit/api";
import { createNotification } from "@/lib/recruit/audit";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const app = await prisma.application.findUnique({
      where: { id },
      include: { jobPost: true, company: true },
    });
    if (!app || app.jobSeekerId !== user.id) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }
    if (app.status === "HIRED") {
      const err = new Error("CANNOT_WITHDRAW_HIRED");
      (err as Error & { status: number }).status = 400;
      throw err;
    }
    const updated = await prisma.application.update({
      where: { id },
      data: { status: "WITHDRAWN", withdrawnAt: new Date() },
    });
    await prisma.applicationHistory.create({
      data: {
        applicationId: id,
        fromStatus: app.status,
        toStatus: "WITHDRAWN",
        changedById: user.id,
      },
    });
    await createNotification({
      userId: app.company.userId,
      type: "APPLICATION_WITHDRAWN",
      title: "지원이 취소되었습니다",
      body: app.jobPost.title,
    });
    return jsonOk(updated);
  } catch (e) {
    return handleRouteError(e);
  }
}
