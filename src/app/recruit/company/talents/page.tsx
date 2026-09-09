"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Loading,
  PageHeader,
  Textarea,
} from "@/components/recruit/ui";

type Talent = {
  id: string;
  userId: string;
  title: string;
  desiredJob?: string | null;
  desiredLocation?: string | null;
  desiredSalary?: number | null;
  user?: {
    id: string;
    jobSeekerProfile?: {
      name?: string | null;
      nationality?: string | null;
      careerYears?: number | null;
      koreanLevel?: string | null;
    } | null;
  };
};

export default function CompanyTalentsPage() {
  const [rows, setRows] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobCategory, setJobCategory] = useState("");
  const [region, setRegion] = useState("");
  const [scoutTitle, setScoutTitle] = useState("스카우트 제안");
  const [scoutMessage, setScoutMessage] = useState("귀하의 이력서에 관심이 있습니다.");

  async function load() {
    setLoading(true);
    const p = new URLSearchParams();
    if (jobCategory) p.set("jobCategory", jobCategory);
    if (region) p.set("region", region);
    const res = await api<Talent[]>(`/api/talents?${p.toString()}`);
    if (res.ok && res.data) setRows(res.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    void load();
  }

  return (
    <div>
      <PageHeader title="인재검색" subtitle="공개 설정된 인재만 검색됩니다. 상세 열람은 로그에 남습니다." />
      <Card>
        <form onSubmit={onSearch} className="hr-grid hr-grid-2">
          <Input label="직종" value={jobCategory} onChange={(e) => setJobCategory(e.target.value)} />
          <Input label="지역" value={region} onChange={(e) => setRegion(e.target.value)} />
          <Button type="submit">검색</Button>
        </form>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Input label="스카우트 제목" value={scoutTitle} onChange={(e) => setScoutTitle(e.target.value)} />
        <Textarea label="스카우트 메시지" value={scoutMessage} onChange={(e) => setScoutMessage(e.target.value)} />
      </Card>

      {loading ? (
        <Loading />
      ) : rows.length ? (
        <div className="hr-grid" style={{ marginTop: 12 }}>
          {rows.map((t) => (
            <Card key={t.id}>
              <div className="hr-meta">
                <Badge>{t.user?.jobSeekerProfile?.name || "비공개"}</Badge>
                <span>{t.user?.jobSeekerProfile?.nationality || "-"}</span>
                <span>경력 {t.user?.jobSeekerProfile?.careerYears ?? "-"}년</span>
              </div>
              <h3>{t.title}</h3>
              <p className="hr-meta">
                <span>{t.desiredJob}</span>
                <span>{t.desiredLocation}</span>
                <span>{t.desiredSalary ? `${t.desiredSalary}만원` : "급여 협의"}</span>
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await api(`/api/talents/${t.userId}`);
                    alert("상세 열람 로그가 저장되었습니다");
                  }}
                >
                  상세 열람
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await api("/api/talent-bookmarks", {
                      method: "POST",
                      body: JSON.stringify({ jobSeekerId: t.userId }),
                    });
                  }}
                >
                  인재 스크랩
                </Button>
                <Button
                  onClick={async () => {
                    await api("/api/scout-offers", {
                      method: "POST",
                      body: JSON.stringify({
                        jobSeekerId: t.userId,
                        title: scoutTitle,
                        message: scoutMessage,
                      }),
                    });
                    alert("스카우트를 보냈습니다");
                  }}
                >
                  스카우트
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="공개 인재가 없습니다" description="구직자가 이력서를 공개·완료로 설정해야 검색됩니다" />
      )}
    </div>
  );
}
