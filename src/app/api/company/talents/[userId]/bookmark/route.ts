import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/company/talents/[userId]/bookmark">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { userId } = await ctx.params;

    const existing = await prisma.talentBookmark.findUnique({
      where: { companyId_jobSeekerId: { companyId: user.id, jobSeekerId: userId } },
    });

    if (existing) {
      await prisma.talentBookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    }

    await prisma.talentBookmark.create({ data: { companyId: user.id, jobSeekerId: userId } });
    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    return errorResponse(error);
  }
}
