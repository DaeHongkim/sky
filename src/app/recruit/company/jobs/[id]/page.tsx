import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import JobPostForm, { type JobPostFormValues } from "@/components/recruit/JobPostForm";
import JobActions from "@/components/recruit/JobActions";
import Badge from "@/components/recruit/ui/Badge";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  DRAFT: "임시저장",
  OPEN: "게시중",
  CLOSED: "마감",
  EXPIRED: "기간만료",
};

export default async function EditJobPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser(["COMPANY"]);
  const { id } = await params;

  const job = await prisma.jobPost.findUnique({ where: { id } });
  if (!job || job.companyId !== user.id) notFound();

  const initial: JobPostFormValues = {
    title: job.title,
    jobCategory: job.jobCategory,
    description: job.description,
    responsibilities: job.responsibilities ?? "",
    requirements: job.requirements ?? "",
    preferredConditions: job.preferredConditions ?? "",
    employmentType: job.employmentType,
    salaryType: job.salaryType,
    salaryMin: job.salaryMin?.toString() ?? "",
    salaryMax: job.salaryMax?.toString() ?? "",
    workLocation: job.workLocation,
    workDays: job.workDays ?? "",
    workHours: job.workHours ?? "",
    breakTime: job.breakTime ?? "",
    recruitmentCount: job.recruitmentCount?.toString() ?? "",
    deadline: job.deadline?.toISOString().slice(0, 10) ?? "",
    foreignerAllowed: job.foreignerAllowed,
    visaConditionsText: job.visaConditions.join(", "),
    koreanLevel: job.koreanLevel ?? "",
    housingSupport: job.housingSupport,
    mealSupport: job.mealSupport,
    transportationSupport: job.transportationSupport,
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">채용공고 편집</h1>
        <Badge tone="neutral">{statusLabel[job.status]}</Badge>
      </div>
      <div className="mb-4">
        <JobActions jobId={job.id} status={job.status} />
      </div>
      <JobPostForm initial={initial} mode="edit" jobId={job.id} />
    </div>
  );
}
