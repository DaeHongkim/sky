import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/company/jobs/[id]/duplicate">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id } = await ctx.params;

    const source = await prisma.jobPost.findUnique({ where: { id } });
    if (!source || source.companyId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "채용공고를 찾을 수 없습니다.", 404);
    }

    const job = await prisma.jobPost.create({
      data: {
        companyId: user.id,
        title: `${source.title} (복사본)`,
        jobCategory: source.jobCategory,
        description: source.description,
        responsibilities: source.responsibilities,
        requirements: source.requirements,
        preferredConditions: source.preferredConditions,
        employmentType: source.employmentType,
        salaryType: source.salaryType,
        salaryMin: source.salaryMin,
        salaryMax: source.salaryMax,
        workLocation: source.workLocation,
        workDays: source.workDays,
        workHours: source.workHours,
        breakTime: source.breakTime,
        recruitmentCount: source.recruitmentCount,
        deadline: source.deadline,
        foreignerAllowed: source.foreignerAllowed,
        visaConditions: source.visaConditions,
        koreanLevel: source.koreanLevel,
        housingSupport: source.housingSupport,
        mealSupport: source.mealSupport,
        transportationSupport: source.transportationSupport,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
