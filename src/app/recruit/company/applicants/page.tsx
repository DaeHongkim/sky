"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Loading,
  PageHeader,
  Select,
  Textarea,
} from "@/components/recruit/ui";

type AppRow = {
  id: string;
  status: string;
  memo?: string | null;
  jobPost?: { id: string; title: string };
  jobSeeker?: {
    id: string;
    name?: string | null;
    email?: string;
    jobSeekerProfile?: {
      name?: string | null;
      nationality?: string | null;
      careerYears?: number | null;
    } | null;
  };
  resume?: { id: string; title: string };
};

const STATUSES = [
  "APPLIED",
  "DOCUMENT_REVIEW",
  "INTERVIEW_REQUESTED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_COMPLETED",
  "OFFER",
  "HIRED",
  "REJECTED",
];

export default function CompanyApplicantsPage() {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerSalary, setOfferSalary] = useState("300");
  const [contractText, setContractText] = useState(
    "근로계약 초안입니다. 근무조건 및 급여는 Offer에 따릅니다.",
  );

  async function load() {
    const res = await api<AppRow[]>("/api/applications");
    if (res.ok && res.data) setRows(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="지원자 파이프라인" subtitle="단계 변경 · 면접 · Offer · 계약 · 채용확정" />
      {rows.length ? (
        <div className="hr-grid">
          {rows.map((r) => (
            <Card key={r.id}>
              <div className="hr-meta">
                <Badge tone="accent">{r.status}</Badge>
                <span>{r.jobPost?.title}</span>
              </div>
              <h3>
                {r.jobSeeker?.jobSeekerProfile?.name || r.jobSeeker?.name || "지원자"}
              </h3>
              <p className="hr-meta">
                <span>{r.jobSeeker?.jobSeekerProfile?.nationality || "-"}</span>
                <span>경력 {r.jobSeeker?.jobSeekerProfile?.careerYears ?? "-"}년</span>
                <span>이력서: {r.resume?.title}</span>
              </p>

              <Select
                label="단계 변경"
                value={r.status}
                onChange={async (e) => {
                  await api(`/api/applications/${r.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ status: e.target.value }),
                  });
                  void load();
                }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await api("/api/interviews", {
                      method: "POST",
                      body: JSON.stringify({
                        applicationId: r.id,
                        interviewType: "ONLINE",
                        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
                      }),
                    });
                    void load();
                  }}
                >
                  면접 요청
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await api("/api/ai-pre-interviews", {
                      method: "POST",
                      body: JSON.stringify({ applicationId: r.id }),
                    });
                    alert("AI 사전면접이 생성되었습니다 (참고용, 자동탈락 없음)");
                  }}
                >
                  AI 사전면접
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await api("/api/job-offers", {
                      method: "POST",
                      body: JSON.stringify({
                        applicationId: r.id,
                        salary: Number(offerSalary),
                        employmentType: "정규직",
                        workLocation: "협의",
                        message: "합격을 축하드립니다.",
                      }),
                    });
                    void load();
                  }}
                >
                  Offer 발송
                </Button>
                <Button
                  onClick={async () => {
                    const created = await api<{ id: string }>("/api/contracts", {
                      method: "POST",
                      body: JSON.stringify({
                        applicationId: r.id,
                        title: "근로계약서",
                        contentOriginal: contractText,
                        contentTranslated: `[en] ${contractText}`,
                        translationLang: "en",
                      }),
                    });
                    if (created.ok && created.data) {
                      await api(`/api/contracts/${created.data.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ action: "SEND" }),
                      });
                    }
                    void load();
                  }}
                >
                  계약 발송
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    await api(`/api/applications/${r.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ status: "HIRED" }),
                    });
                    void load();
                  }}
                >
                  채용확정
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="지원자가 없습니다" />
      )}

      <Card style={{ marginTop: 12 }}>
        <Input
          label="Offer 급여(만원)"
          value={offerSalary}
          onChange={(e) => setOfferSalary(e.target.value)}
        />
        <Textarea
          label="계약 초안"
          value={contractText}
          onChange={(e) => setContractText(e.target.value)}
        />
      </Card>
    </div>
  );
}
