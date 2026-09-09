import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { jobPostCreateSchema } from "@/lib/jobpost/validation";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await requireUser(["COMPANY"]);
    const jobs = await prisma.jobPost.findMany({
      where: { companyId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ jobs });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(["COMPANY"]);
    const input = jobPostCreateSchema.parse(await request.json());

    const job = await prisma.jobPost.create({
      data: {
        ...input,
        companyId: user.id,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
