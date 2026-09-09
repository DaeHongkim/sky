import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "1";

    const items = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, readAt: null },
    });
    return jsonOk({ items, unreadCount });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as { ids?: string[]; all?: boolean };
    if (body.all) {
      await prisma.notification.updateMany({
        where: { userId: user.id, readAt: null },
        data: { readAt: new Date() },
      });
    } else if (body.ids?.length) {
      await prisma.notification.updateMany({
        where: { userId: user.id, id: { in: body.ids } },
        data: { readAt: new Date() },
      });
    }
    return jsonOk({ read: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

void Role;
