import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { seekerProfileUpdateSchema } from "@/lib/resume/profile-validation";
import { errorResponse } from "@/lib/api/respond";

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const input = seekerProfileUpdateSchema.parse(await request.json());

    const profile = await prisma.jobSeekerProfile.upsert({
      where: { userId: user.id },
      update: { ...input, profileImageUrl: input.profileImageUrl || null },
      create: { userId: user.id, ...input, profileImageUrl: input.profileImageUrl || null },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return errorResponse(error);
  }
}
