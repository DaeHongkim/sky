"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, useRecruitAuth } from "@/lib/recruit/client-auth";
import { Badge, Button, Card, Input, Loading, PageHeader, Textarea } from "@/components/recruit/ui";

export default function CompanyMyPage() {
  const { user, loading, refresh, logout } = useRecruitAuth();
  const [form, setForm] = useState({
    companyName: "",
    businessNumber: "",
    representative: "",
    industry: "",
    companySize: "",
    description: "",
    address: "",
    website: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });
  const [status, setStatus] = useState("PENDING");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await api<Record<string, unknown>>("/api/company/profile");
      if (res.ok && res.data) {
        const d = res.data;
        setStatus(String(d.verificationStatus || "PENDING"));
        setForm({
          companyName: String(d.companyName || ""),
          businessNumber: String(d.businessNumber || ""),
          representative: String(d.representative || ""),
          industry: String(d.industry || ""),
          companySize: String(d.companySize || ""),
          description: String(d.description || ""),
          address: String(d.address || ""),
          website: String(d.website || ""),
          contactName: String(d.contactName || ""),
          contactPhone: String(d.contactPhone || ""),
          contactEmail: String(d.contactEmail || ""),
        });
      }
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await api("/api/company/profile", {
      method: "PATCH",
      body: JSON.stringify(form),
    });
    setMsg(res.ok ? "저장되었습니다" : res.error || "실패");
    if (res.ok) await refresh();
  }

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="기업 MY"
        subtitle={user?.email}
        action={
          <Button variant="ghost" onClick={() => void logout()}>
            로그아웃
          </Button>
        }
      />
      <Card>
        <Badge tone={status === "VERIFIED" ? "success" : status === "REJECTED" ? "danger" : "warn"}>
          인증: {status}
        </Badge>
        <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
          <Input label="회사명" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          <Input label="사업자번호" value={form.businessNumber} onChange={(e) => setForm({ ...form, businessNumber: e.target.value })} />
          <Input label="대표자" value={form.representative} onChange={(e) => setForm({ ...form, representative: e.target.value })} />
          <Input label="업종" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <Input label="회사규모" value={form.companySize} onChange={(e) => setForm({ ...form, companySize: e.target.value })} />
          <Textarea label="회사소개" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="주소" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="홈페이지" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input label="담당자명" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          <Input label="담당자 연락처" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          <Input label="담당자 이메일" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          <Button type="submit">저장</Button>
        </form>
        {msg ? <p>{msg}</p> : null}
      </Card>
    </div>
  );
}
