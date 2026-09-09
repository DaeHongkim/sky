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

const companySchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  businessNumber: z.string().max(50).optional(),
  representative: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  companySize: z.string().max(50).optional(),
  description: z.string().max(10000).optional(),
  address: z.string().max(300).optional(),
  website: z.string().max(300).optional(),
  contactName: z.string().max(100).optional(),
  contactPhone: z.string().max(40).optional(),
  contactEmail: z.string().email().optional(),
  logoUrl: z.string().max(1000).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [
      Role.COMPANY,
      Role.ADMIN,
      Role.SUPER_ADMIN,
    ]);
    const profile = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    return jsonOk(profile);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.COMPANY]);
    const body = await parseJson(request, companySchema);
    const existing = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    if (!existing) {
      const err = new Error("COMPANY_PROFILE_MISSING");
      (err as Error & { status: number }).status = 404;
      throw err;
    }
    const profile = await prisma.companyProfile.update({
      where: { userId: user.id },
      data: body,
    });
    return jsonOk(profile);
  } catch (e) {
    return handleRouteError(e);
  }
}
