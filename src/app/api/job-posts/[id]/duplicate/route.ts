import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.COMPANY]);
    const { id } = await ctx.params;
    const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!company) return jsonError("FORBIDDEN", 403);

    const source = await prisma.jobPost.findFirst({ where: { id, companyId: company.id } });
    if (!source) return jsonError("NOT_FOUND", 404);

    const {
      id: _id,
      createdAt: _c,
      updatedAt: _u,
      views: _v,
      ...rest
    } = source;

    const clone = await prisma.jobPost.create({
      data: {
        ...rest,
        title: `${source.title} (복제)`,
        status: "DRAFT",
        views: 0,
      },
    });
    return jsonOk(clone, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
