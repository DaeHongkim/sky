import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    await requireUser(["ADMIN"]);
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { actor: { select: { email: true, role: true } } },
    });
    return NextResponse.json({ logs });
  } catch (error) {
    return errorResponse(error);
  }
}
