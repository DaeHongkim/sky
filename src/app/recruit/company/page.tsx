"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, useRecruitAuth } from "@/lib/recruit/client-auth";
import { Card, Loading, PageHeader } from "@/components/recruit/ui";

type Dash = {
  openJobs: number;
  todayApplicants: number;
  newApplicants: number;
  upcomingInterviews: number;
  hired: number;
  closingSoon: number;
  scoutResponses: number;
  recentApplicants: Array<{
    id: string;
    status: string;
    jobSeeker?: { name?: string | null; jobSeekerProfile?: { name?: string | null } | null };
    jobPost?: { title: string };
  }>;
};

export default function CompanyDashboardPage() {
  const { user, loading } = useRecruitAuth();
  const router = useRouter();
  const [dash, setDash] = useState<Dash | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "COMPANY")) {
      router.replace("/recruit/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    void (async () => {
      const res = await api<Dash>("/api/company/dashboard");
      if (res.ok && res.data) setDash(res.data);
    })();
  }, []);

  if (loading || !dash) return <Loading />;

  const stats = [
    { label: "진행중 공고", value: dash.openJobs },
    { label: "오늘 지원자", value: dash.todayApplicants },
    { label: "신규 지원자", value: dash.newApplicants },
    { label: "면접예정", value: dash.upcomingInterviews },
    { label: "채용확정", value: dash.hired },
    { label: "마감예정", value: dash.closingSoon },
    { label: "스카우트 응답", value: dash.scoutResponses },
  ];

  return (
    <div>
      <div className="hr-hero">
        <h2>HIHONG RECRUIT</h2>
        <p>{user?.companyProfile?.companyName || "기업"} 채용 대시보드</p>
        <div className="hr-hero-actions">
          <Link href="/recruit/company/jobs">
            <button className="hr-btn hr-btn-primary">공고 등록/관리</button>
          </Link>
          <Link href="/recruit/company/talents">
            <button className="hr-btn hr-btn-ghost">인재검색</button>
          </Link>
        </div>
      </div>

      <div className="hr-stats" style={{ marginBottom: 16 }}>
        {stats.map((s) => (
          <div key={s.label} className="hr-stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <PageHeader title="최근 지원자" />
      <div className="hr-grid">
        {dash.recentApplicants.map((a) => (
          <Card key={a.id}>
            <div className="hr-meta">
              <span>{a.status}</span>
              <span>{a.jobPost?.title}</span>
            </div>
            <strong>
              {a.jobSeeker?.jobSeekerProfile?.name || a.jobSeeker?.name || "지원자"}
            </strong>
          </Card>
        ))}
      </div>
    </div>
  );
}
