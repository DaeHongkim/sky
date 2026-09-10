import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    await requireUser(["ADMIN"]);
    const companies = await prisma.companyProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, status: true } } },
    });
    return NextResponse.json({ companies });
  } catch (error) {
    return errorResponse(error);
  }
}
