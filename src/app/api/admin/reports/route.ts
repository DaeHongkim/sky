import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";

export async function GET(request: NextRequest) {
  try {
    await requireUser(["ADMIN"]);
    const status = request.nextUrl.searchParams.get("status") ?? undefined;

    const reports = await prisma.report.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { reporter: { select: { email: true } } },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    return errorResponse(error);
  }
}
