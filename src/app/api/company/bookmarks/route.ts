import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await requireUser(["COMPANY"]);
    const bookmarks = await prisma.talentBookmark.findMany({
      where: { companyId: user.id },
      orderBy: { createdAt: "desc" },
      include: { jobSeeker: { include: { jobSeekerProfile: true } } },
    });
    return NextResponse.json({ bookmarks });
  } catch (error) {
    return errorResponse(error);
  }
}
