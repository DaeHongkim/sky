import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { jobPostUpsertSchema } from "@/lib/validation";

function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "1";
    const keyword = searchParams.get("keyword")?.trim();
    const jobCategory = searchParams.get("jobCategory")?.trim();
    const location = searchParams.get("location")?.trim();
    const employmentType = searchParams.get("employmentType")?.trim();
    const foreignerAllowed = searchParams.get("foreignerAllowed");
    const housingSupport = searchParams.get("housingSupport");
    const mealSupport = searchParams.get("mealSupport");
    const salaryMin = searchParams.get("salaryMin");
    const sort = searchParams.get("sort") || "latest";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 20)));

    if (mine) {
      const user = await requireUser([Role.COMPANY]);
      const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
      if (!company) return jsonOk({ items: [], total: 0 });
      const items = await prisma.jobPost.findMany({
        where: { companyId: company.id },
        orderBy: { updatedAt: "desc" },
        include: { company: { select: { companyName: true, logoUrl: true, verificationStatus: true } } },
      });
      return jsonOk({ items, total: items.length });
    }

    const where: Prisma.JobPostWhereInput = {
      status: "OPEN",
      AND: [
        keyword
          ? {
              OR: [
                { title: { contains: keyword, mode: "insensitive" } },
                { description: { contains: keyword, mode: "insensitive" } },
                { jobCategory: { contains: keyword, mode: "insensitive" } },
              ],
            }
          : {},
        jobCategory ? { jobCategory: { contains: jobCategory, mode: "insensitive" } } : {},
        location ? { workLocation: { contains: location, mode: "insensitive" } } : {},
        employmentType ? { employmentType: { contains: employmentType, mode: "insensitive" } } : {},
        foreignerAllowed === "1" ? { foreignerAllowed: true } : {},
        housingSupport === "1" ? { housingSupport: true } : {},
        mealSupport === "1" ? { mealSupport: true } : {},
        salaryMin ? { salaryMax: { gte: Number(salaryMin) } } : {},
      ],
    };

    let orderBy: Prisma.JobPostOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "deadline") orderBy = { deadline: "asc" };
    if (sort === "salary") orderBy = { salaryMax: "desc" };
    if (sort === "recommend") orderBy = { views: "desc" };

    const [total, items] = await Promise.all([
      prisma.jobPost.count({ where }),
      prisma.jobPost.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
    ]);

    return jsonOk({ items, total, page, pageSize });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!company) {
      const err = new Error("FORBIDDEN") as Error & { status: number };
      err.status = 403;
      throw err;
    }

    const body = jobPostUpsertSchema.parse(await request.json());
    const job = await prisma.jobPost.create({
      data: {
        companyId: company.id,
        title: body.title,
        jobCategory: body.jobCategory,
        description: body.description,
        responsibilities: body.responsibilities,
        requirements: body.requirements,
        preferredConditions: body.preferredConditions,
        employmentType: body.employmentType,
        salaryType: body.salaryType,
        salaryMin: body.salaryMin,
        salaryMax: body.salaryMax,
        workLocation: body.workLocation,
        workDays: body.workDays,
        workHours: body.workHours,
        breakTime: body.breakTime,
        recruitmentCount: body.recruitmentCount ?? 1,
        deadline: parseDate(body.deadline),
        foreignerAllowed: body.foreignerAllowed ?? false,
        visaConditions: body.visaConditions,
        koreanLevel: body.koreanLevel,
        housingSupport: body.housingSupport ?? false,
        mealSupport: body.mealSupport ?? false,
        transportationSupport: body.transportationSupport ?? false,
        educationRequirement: body.educationRequirement,
        careerRequirement: body.careerRequirement,
        status: body.status ?? "DRAFT",
      },
    });

    return jsonOk(job, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
