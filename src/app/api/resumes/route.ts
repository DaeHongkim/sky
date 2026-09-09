import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { resumeCreateSchema } from "@/lib/resume/validation";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json({ resumes });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { title } = resumeCreateSchema.parse(await request.json());

    const existingCount = await prisma.resume.count({ where: { userId: user.id } });

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title,
        // 첫 이력서는 자동으로 대표 이력서로 지정한다.
        isPrimary: existingCount === 0,
      },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
