import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(["COMPANY"]);
    const jobPostId = request.nextUrl.searchParams.get("jobPostId") ?? undefined;

    const applications = await prisma.application.findMany({
      where: { companyId: user.id, ...(jobPostId ? { jobPostId } : {}) },
      orderBy: { appliedAt: "desc" },
      include: {
        jobPost: { select: { id: true, title: true } },
        resume: { select: { id: true, title: true } },
        jobSeeker: { select: { jobSeekerProfile: { select: { name: true, phone: true } } } },
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    return errorResponse(error);
  }
}
