import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  linkUrl?: string;
  meta?: Prisma.InputJsonValue;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      linkUrl: input.linkUrl,
      meta: input.meta,
    },
  });
}

export async function writeAuditLog(input: {
  actorId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  meta?: Prisma.InputJsonValue;
  ipHash?: string | null;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      meta: input.meta,
      ipHash: input.ipHash,
    },
  });
}
