import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await requireUser(["JOB_SEEKER", "COMPANY"]);
    const offers = await prisma.jobOffer.findMany({
      where: user.role === "COMPANY" ? { companyId: user.id } : { jobSeekerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        application: { include: { jobPost: { select: { title: true } } } },
        company: { select: { companyName: true } },
        jobSeeker: { include: { jobSeekerProfile: { select: { name: true } } } },
        contracts: { orderBy: { version: "desc" }, take: 1 },
      },
    });
    return NextResponse.json({ offers });
  } catch (error) {
    return errorResponse(error);
  }
}
