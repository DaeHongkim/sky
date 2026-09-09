import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonCreated,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";

const scrapSchema = z.object({ jobPostId: z.string().min(1) });

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const scraps = await prisma.jobScrap.findMany({
      where: { userId: user.id },
      include: {
        jobPost: {
          include: {
            company: { select: { companyName: true, logoUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(scraps);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const body = await parseJson(request, scrapSchema);
    const scrap = await prisma.jobScrap.upsert({
      where: {
        userId_jobPostId: { userId: user.id, jobPostId: body.jobPostId },
      },
      create: { userId: user.id, jobPostId: body.jobPostId },
      update: {},
    });
    return jsonCreated(scrap);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const jobPostId = new URL(request.url).searchParams.get("jobPostId");
    if (!jobPostId) {
      const err = new Error("jobPostId required");
      (err as Error & { status: number }).status = 400;
      throw err;
    }
    await prisma.jobScrap.deleteMany({
      where: { userId: user.id, jobPostId },
    });
    return jsonOk({ deleted: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
