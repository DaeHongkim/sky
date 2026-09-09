"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, useRecruitAuth } from "@/lib/recruit/client-auth";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Loading,
  PageHeader,
  Select,
} from "@/components/recruit/ui";

type Job = {
  id: string;
  title: string;
  description?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  preferredConditions?: string | null;
  employmentType?: string | null;
  salaryType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  workLocation?: string | null;
  workDays?: string | null;
  workHours?: string | null;
  foreignerAllowed?: boolean;
  visaConditions?: string | null;
  koreanLevel?: string | null;
  housingSupport?: boolean;
  mealSupport?: boolean;
  transportationSupport?: boolean;
  deadline?: string | null;
  views?: number;
  company?: {
    id: string;
    companyName: string;
    description?: string | null;
    address?: string | null;
    website?: string | null;
    verificationStatus?: string;
  };
};

type Resume = { id: string; title: string; isPrimary: boolean };

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useRecruitAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [translated, setTranslated] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await api<Job>(`/api/job-posts/${params.id}`);
      if (res.ok && res.data) setJob(res.data);
      setLoading(false);
    })();
  }, [params.id]);

  useEffect(() => {
    if (user?.role !== "JOB_SEEKER") return;
    void (async () => {
      const res = await api<Resume[]>("/api/resumes");
      if (res.ok && res.data) {
        setResumes(res.data);
        const primary = res.data.find((r) => r.isPrimary) || res.data[0];
        if (primary) setResumeId(primary.id);
      }
    })();
  }, [user]);

  async function apply() {
    if (!user) {
      router.push("/recruit/auth/login");
      return;
    }
    if (!resumeId) {
      setToast("이력서를 선택하세요");
      return;
    }
    const res = await api(`/api/job-posts/${params.id}/apply`, {
      method: "POST",
      body: JSON.stringify({ resumeId }),
    });
    setToast(res.ok ? "지원이 완료되었습니다" : res.error || "지원 실패");
  }

  async function scrap() {
    if (!user) {
      router.push("/recruit/auth/login");
      return;
    }
    const res = await api("/api/job-scraps", {
      method: "POST",
      body: JSON.stringify({ jobPostId: params.id }),
    });
    setToast(res.ok ? "스크랩했습니다" : res.error || "실패");
  }

  async function translate() {
    if (!job?.description) return;
    const res = await api<{ translatedText: string }>("/api/translations", {
      method: "POST",
      body: JSON.stringify({
        text: job.description,
        targetLang: "en",
        contextType: "job_post",
      }),
    });
    if (res.ok && res.data) setTranslated(res.data.translatedText);
    else setToast(res.error || "번역 실패");
  }

  function share() {
    const url = window.location.href;
    if (navigator.share) {
      void navigator.share({ title: job?.title, url });
    } else {
      void navigator.clipboard.writeText(url);
      setToast("링크가 복사되었습니다");
    }
  }

  if (loading) return <Loading />;
  if (!job) return <EmptyState title="공고를 찾을 수 없습니다" />;

  return (
    <div>
      <PageHeader
        title={job.title}
        subtitle={job.company?.companyName}
        action={<Badge tone="accent">{job.views ?? 0} views</Badge>}
      />

      <Card>
        <div className="hr-meta" style={{ marginBottom: 12 }}>
          <span>{job.workLocation || "지역 미정"}</span>
          <span>{job.employmentType || "-"}</span>
          <span>
            {job.salaryMin || job.salaryMax
              ? `${job.salaryType || ""} ${job.salaryMin ?? ""}~${job.salaryMax ?? ""}`
              : "급여 협의"}
          </span>
          {job.deadline ? <span>마감 {new Date(job.deadline).toLocaleDateString()}</span> : null}
        </div>
        <div className="hr-meta" style={{ marginBottom: 16 }}>
          {job.foreignerAllowed ? <Badge tone="accent">외국인 가능</Badge> : null}
          {job.visaConditions ? <Badge>비자: {job.visaConditions}</Badge> : null}
          {job.koreanLevel ? <Badge>한국어 {job.koreanLevel}</Badge> : null}
          {job.housingSupport ? <Badge tone="success">숙소</Badge> : null}
          {job.mealSupport ? <Badge tone="success">식사</Badge> : null}
          {job.transportationSupport ? <Badge tone="success">교통</Badge> : null}
        </div>

        <h3>근무조건 / 담당업무</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{job.responsibilities || "-"}</p>
        <h3>공고 내용</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{job.description || "-"}</p>
        <h3>지원자격</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{job.requirements || "-"}</p>
        {translated ? (
          <>
            <h3>번역 (EN)</h3>
            <p style={{ whiteSpace: "pre-wrap", color: "var(--hr-muted)" }}>{translated}</p>
          </>
        ) : null}

        <h3>회사정보</h3>
        <p>{job.company?.description || "소개 없음"}</p>
        <p className="hr-meta">
          <span>{job.company?.address}</span>
          {job.company?.website ? (
            <a href={job.company.website} target="_blank" rel="noreferrer">
              홈페이지
            </a>
          ) : null}
        </p>
      </Card>

      {user?.role === "JOB_SEEKER" ? (
        <Card style={{ marginTop: 12 }}>
          {resumes.length > 1 ? (
            <Select
              label="지원할 이력서 선택"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                  {r.isPrimary ? " (대표)" : ""}
                </option>
              ))}
            </Select>
          ) : resumes.length === 1 ? (
            <p style={{ fontSize: "0.9rem" }}>이력서: {resumes[0].title}</p>
          ) : (
            <p>
              이력서가 없습니다.{" "}
              <Link href="/recruit/seeker/resumes">이력서 작성</Link>
            </p>
          )}
        </Card>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        <Button onClick={() => void apply()}>지원하기</Button>
        <Button variant="secondary" onClick={() => void scrap()}>
          스크랩
        </Button>
        <Button variant="ghost" onClick={share}>
          공유
        </Button>
        <Button variant="ghost" onClick={() => void translate()}>
          번역
        </Button>
      </div>

      {toast ? <div className="hr-toast">{toast}</div> : null}
    </div>
  );
}
