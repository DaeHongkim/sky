import { NextRequest } from "next/server";
import { JobPostStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";

type Ctx = { params: Promise<{ id: string }> };

const statusSchema = z.object({
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "EXPIRED"]),
});

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.COMPANY]);
    const body = await parseJson(request, statusSchema);
    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    const post = await prisma.jobPost.findUnique({ where: { id } });
    if (!post || !company || post.companyId !== company.id) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }
    const updated = await prisma.jobPost.update({
      where: { id },
      data: { status: body.status as JobPostStatus },
    });
    return jsonOk(updated);
  } catch (e) {
    return handleRouteError(e);
  }
}
