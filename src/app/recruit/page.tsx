"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, useRecruitAuth } from "@/lib/recruit/client-auth";
import { Badge, Button, Card, Loading } from "@/components/recruit/ui";

type Job = {
  id: string;
  title: string;
  workLocation?: string | null;
  employmentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  foreignerAllowed?: boolean;
  company?: { companyName: string };
};

export default function RecruitHomePage() {
  const { user, loading } = useRecruitAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await api<Job[]>("/api/job-posts?sort=latest");
      if (res.ok && res.data) setJobs(res.data.slice(0, 6));
      setJobsLoading(false);
    })();
  }, []);

  if (loading) return <Loading />;

  if (user?.role === "COMPANY") {
    return (
      <div>
        <div className="hr-hero">
          <h2>HIHONG RECRUIT</h2>
          <p>인재 채용부터 계약·채용확정까지, 기업 채용 운영을 한곳에서.</p>
          <div className="hr-hero-actions">
            <Link href="/recruit/company">
              <Button>기업 대시보드</Button>
            </Link>
            <Link href="/recruit/company/jobs">
              <Button variant="ghost">공고 관리</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="hr-hero">
        <Badge tone="accent">채용 플랫폼</Badge>
        <h2 style={{ marginTop: 10 }}>HIHONG RECRUIT</h2>
        <p>
          이력서 작성부터 지원, 면접, Offer, 전자근로계약까지 — 구직과 채용의
          전 과정을 하나의 서비스에서.
        </p>
        <div className="hr-hero-actions">
          {user ? (
            <>
              <Link href="/recruit/jobs">
                <Button>채용공고 보기</Button>
              </Link>
              <Link href="/recruit/seeker/resumes">
                <Button variant="ghost">이력서 관리</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/recruit/auth/signup">
                <Button>회원가입</Button>
              </Link>
              <Link href="/recruit/auth/login">
                <Button variant="ghost">로그인</Button>
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="hr-page-header">
        <div>
          <h1>추천 채용공고</h1>
          <p>최근 게시된 공고를 확인해 보세요</p>
        </div>
        <Link href="/recruit/jobs">
          <Button variant="ghost">전체보기</Button>
        </Link>
      </div>

      {jobsLoading ? (
        <Loading />
      ) : (
        <div className="hr-grid hr-grid-2">
          {jobs.map((job) => (
            <Link key={job.id} href={`/recruit/jobs/${job.id}`} className="hr-job-item hr-card">
              <div className="hr-meta">
                <span>{job.company?.companyName || "기업"}</span>
                {job.foreignerAllowed ? <Badge tone="accent">외국인 가능</Badge> : null}
              </div>
              <h3>{job.title}</h3>
              <div className="hr-meta">
                <span>{job.workLocation || "지역 미정"}</span>
                <span>{job.employmentType || "고용형태 미정"}</span>
                <span>
                  {job.salaryMin || job.salaryMax
                    ? `${job.salaryMin ?? 0}~${job.salaryMax ?? ""}만원`
                    : "급여 협의"}
                </span>
              </div>
            </Link>
          ))}
          {!jobs.length ? (
            <Card>
              <p style={{ color: "var(--hr-muted)", margin: 0 }}>
                아직 게시된 공고가 없습니다. 기업 회원으로 공고를 등록해 보세요.
              </p>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
