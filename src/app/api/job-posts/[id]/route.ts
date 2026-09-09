import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";
import { jobPostSchema } from "@/lib/recruit/validators";
import { isAdminRole } from "@/lib/permissions/roles";
import { getSessionFromRequest } from "@/lib/auth/session";

type Ctx = { params: Promise<{ id: string }> };

function parseDate(v?: string) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

async function assertCompanyOwns(userId: string, jobPostId: string) {
  const company = await prisma.companyProfile.findUnique({
    where: { userId },
  });
  const post = await prisma.jobPost.findUnique({ where: { id: jobPostId } });
  if (!post) {
    const err = new Error("NOT_FOUND");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  if (!company || post.companyId !== company.id) {
    const err = new Error("FORBIDDEN");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return { company, post };
}

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const post = await prisma.jobPost.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            verificationStatus: true,
            industry: true,
            address: true,
            website: true,
            description: true,
            companySize: true,
          },
        },
      },
    });
    if (!post) {
      const err = new Error("NOT_FOUND");
      (err as Error & { status: number }).status = 404;
      throw err;
    }

    const session = await getSessionFromRequest(request);
    const isOwner =
      session?.user.role === Role.COMPANY &&
      (await prisma.companyProfile.findFirst({
        where: { userId: session.user.id, id: post.companyId },
      }));

    if (post.status !== "OPEN" && !isOwner && !isAdminRole(session?.user.role || "")) {
      const err = new Error("NOT_FOUND");
      (err as Error & { status: number }).status = 404;
      throw err;
    }

    await prisma.jobPost.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return jsonOk({ ...post, views: post.views + 1 });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.COMPANY]);
    await assertCompanyOwns(user.id, id);
    const body = await parseJson(request, jobPostSchema.partial());
    const post = await prisma.jobPost.update({
      where: { id },
      data: {
        ...body,
        deadline: body.deadline !== undefined ? parseDate(body.deadline) : undefined,
      },
    });
    return jsonOk(post);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.COMPANY]);
    await assertCompanyOwns(user.id, id);
    await prisma.jobPost.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
