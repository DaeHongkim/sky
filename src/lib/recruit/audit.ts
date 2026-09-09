import { prisma } from "@/lib/db/prisma";

export async function writeAuditLog(params: {
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string | null;
  meta?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId || undefined,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      ipAddress: params.ipAddress || undefined,
      metaJson: params.meta ? JSON.stringify(params.meta) : undefined,
    },
  });
}

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  linkUrl?: string;
  data?: Record<string, unknown>;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      linkUrl: params.linkUrl,
      dataJson: params.data ? JSON.stringify(params.data) : undefined,
    },
  });
}
