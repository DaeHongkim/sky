import { NextRequest } from "next/server";
import { JobPostStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonCreated,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";
import { jobPostSchema } from "@/lib/recruit/validators";

function parseDate(v?: string) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") || undefined;
    const jobCategory = searchParams.get("jobCategory") || undefined;
    const workLocation = searchParams.get("workLocation") || undefined;
    const employmentType = searchParams.get("employmentType") || undefined;
    const foreignerAllowed = searchParams.get("foreignerAllowed");
    const housingSupport = searchParams.get("housingSupport");
    const mealSupport = searchParams.get("mealSupport");
    const koreanLevel = searchParams.get("koreanLevel") || undefined;
    const visa = searchParams.get("visa") || undefined;
    const salaryMin = searchParams.get("salaryMin");
    const sort = searchParams.get("sort") || "latest";
    const mine = searchParams.get("mine") === "1";
    const statusParam = searchParams.get("status");

    let companyId: string | undefined;
    if (mine) {
      const { user } = await requireAuth(request, [Role.COMPANY]);
      const company = await prisma.companyProfile.findUnique({
        where: { userId: user.id },
      });
      if (!company) return jsonOk([]);
      companyId = company.id;
    }

    const where = {
      ...(companyId
        ? { companyId }
        : { status: JobPostStatus.OPEN }),
      ...(statusParam && companyId
        ? { status: statusParam as JobPostStatus }
        : {}),
      ...(jobCategory ? { jobCategory: { contains: jobCategory } } : {}),
      ...(workLocation ? { workLocation: { contains: workLocation } } : {}),
      ...(employmentType ? { employmentType } : {}),
      ...(foreignerAllowed === "1" ? { foreignerAllowed: true } : {}),
      ...(housingSupport === "1" ? { housingSupport: true } : {}),
      ...(mealSupport === "1" ? { mealSupport: true } : {}),
      ...(koreanLevel ? { koreanLevel } : {}),
      ...(visa ? { visaConditions: { contains: visa } } : {}),
      ...(salaryMin
        ? { salaryMax: { gte: Number(salaryMin) } }
        : {}),
      ...(keyword
        ? {
            OR: [
              { title: { contains: keyword } },
              { description: { contains: keyword } },
              { jobCategory: { contains: keyword } },
              { workLocation: { contains: keyword } },
            ],
          }
        : {}),
    };

    const orderBy =
      sort === "deadline"
        ? { deadline: "asc" as const }
        : sort === "salary"
          ? { salaryMax: "desc" as const }
          : sort === "recommend"
            ? { views: "desc" as const }
            : { createdAt: "desc" as const };

    const posts = await prisma.jobPost.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            verificationStatus: true,
            industry: true,
            address: true,
          },
        },
      },
      orderBy,
      take: 100,
    });
    return jsonOk(posts);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    if (!company) {
      const err = new Error("COMPANY_PROFILE_MISSING");
      (err as Error & { status: number }).status = 400;
      throw err;
    }
    const body = await parseJson(request, jobPostSchema);
    const post = await prisma.jobPost.create({
      data: {
        companyId: company.id,
        ...body,
        deadline: parseDate(body.deadline),
        status: body.status || "DRAFT",
      },
    });
    return jsonCreated(post);
  } catch (e) {
    return handleRouteError(e);
  }
}
