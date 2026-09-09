import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const applications = await prisma.application.findMany({
      where: { jobSeekerId: user.id },
      orderBy: { appliedAt: "desc" },
      include: {
        jobPost: { select: { title: true, workLocation: true, status: true } },
        resume: { select: { title: true } },
      },
    });
    return NextResponse.json({ applications });
  } catch (error) {
    return errorResponse(error);
  }
}
