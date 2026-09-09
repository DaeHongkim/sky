import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { clearSessionCookie } from "@/lib/auth/session";
import { errorResponse } from "@/lib/api/respond";

export async function POST() {
  try {
    const user = await requireUser();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          status: "WITHDRAWN",
          withdrawnAt: new Date(),
          // 로그인에 재사용되지 않도록 이메일을 회수 처리한다. 다른 데이터는 이력을 위해 보존한다.
          email: `withdrawn+${user.id}@hihong.invalid`,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "WITHDRAW",
          targetType: "User",
          targetId: user.id,
        },
      }),
    ]);

    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
