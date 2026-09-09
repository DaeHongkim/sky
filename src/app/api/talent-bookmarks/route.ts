import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await requireUser([Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!company) return jsonError("FORBIDDEN", 403);
    const items = await prisma.talentBookmark.findMany({
      where: { companyId: company.id },
      include: { jobSeeker: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(items);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!company) return jsonError("FORBIDDEN", 403);
    const { jobSeekerId } = (await request.json()) as { jobSeekerId?: string };
    if (!jobSeekerId) return jsonError("jobSeekerId required", 400);
    const item = await prisma.talentBookmark.upsert({
      where: { companyId_jobSeekerId: { companyId: company.id, jobSeekerId } },
      create: { companyId: company.id, jobSeekerId },
      update: {},
    });
    return jsonOk(item, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
