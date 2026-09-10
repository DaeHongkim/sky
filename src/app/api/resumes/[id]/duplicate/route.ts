import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/resumes/[id]/duplicate">
) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { id } = await ctx.params;

    const source = await prisma.resume.findUnique({
      where: { id },
      include: { careers: true, educations: true, certificates: true, languages: true, portfolios: true },
    });
    if (!source || source.userId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "이력서를 찾을 수 없습니다.", 404);
    }

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: `${source.title} (복사본)`,
        profileSummary: source.profileSummary,
        desiredJob: source.desiredJob,
        desiredLocation: source.desiredLocation,
        desiredSalary: source.desiredSalary,
        employmentType: source.employmentType,
        availableDate: source.availableDate,
        skills: source.skills,
        visibility: "PRIVATE",
        status: "DRAFT",
        isPrimary: false,
        careers: {
          create: source.careers.map((c) => ({
            companyName: c.companyName,
            position: c.position,
            startDate: c.startDate,
            endDate: c.endDate,
            isCurrent: c.isCurrent,
            responsibilities: c.responsibilities,
            resignReason: c.resignReason,
          })),
        },
        educations: {
          create: source.educations.map((e) => ({
            schoolName: e.schoolName,
            major: e.major,
            degree: e.degree,
            admissionDate: e.admissionDate,
            graduationDate: e.graduationDate,
            status: e.status,
          })),
        },
        certificates: {
          create: source.certificates.map((c) => ({
            name: c.name,
            issuer: c.issuer,
            acquiredDate: c.acquiredDate,
          })),
        },
        languages: {
          create: source.languages.map((l) => ({ language: l.language, level: l.level })),
        },
        portfolios: {
          create: source.portfolios.map((p) => ({
            title: p.title,
            url: p.url,
            description: p.description,
          })),
        },
      },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
