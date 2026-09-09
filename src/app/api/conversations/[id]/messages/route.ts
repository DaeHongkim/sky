import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

type Ctx = { params: Promise<{ id: string }> };

const messageSchema = z.object({
  body: z.string().min(1).max(10000),
  attachmentMeta: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.COMPANY]);
    const { id } = await ctx.params;
    const member = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: user.id } },
    });
    if (!member) return jsonError("FORBIDDEN", 403);

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
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.COMPANY]);
    const { id } = await ctx.params;
    const body = messageSchema.parse(await request.json());

    const member = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: user.id } },
    });
    if (!member) return jsonError("FORBIDDEN", 403);

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        body: body.body,
        attachmentMeta: body.attachmentMeta
          ? (body.attachmentMeta as Prisma.InputJsonValue)
          : undefined,
      },
    });
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return jsonOk(message, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
