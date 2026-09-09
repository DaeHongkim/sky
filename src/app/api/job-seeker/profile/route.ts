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

const seekerSchema = z.object({
  name: z.string().max(100).optional(),
  phone: z.string().max(40).optional(),
  birthDate: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNSPECIFIED"]).optional(),
  residenceRegion: z.string().max(100).optional(),
  desiredWorkRegion: z.string().max(100).optional(),
  desiredJobCategory: z.string().max(100).optional(),
  desiredSalary: z.number().int().nonnegative().optional().nullable(),
  desiredEmploymentType: z.string().max(100).optional(),
  availableDate: z.string().optional().nullable(),
  introduction: z.string().max(5000).optional(),
  skills: z.string().max(2000).optional(),
  careerYears: z.number().int().nonnegative().optional().nullable(),
  languages: z.string().max(500).optional(),
  nationality: z.string().max(100).optional(),
  koreaResident: z.boolean().optional(),
  nativeLanguage: z.string().max(50).optional(),
  currentCountry: z.string().max(100).optional(),
  koreaLocation: z.string().max(100).optional(),
  koreanLevel: z.string().max(50).optional(),
  englishLevel: z.string().max(50).optional(),
  preferredLanguage: z.string().max(20).optional(),
  autoTranslateEnabled: z.boolean().optional(),
  photoUrl: z.string().max(1000).optional().nullable(),
});

function parseDate(v?: string | null) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.JOB_SEEKER, Role.ADMIN, Role.SUPER_ADMIN]);
    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId: user.id },
    });
    return jsonOk(profile);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const body = await parseJson(request, seekerSchema);
    const profile = await prisma.jobSeekerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...body,
        birthDate: parseDate(body.birthDate),
        availableDate: parseDate(body.availableDate),
      },
      update: {
        ...body,
        birthDate: body.birthDate === null ? null : parseDate(body.birthDate),
        availableDate:
          body.availableDate === null ? null : parseDate(body.availableDate),
      },
    });
    if (body.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: body.name },
      });
    }
    return jsonOk(profile);
  } catch (e) {
    return handleRouteError(e);
  }
}
