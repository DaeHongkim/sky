import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { jobPostUpsertSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function ownedJob(id: string, userId: string) {
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) return null;
  return prisma.jobPost.findFirst({ where: { id, companyId: company.id } });
}

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const job = await prisma.jobPost.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            description: true,
            industry: true,
            companySize: true,
            address: true,
            website: true,
            verificationStatus: true,
          },
        },
      },
    });
    if (!job) return jsonError("NOT_FOUND", 404);

    if (job.status !== "OPEN") {
      // company owner / admin can still view
      try {
        const user = await requireUser();
        const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
        const company = user.role === Role.COMPANY
          ? await prisma.companyProfile.findUnique({ where: { userId: user.id } })
          : null;
        if (!isAdmin && company?.id !== job.companyId) {
          return jsonError("NOT_FOUND", 404);
        }
      } catch {
        return jsonError("NOT_FOUND", 404);
      }
    } else {
      await prisma.jobPost.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return jsonOk(job);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.COMPANY]);
    const { id } = await ctx.params;
    const existing = await ownedJob(id, user.id);
    if (!existing) return jsonError("NOT_FOUND", 404);

    const body = jobPostUpsertSchema.partial().parse(await request.json());
    const job = await prisma.jobPost.update({
      where: { id },
      data: {
        ...body,
        deadline: body.deadline !== undefined ? parseDate(body.deadline) : undefined,
      },
    });
    return jsonOk(job);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.COMPANY]);
    const { id } = await ctx.params;
    const existing = await ownedJob(id, user.id);
    if (!existing) return jsonError("NOT_FOUND", 404);
    await prisma.jobPost.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
