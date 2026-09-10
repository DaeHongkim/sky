import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";

export async function GET(request: NextRequest) {
  try {
    await requireUser(["ADMIN"]);
    const sp = request.nextUrl.searchParams;
    const role = sp.get("role") ?? undefined;
    const foreignerOnly = sp.get("foreigner") === "1";

    const users = await prisma.user.findMany({
      where: {
        role: role && role !== "ADMIN" ? (role as never) : { not: "ADMIN" },
        ...(foreignerOnly
          ? { jobSeekerProfile: { nationality: { not: null } } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        jobSeekerProfile: { select: { name: true, nationality: true } },
        companyProfile: { select: { companyName: true } },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return errorResponse(error);
  }
}
