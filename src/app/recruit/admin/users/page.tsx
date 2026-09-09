import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";
import UserStatusControl from "@/components/recruit/UserStatusControl";
import type { Role } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const statusTone: Record<string, "success" | "danger" | "neutral"> = {
  ACTIVE: "success",
  SUSPENDED: "danger",
  WITHDRAWN: "neutral",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; foreigner?: string }>;
}) {
  await requirePageUser(["ADMIN"]);
  const { role, foreigner } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      role: role && role !== "ADMIN" ? (role as Role) : { not: "ADMIN" },
      ...(foreigner === "1" ? { jobSeekerProfile: { nationality: { not: null } } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      jobSeekerProfile: { select: { name: true, nationality: true } },
      companyProfile: { select: { companyName: true } },
    },
  });

  const tabs = [
    { label: "전체", href: "/recruit/admin/users" },
    { label: "구직자", href: "/recruit/admin/users?role=JOB_SEEKER" },
    { label: "외국인 회원", href: "/recruit/admin/users?role=JOB_SEEKER&foreigner=1" },
    { label: "기업회원", href: "/recruit/admin/users?role=COMPANY" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">회원 관리</h1>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link key={t.label} href={t.href}>
            <Badge tone="neutral">{t.label}</Badge>
          </Link>
        ))}
      </div>

      {users.length === 0 ? (
        <EmptyState title="회원이 없습니다." />
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <Card key={u.id} className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">
                  {u.jobSeekerProfile?.name ?? u.companyProfile?.companyName ?? u.email}
                </p>
                <p className="text-sm text-slate-500">
                  {u.email} · {u.role}
                  {u.jobSeekerProfile?.nationality ? ` · ${u.jobSeekerProfile.nationality}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={statusTone[u.status]}>{u.status}</Badge>
                {u.status !== "WITHDRAWN" && (
                  <UserStatusControl userId={u.id} currentStatus={u.status} />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
