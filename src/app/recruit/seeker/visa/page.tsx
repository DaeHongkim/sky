"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/recruit/client-auth";
import { Badge, Button, Card, Input, Loading, PageHeader, Select } from "@/components/recruit/ui";

export default function SeekerVisaPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [disclaimer, setDisclaimer] = useState("");
  const [form, setForm] = useState({
    visaType: "",
    visaStatus: "",
    issueDate: "",
    expiryDate: "",
    employmentAllowed: "unknown",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await api<{
      profile: Record<string, unknown> | null;
      labels: Record<string, string>;
      disclaimer: string;
    }>("/api/visa/profile");
    if (res.ok && res.data) {
      setProfile(res.data.profile);
      setLabels(res.data.labels);
      setDisclaimer(res.data.disclaimer);
      if (res.data.profile) {
        setForm({
          visaType: String(res.data.profile.visaType || ""),
          visaStatus: String(res.data.profile.visaStatus || ""),
          issueDate: res.data.profile.issueDate
            ? String(res.data.profile.issueDate).slice(0, 10)
            : "",
          expiryDate: res.data.profile.expiryDate
            ? String(res.data.profile.expiryDate).slice(0, 10)
            : "",
          employmentAllowed:
            res.data.profile.employmentAllowed === true
              ? "yes"
              : res.data.profile.employmentAllowed === false
                ? "no"
                : "unknown",
        });
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await api("/api/visa/profile", {
      method: "PUT",
      body: JSON.stringify({
        ...form,
        employmentAllowed:
          form.employmentAllowed === "unknown"
            ? null
            : form.employmentAllowed === "yes",
      }),
    });
    setMsg(res.ok ? "저장됨 (공식 확인 필요 상태로 표시)" : res.error || "실패");
    if (res.ok) void load();
  }

  if (loading) return <Loading />;

  const status = String(profile?.verificationStatus || "NEEDS_OFFICIAL_CHECK");

  return (
    <div>
      <PageHeader title="비자 / 외국인 정보" subtitle={disclaimer} />
      <Card>
        <Badge
          tone={
            status === "ADMIN_VERIFIED"
              ? "success"
              : status === "AI_ESTIMATE"
                ? "warn"
                : "accent"
          }
        >
          {labels[status] || status}
        </Badge>
        <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
          <Input label="비자 종류" value={form.visaType} onChange={(e) => setForm({ ...form, visaType: e.target.value })} />
          <Input label="비자 상태" value={form.visaStatus} onChange={(e) => setForm({ ...form, visaStatus: e.target.value })} />
          <Input label="발급일" type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
          <Input label="만료일" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          <Select
            label="취업 가능 여부 (본인 입력)"
            value={form.employmentAllowed}
            onChange={(e) => setForm({ ...form, employmentAllowed: e.target.value })}
          >
            <option value="unknown">모름</option>
            <option value="yes">가능</option>
            <option value="no">불가</option>
          </Select>
          <Button type="submit">저장</Button>
        </form>
        {msg ? <p>{msg}</p> : null}
        <p style={{ fontSize: "0.8rem", color: "var(--hr-muted)" }}>
          AI가 비자 적법성을 최종 판단하지 않습니다. D-90/60/30/14/7 만료 알림은 알림 시스템과 연동됩니다.
        </p>
      </Card>
    </div>
  );
}
