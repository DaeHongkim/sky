import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

const visaSchema = z.object({
  visaType: z.string().optional().nullable(),
  visaStatus: z.string().optional().nullable(),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  employmentAllowed: z.boolean().optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const visa = await prisma.visaProfile.findUnique({ where: { userId: user.id } });
    return jsonOk({
      visa,
      disclaimer:
        "비자 정보는 참고용입니다. AI 예상과 공식 확인, 관리자 확인을 구분하며 AI가 적법성을 최종 판단하지 않습니다.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const body = visaSchema.parse(await request.json());
    const visa = await prisma.visaProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        visaType: body.visaType,
        visaStatus: body.visaStatus,
        issueDate: body.issueDate ? new Date(body.issueDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        employmentAllowed: body.employmentAllowed,
        verificationStatus: "OFFICIAL_CONFIRMATION_REQUIRED",
      },
      update: {
        visaType: body.visaType,
        visaStatus: body.visaStatus,
        issueDate: body.issueDate ? new Date(body.issueDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        employmentAllowed: body.employmentAllowed,
        // user edits reset to official confirmation required — never AI final verdict
        verificationStatus: "OFFICIAL_CONFIRMATION_REQUIRED",
      },
    });
    return jsonOk({
      visa,
      labels: {
        AI_ESTIMATE: "AI 예상",
        OFFICIAL_CONFIRMATION_REQUIRED: "공식 확인 필요",
        ADMIN_VERIFIED: "관리자 확인 완료",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
