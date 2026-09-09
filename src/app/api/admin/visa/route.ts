import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";

export async function GET(request: NextRequest) {
  try {
    await requireUser(["ADMIN"]);
    const status = request.nextUrl.searchParams.get("status") ?? undefined;

    const profiles = await prisma.visaProfile.findMany({
      where: status ? { verificationStatus: status as never } : undefined,
      orderBy: { updatedAt: "desc" },
      include: { user: { include: { jobSeekerProfile: { select: { name: true } } } } },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    return errorResponse(error);
  }
}
