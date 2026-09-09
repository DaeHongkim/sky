import { NextRequest } from "next/server";
import { JobPostStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonCreated,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";

type Ctx = { params: Promise<{ id: string }> };

async function ownedPost(userId: string, id: string) {
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  const post = await prisma.jobPost.findUnique({ where: { id } });
  if (!post || !company || post.companyId !== company.id) {
    const err = new Error("FORBIDDEN");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return post;
}

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.COMPANY]);
    const source = await ownedPost(user.id, id);
    const { id: _id, createdAt: _c, updatedAt: _u, views: _v, ...rest } = source;
    const cloned = await prisma.jobPost.create({
      data: {
        ...rest,
        title: `${source.title} (복사)`,
        status: JobPostStatus.DRAFT,
        views: 0,
      },
    });
    return jsonCreated(cloned);
  } catch (e) {
    return handleRouteError(e);
  }
}
