import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonCreated,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";

const createSchema = z.object({
  applicationId: z.string().optional(),
  jobPostId: z.string().optional(),
  peerUserId: z.string().min(1),
  body: z.string().min(1).max(5000),
});

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const memberships = await prisma.conversationMember.findMany({
      where: { userId: user.id },
      include: {
        conversation: {
          include: {
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
            members: {
              include: { user: { select: { id: true, name: true, role: true } } },
            },
            jobPost: { select: { title: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });
    return jsonOk(memberships.map((m) => m.conversation));
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const body = await parseJson(request, createSchema);

    let conversation = body.applicationId
      ? await prisma.conversation.findFirst({
          where: { applicationId: body.applicationId },
        })
      : null;

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          applicationId: body.applicationId,
          jobPostId: body.jobPostId,
          members: {
            create: [
              { userId: user.id },
              { userId: body.peerUserId },
            ],
          },
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        body: body.body,
      },
    });
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return jsonCreated({ conversationId: conversation.id, message });
  } catch (e) {
    return handleRouteError(e);
  }
}
