import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  requireAuth,
} from "@/lib/recruit/api";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const unreadOnly = new URL(request.url).searchParams.get("unread") === "1";
    const rows = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return jsonOk(rows);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const body = (await request.json().catch(() => ({}))) as {
      ids?: string[];
      all?: boolean;
    };
    if (body.all) {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
    } else if (body.ids?.length) {
      await prisma.notification.updateMany({
        where: { userId: user.id, id: { in: body.ids } },
        data: { isRead: true },
      });
    }
    return jsonOk({ read: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
