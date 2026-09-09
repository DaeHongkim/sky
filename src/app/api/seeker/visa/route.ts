import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { visaProfileUpdateSchema } from "@/lib/visa/validation";
import { errorResponse } from "@/lib/api/respond";

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const input = visaProfileUpdateSchema.parse(await request.json());

    // 본인이 직접 입력/수정한 정보이므로 항상 "AI 예상" 상태로 되돌리고,
    // 취업 허용 여부는 관리자가 공식 확인하기 전까지 false로 초기화한다.
    // AI/본인 입력만으로 비자 적법성을 최종 판단하지 않는다.
    const profile = await prisma.visaProfile.upsert({
      where: { userId: user.id },
      update: {
        ...input,
        verificationStatus: "AI_ESTIMATED",
        employmentAllowed: false,
        verifiedByAdminId: null,
        verifiedAt: null,
      },
      create: {
        userId: user.id,
        ...input,
        verificationStatus: "AI_ESTIMATED",
        employmentAllowed: false,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return errorResponse(error);
  }
}
