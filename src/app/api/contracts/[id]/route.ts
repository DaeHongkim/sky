import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/contracts/[id]">
) {
  try {
    const user = await requireUser(["JOB_SEEKER", "COMPANY"]);
    const { id } = await ctx.params;

    const contract = await prisma.employmentContract.findUnique({ where: { id } });
    if (!contract) throw new KnownApiError("NOT_FOUND", "계약서를 찾을 수 없습니다.", 404);

    const isOwner =
      (user.role === "COMPANY" && contract.companyId === user.id) ||
      (user.role === "JOB_SEEKER" && contract.jobSeekerId === user.id);
    if (!isOwner) throw new KnownApiError("FORBIDDEN", "접근 권한이 없습니다.", 403);

    let current = contract;
    if (user.role === "JOB_SEEKER" && contract.status === "SENT") {
      current = await prisma.employmentContract.update({
        where: { id },
        data: { status: "VIEWED", viewedAt: new Date() },
      });
    }

    const versions = await prisma.employmentContract.findMany({
      where: { contractGroupId: contract.contractGroupId },
      orderBy: { version: "desc" },
      select: { id: true, version: true, status: true, createdAt: true },
    });

    return NextResponse.json({ contract: current, versions });
  } catch (error) {
    return errorResponse(error);
  }
}
