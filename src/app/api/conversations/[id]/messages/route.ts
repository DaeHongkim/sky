import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { sendMessageSchema } from "@/lib/messaging/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

async function loadOwnedConversation(userId: string, role: string, conversationId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  const isParty =
    conversation &&
    ((role === "JOB_SEEKER" && conversation.jobSeekerId === userId) ||
      (role === "COMPANY" && conversation.companyId === userId));
  if (!conversation || !isParty) {
    throw new KnownApiError("NOT_FOUND", "대화방을 찾을 수 없습니다.", 404);
  }
  return conversation;
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/conversations/[id]/messages">
) {
  try {
    const user = await requireUser(["JOB_SEEKER", "COMPANY"]);
    const { id } = await ctx.params;
    await loadOwnedConversation(user.id, user.role, id);

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });

    await prisma.message.updateMany({
      where: { conversationId: id, senderId: { not: user.id }, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/conversations/[id]/messages">
) {
  try {
    const user = await requireUser(["JOB_SEEKER", "COMPANY"]);
    const { id } = await ctx.params;
    const conversation = await loadOwnedConversation(user.id, user.role, id);
    const { content } = sendMessageSchema.parse(await request.json());

    const recipientId =
      user.role === "COMPANY" ? conversation.jobSeekerId : conversation.companyId;

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: { conversationId: id, senderId: user.id, content },
      });
      await tx.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
      await tx.notification.create({
        data: {
          userId: recipientId,
          type: "SYSTEM",
          title: "새 메시지가 도착했습니다.",
          body: content.slice(0, 100),
          linkUrl:
            user.role === "COMPANY"
              ? `/recruit/seeker/messages/${id}`
              : `/recruit/company/messages/${id}`,
        },
      });
      return created;
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
