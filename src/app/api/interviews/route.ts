import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await requireUser(["JOB_SEEKER", "COMPANY"]);
    const interviews = await prisma.interview.findMany({
      where: user.role === "COMPANY" ? { companyId: user.id } : { jobSeekerId: user.id },
      orderBy: { scheduledAt: "asc" },
      include: {
        application: { include: { jobPost: { select: { title: true } } } },
        company: { select: { companyName: true } },
        jobSeeker: { include: { jobSeekerProfile: { select: { name: true } } } },
      },
    });
    return NextResponse.json({ interviews });
  } catch (error) {
    return errorResponse(error);
  }
}
