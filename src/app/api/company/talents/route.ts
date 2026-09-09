import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/api/respond";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireUser(["COMPANY"]);
    const sp = request.nextUrl.searchParams;
    const jobCategory = sp.get("jobCategory") ?? undefined;
    const region = sp.get("region") ?? undefined;
    const nationality = sp.get("nationality") ?? undefined;
    const koreanLevel = sp.get("koreanLevel") ?? undefined;
    const careerYearsMin = sp.get("careerYearsMin");

    // 기업은 공개(PUBLIC) + 완료(COMPLETED) 이력서를 최소 1개 가진 인재만 검색할 수 있다.
    const where: Prisma.JobSeekerProfileWhereInput = {
      user: {
        status: "ACTIVE",
        resumes: { some: { visibility: "PUBLIC", status: "COMPLETED" } },
      },
      ...(jobCategory ? { desiredJobCategory: { contains: jobCategory, mode: "insensitive" } } : {}),
      ...(region ? { desiredRegion: { contains: region, mode: "insensitive" } } : {}),
      ...(nationality ? { nationality: { contains: nationality, mode: "insensitive" } } : {}),
      ...(koreanLevel ? { koreanLevel: koreanLevel as never } : {}),
      ...(careerYearsMin ? { careerYears: { gte: Number(careerYearsMin) } } : {}),
    };

    const talents = await prisma.jobSeekerProfile.findMany({
      where,
      take: 50,
      orderBy: { updatedAt: "desc" },
      // 개인정보는 검색결과에서 최소한만 노출한다 (연락처/생년월일 등 제외).
      select: {
        userId: true,
        name: true,
        desiredJobCategory: true,
        desiredRegion: true,
        careerYears: true,
        nationality: true,
        koreanLevel: true,
        availableFrom: true,
        skills: true,
      },
    });

    return NextResponse.json({ talents });
  } catch (error) {
    return errorResponse(error);
  }
}
