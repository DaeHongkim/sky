import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { resumeUpdateSchema } from "@/lib/resume/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

async function loadOwnedResume(userId: string, resumeId: string) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== userId) {
    throw new KnownApiError("NOT_FOUND", "이력서를 찾을 수 없습니다.", 404);
  }
  return resume;
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/resumes/[id]">
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;

    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        careers: true,
        educations: true,
        certificates: true,
        languages: true,
        portfolios: true,
      },
    });

    if (!resume) {
      throw new KnownApiError("NOT_FOUND", "이력서를 찾을 수 없습니다.", 404);
    }

    // 이력서 공개 범위는 반드시 서버에서 체크한다: 본인이 아니면 공개(PUBLIC) + 완료 상태만 열람 가능.
    const isOwner = resume.userId === user.id;
    const isViewablePublic = resume.visibility === "PUBLIC" && resume.status === "COMPLETED";
    if (!isOwner && !isViewablePublic) {
      throw new KnownApiError("FORBIDDEN", "비공개 이력서입니다.", 403);
    }

    return NextResponse.json({ resume });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/resumes/[id]">
) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { id } = await ctx.params;
    await loadOwnedResume(user.id, id);

    const input = resumeUpdateSchema.parse(await request.json());
    const { careers, educations, certificates, languages, portfolios, ...resumeFields } = input;

    const resume = await prisma.$transaction(async (tx) => {
      await tx.resume.update({
        where: { id },
        data: resumeFields,
      });

      if (careers) {
        await tx.resumeCareer.deleteMany({ where: { resumeId: id } });
        if (careers.length > 0) {
          await tx.resumeCareer.createMany({
            data: careers.map((c) => ({ ...c, resumeId: id })),
          });
        }
      }
      if (educations) {
        await tx.resumeEducation.deleteMany({ where: { resumeId: id } });
        if (educations.length > 0) {
          await tx.resumeEducation.createMany({
            data: educations.map((e) => ({ ...e, resumeId: id })),
          });
        }
      }
      if (certificates) {
        await tx.resumeCertificate.deleteMany({ where: { resumeId: id } });
        if (certificates.length > 0) {
          await tx.resumeCertificate.createMany({
            data: certificates.map((c) => ({ ...c, resumeId: id })),
          });
        }
      }
      if (languages) {
        await tx.resumeLanguage.deleteMany({ where: { resumeId: id } });
        if (languages.length > 0) {
          await tx.resumeLanguage.createMany({
            data: languages.map((l) => ({ ...l, resumeId: id })),
          });
        }
      }
      if (portfolios) {
        await tx.resumePortfolio.deleteMany({ where: { resumeId: id } });
        if (portfolios.length > 0) {
          await tx.resumePortfolio.createMany({
            data: portfolios.map((p) => ({ ...p, url: p.url || null, resumeId: id })),
          });
        }
      }

      return tx.resume.findUniqueOrThrow({
        where: { id },
        include: { careers: true, educations: true, certificates: true, languages: true, portfolios: true },
      });
    });

    return NextResponse.json({ resume });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/resumes/[id]">
) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { id } = await ctx.params;
    const resume = await loadOwnedResume(user.id, id);

    await prisma.resume.delete({ where: { id } });

    // 대표 이력서를 삭제했다면 가장 최근 이력서를 새 대표로 지정한다.
    if (resume.isPrimary) {
      const next = await prisma.resume.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });
      if (next) {
        await prisma.resume.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
