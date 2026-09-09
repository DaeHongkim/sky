"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, useRecruitAuth } from "@/lib/recruit/client-auth";
import { Badge, Button, Card, Loading, PageHeader, Select } from "@/components/recruit/ui";

export default function AdminPage() {
  const { user, loading } = useRecruitAuth();
  const router = useRouter();
  const [overview, setOverview] = useState<Record<string, number> | null>(null);
  const [companies, setCompanies] = useState<
    Array<{ id: string; companyName: string; verificationStatus: string }>
  >([]);
  const [visas, setVisas] = useState<
    Array<{ id: string; verificationStatus: string; user?: { email: string } }>
  >([]);

  useEffect(() => {
    if (!loading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/recruit");
    }
  }, [user, loading, router]);

  async function load() {
    const ov = await api<Record<string, number>>("/api/admin?section=overview");
    if (ov.ok && ov.data) setOverview(ov.data);
    const co = await api<typeof companies>("/api/admin?section=companies");
    if (co.ok && co.data) setCompanies(co.data);
    const vi = await api<typeof visas>("/api/admin?section=visas");
    if (vi.ok && vi.data) setVisas(vi.data);
  }

  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") void load();
  }, [user]);

  if (loading || !overview) return <Loading />;

  return (
    <div>
      <PageHeader title="관리자" subtitle="서버 권한 검증 기반 관리 콘솔" />
      <div className="hr-stats" style={{ marginBottom: 16 }}>
        {Object.entries(overview).map(([k, v]) => (
          <div key={k} className="hr-stat">
            <strong>{v}</strong>
            <span>{k}</span>
          </div>
        ))}
      </div>

      <PageHeader title="기업 인증" />
      <div className="hr-grid">
        {companies.map((c) => (
          <Card key={c.id}>
            <div className="hr-meta">
              <Badge>{c.verificationStatus}</Badge>
            </div>
            <h3>{c.companyName}</h3>
            <Select
              label="인증 상태 변경"
              value={c.verificationStatus}
              onChange={async (e) => {
                await api("/api/admin?action=verify-company", {
                  method: "PATCH",
                  body: JSON.stringify({
                    companyId: c.id,
                    status: e.target.value,
                  }),
                });
                void load();
              }}
            >
              <option value="PENDING">PENDING</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
            </Select>
          </Card>
        ))}
      </div>

      <PageHeader title="비자 검토" />
      <div className="hr-grid">
        {visas.map((v) => (
          <Card key={v.id}>
            <p>{v.user?.email}</p>
            <Badge>{v.verificationStatus}</Badge>
            <Select
              label="확인 상태"
              value={v.verificationStatus}
              onChange={async (e) => {
                await api("/api/admin?action=verify-visa", {
                  method: "PATCH",
                  body: JSON.stringify({
                    visaProfileId: v.id,
                    status: e.target.value,
                  }),
                });
                void load();
              }}
            >
              <option value="AI_ESTIMATE">AI 예상</option>
              <option value="NEEDS_OFFICIAL_CHECK">공식 확인 필요</option>
              <option value="ADMIN_VERIFIED">관리자 확인 완료</option>
            </Select>
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: 12 }}>
        <Button
          variant="secondary"
          onClick={async () => {
            await api("/api/visa/expiry-check", { method: "POST" });
            alert("비자 만료 알림 체크 실행");
          }}
        >
          비자 만료 알림 실행
        </Button>
      </Card>
    </div>
  );
}
