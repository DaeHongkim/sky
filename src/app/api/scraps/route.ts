import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const scraps = await prisma.jobScrap.findMany({
      where: { jobSeekerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        jobPost: { include: { company: { select: { companyName: true } } } },
      },
    });
    return NextResponse.json({ scraps });
  } catch (error) {
    return errorResponse(error);
  }
}
