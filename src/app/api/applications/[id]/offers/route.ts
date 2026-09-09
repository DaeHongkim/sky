import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { offerCreateSchema } from "@/lib/offers/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

const terminalStatuses = new Set(["HIRED", "REJECTED", "WITHDRAWN"]);

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/applications/[id]/offers">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id: applicationId } = await ctx.params;
    const input = offerCreateSchema.parse(await request.json());

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { jobPost: { select: { title: true } } },
    });
    if (!application || application.companyId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "지원 내역을 찾을 수 없습니다.", 404);
    }
    if (terminalStatuses.has(application.status)) {
      throw new KnownApiError("APPLICATION_CLOSED", "이미 종료된 지원 건입니다.", 409);
    }

    const offer = await prisma.$transaction(async (tx) => {
      const created = await tx.jobOffer.create({
        data: {
          applicationId,
          jobSeekerId: application.jobSeekerId,
          companyId: user.id,
          companyUserId: user.id,
          salary: input.salary,
          employmentType: input.employmentType,
          workLocation: input.workLocation,
          startDate: input.startDate,
          workingHours: input.workingHours,
          benefits: input.benefits,
          status: "PENDING",
        },
      });

      await tx.application.update({ where: { id: applicationId }, data: { status: "OFFER" } });
      await tx.applicationHistory.create({
        data: {
          applicationId,
          fromStatus: application.status,
          toStatus: "OFFER",
          changedByUserId: user.id,
        },
      });
      await tx.notification.create({
        data: {
          userId: application.jobSeekerId,
          type: "OFFER_RECEIVED",
          title: "Offer가 도착했습니다.",
          body: `"${application.jobPost.title}" 지원 건에 대한 Offer가 도착했습니다.`,
          linkUrl: "/recruit/seeker/offers",
        },
      });

      return created;
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
