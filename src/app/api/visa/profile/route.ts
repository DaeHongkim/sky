import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";

const schema = z.object({
  visaType: z.string().max(50).optional(),
  visaStatus: z.string().max(50).optional(),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  employmentAllowed: z.boolean().optional().nullable(),
});

function parseDate(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.JOB_SEEKER, Role.ADMIN, Role.SUPER_ADMIN]);
    const profile = await prisma.visaProfile.findUnique({
      where: { userId: user.id },
    });
    return jsonOk({
      profile,
      disclaimer:
        "비자 적법성 최종 판단은 AI가 하지 않습니다. AI 예상 / 공식 확인 필요 / 관리자 확인 완료를 구분하세요.",
      labels: {
        AI_ESTIMATE: "AI 예상",
        NEEDS_OFFICIAL_CHECK: "공식 확인 필요",
        ADMIN_VERIFIED: "관리자 확인 완료",
      },
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const body = await parseJson(request, schema);
    const profile = await prisma.visaProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        visaType: body.visaType,
        visaStatus: body.visaStatus,
        issueDate: parseDate(body.issueDate) || undefined,
        expiryDate: parseDate(body.expiryDate) || undefined,
        employmentAllowed: body.employmentAllowed ?? undefined,
        verificationStatus: "NEEDS_OFFICIAL_CHECK",
      },
      update: {
        visaType: body.visaType,
        visaStatus: body.visaStatus,
        issueDate: parseDate(body.issueDate),
        expiryDate: parseDate(body.expiryDate),
        employmentAllowed: body.employmentAllowed,
        // User edits reset to needs official check — never auto-verify via AI
        verificationStatus: "NEEDS_OFFICIAL_CHECK",
      },
    });
    return jsonOk(profile);
  } catch (e) {
    return handleRouteError(e);
  }
}
