import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

const seekerSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  residenceRegion: z.string().optional().nullable(),
  desiredWorkRegions: z.array(z.string()).optional(),
  desiredJobCategories: z.array(z.string()).optional(),
  desiredSalaryMin: z.number().int().optional().nullable(),
  desiredSalaryMax: z.number().int().optional().nullable(),
  desiredEmploymentTypes: z.array(z.string()).optional(),
  availableDate: z.string().optional().nullable(),
  introduction: z.string().optional().nullable(),
  skills: z.array(z.string()).optional(),
  careerYears: z.number().int().optional(),
  languages: z.array(z.string()).optional(),
  nationality: z.string().optional().nullable(),
  koreaResident: z.boolean().optional(),
  nativeLanguage: z.string().optional().nullable(),
  currentCountry: z.string().optional().nullable(),
  koreaLocation: z.string().optional().nullable(),
  koreanLevel: z.string().optional().nullable(),
  englishLevel: z.string().optional().nullable(),
  preferredLanguage: z.string().optional(),
  autoTranslateEnabled: z.boolean().optional(),
  birthDate: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNSPECIFIED"]).optional(),
});

export async function GET() {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId: user.id } });
    const visa = await prisma.visaProfile.findUnique({ where: { userId: user.id } });
    return jsonOk({ profile, visa });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const body = seekerSchema.parse(await request.json());
    const profile = await prisma.jobSeekerProfile.update({
      where: { userId: user.id },
      data: {
        ...body,
        birthDate: body.birthDate ? new Date(body.birthDate) : body.birthDate === null ? null : undefined,
        availableDate: body.availableDate
          ? new Date(body.availableDate)
          : body.availableDate === null
            ? null
            : undefined,
      },
    });
    if (body.name) {
      await prisma.user.update({ where: { id: user.id }, data: { name: body.name } });
    }
    return jsonOk(profile);
  } catch (error) {
    return handleRouteError(error);
  }
}
