import { NextRequest } from "next/server";
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

const msgSchema = z.object({
  body: z.string().min(1).max(5000),
  attachmentMeta: z.string().optional(), // structure reserved for file attachments
});

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request);
    const member = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId: id, userId: user.id },
      },
    });
    if (!member) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
    await prisma.conversationMember.update({
      where: { id: member.id },
      data: { lastReadAt: new Date() },
    });
    return jsonOk(messages);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request);
    const body = await parseJson(request, msgSchema);
    const member = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId: id, userId: user.id },
      },
    });
    if (!member) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        body: body.body,
        attachmentMeta: body.attachmentMeta,
      },
    });
    return jsonCreated(message);
  } catch (e) {
    return handleRouteError(e);
  }
}
