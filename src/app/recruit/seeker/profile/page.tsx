"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, useRecruitAuth } from "@/lib/recruit/client-auth";
import { Button, Card, Input, Loading, PageHeader, Select, Textarea } from "@/components/recruit/ui";

export default function SeekerProfilePage() {
  const { user, loading, refresh } = useRecruitAuth();
  const [form, setForm] = useState<Record<string, string | number | boolean>>({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await api<Record<string, unknown>>("/api/job-seeker/profile");
      if (res.ok && res.data) {
        const d = res.data;
        setForm({
          name: String(d.name || user?.name || ""),
          phone: String(d.phone || ""),
          residenceRegion: String(d.residenceRegion || ""),
          desiredWorkRegion: String(d.desiredWorkRegion || ""),
          desiredJobCategory: String(d.desiredJobCategory || ""),
          desiredSalary: Number(d.desiredSalary || 0),
          desiredEmploymentType: String(d.desiredEmploymentType || ""),
          introduction: String(d.introduction || ""),
          skills: String(d.skills || ""),
          careerYears: Number(d.careerYears || 0),
          languages: String(d.languages || ""),
          nationality: String(d.nationality || ""),
          koreaResident: Boolean(d.koreaResident ?? true),
          koreanLevel: String(d.koreanLevel || ""),
          preferredLanguage: String(d.preferredLanguage || "ko"),
          autoTranslateEnabled: Boolean(d.autoTranslateEnabled),
        });
      }
    })();
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await api("/api/job-seeker/profile", {
      method: "PATCH",
      body: JSON.stringify(form),
    });
    setMsg(res.ok ? "저장되었습니다" : res.error || "실패");
    if (res.ok) await refresh();
  }

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="구직자 프로필" subtitle="민감정보는 최소화하여 저장됩니다" />
      <Card>
        <form onSubmit={onSubmit}>
          <Input label="이름" value={String(form.name || "")} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="연락처" value={String(form.phone || "")} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="거주지역" value={String(form.residenceRegion || "")} onChange={(e) => setForm({ ...form, residenceRegion: e.target.value })} />
          <Input label="희망근무지역" value={String(form.desiredWorkRegion || "")} onChange={(e) => setForm({ ...form, desiredWorkRegion: e.target.value })} />
          <Input label="희망직종" value={String(form.desiredJobCategory || "")} onChange={(e) => setForm({ ...form, desiredJobCategory: e.target.value })} />
          <Input label="희망급여(만원)" type="number" value={Number(form.desiredSalary || 0)} onChange={(e) => setForm({ ...form, desiredSalary: Number(e.target.value) })} />
          <Input label="희망고용형태" value={String(form.desiredEmploymentType || "")} onChange={(e) => setForm({ ...form, desiredEmploymentType: e.target.value })} />
          <Input label="경력(년)" type="number" value={Number(form.careerYears || 0)} onChange={(e) => setForm({ ...form, careerYears: Number(e.target.value) })} />
          <Input label="보유기술" value={String(form.skills || "")} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <Input label="언어" value={String(form.languages || "")} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
          <Input label="국적" value={String(form.nationality || "")} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
          <Select label="한국어 수준" value={String(form.koreanLevel || "")} onChange={(e) => setForm({ ...form, koreanLevel: e.target.value })}>
            <option value="">선택</option>
            <option value="상">상</option>
            <option value="중">중</option>
            <option value="하">하</option>
          </Select>
          <Textarea label="자기소개" value={String(form.introduction || "")} onChange={(e) => setForm({ ...form, introduction: e.target.value })} />
          <Button type="submit">저장</Button>
          {msg ? <p>{msg}</p> : null}
        </form>
      </Card>
    </div>
  );
}
