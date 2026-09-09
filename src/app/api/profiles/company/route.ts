import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

const companySchema = z.object({
  companyName: z.string().min(1).optional(),
  businessNumber: z.string().optional().nullable(),
  representative: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  companySize: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireUser([Role.COMPANY]);
    const profile = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return jsonError("NOT_FOUND", 404);
    return jsonOk(profile);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser([Role.COMPANY]);
    const body = companySchema.parse(await request.json());
    const profile = await prisma.companyProfile.update({
      where: { userId: user.id },
      data: body,
    });
    return jsonOk(profile);
  } catch (error) {
    return handleRouteError(error);
  }
}
