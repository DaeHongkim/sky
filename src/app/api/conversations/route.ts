import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

const createSchema = z.object({
  applicationId: z.string().optional(),
  jobPostId: z.string().optional(),
  peerUserId: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.COMPANY]);
    const items = await prisma.conversation.findMany({
      where: { members: { some: { userId: user.id } } },
      include: {
        company: { select: { companyName: true } },
        jobPost: { select: { title: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        members: { include: { user: { select: { id: true, name: true, role: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return jsonOk(items);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.COMPANY]);
    const body = createSchema.parse(await request.json());

    if (body.applicationId) {
      const existing = await prisma.conversation.findUnique({
        where: { applicationId: body.applicationId },
      });
      if (existing) return jsonOk(existing);

      const application = await prisma.application.findUnique({
        where: { id: body.applicationId },
        include: { company: true },
      });
      if (!application) return jsonError("NOT_FOUND", 404);

      const allowed =
        (user.role === Role.JOB_SEEKER && application.jobSeekerId === user.id) ||
        (user.role === Role.COMPANY && application.company.userId === user.id);
      if (!allowed) return jsonError("FORBIDDEN", 403);

      const conversation = await prisma.conversation.create({
        data: {
          companyId: application.companyId,
          jobPostId: application.jobPostId,
          applicationId: application.id,
          members: {
            create: [
              { userId: application.jobSeekerId },
              { userId: application.company.userId },
            ],
          },
        },
      });
      return jsonOk(conversation, { status: 201 });
    }

    return jsonError("applicationId required", 400);
  } catch (error) {
    return handleRouteError(error);
  }
}
