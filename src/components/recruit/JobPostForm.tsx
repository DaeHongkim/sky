"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/recruit/ui/Input";
import Select from "@/components/recruit/ui/Select";
import Textarea from "@/components/recruit/ui/Textarea";
import Button from "@/components/recruit/ui/Button";
import Card from "@/components/recruit/ui/Card";

export interface JobPostFormValues {
  title: string;
  jobCategory: string;
  description: string;
  responsibilities: string;
  requirements: string;
  preferredConditions: string;
  employmentType: string;
  salaryType: string;
  salaryMin: string;
  salaryMax: string;
  workLocation: string;
  workDays: string;
  workHours: string;
  breakTime: string;
  recruitmentCount: string;
  deadline: string;
  foreignerAllowed: boolean;
  visaConditionsText: string;
  koreanLevel: string;
  housingSupport: boolean;
  mealSupport: boolean;
  transportationSupport: boolean;
}

export const emptyJobPostForm: JobPostFormValues = {
  title: "",
  jobCategory: "",
  description: "",
  responsibilities: "",
  requirements: "",
  preferredConditions: "",
  employmentType: "FULL_TIME",
  salaryType: "MONTHLY",
  salaryMin: "",
  salaryMax: "",
  workLocation: "",
  workDays: "",
  workHours: "",
  breakTime: "",
  recruitmentCount: "1",
  deadline: "",
  foreignerAllowed: false,
  visaConditionsText: "",
  koreanLevel: "",
  housingSupport: false,
  mealSupport: false,
  transportationSupport: false,
};

export function toApiPayload(form: JobPostFormValues) {
  return {
    title: form.title,
    jobCategory: form.jobCategory,
    description: form.description,
    responsibilities: form.responsibilities || null,
    requirements: form.requirements || null,
    preferredConditions: form.preferredConditions || null,
    employmentType: form.employmentType,
    salaryType: form.salaryType,
    salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
    salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
    workLocation: form.workLocation,
    workDays: form.workDays || null,
    workHours: form.workHours || null,
    breakTime: form.breakTime || null,
    recruitmentCount: form.recruitmentCount ? Number(form.recruitmentCount) : null,
    deadline: form.deadline || null,
    foreignerAllowed: form.foreignerAllowed,
    visaConditions: form.visaConditionsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    koreanLevel: form.koreanLevel || null,
    housingSupport: form.housingSupport,
    mealSupport: form.mealSupport,
    transportationSupport: form.transportationSupport,
  };
}

export default function JobPostForm({
  initial,
  mode,
  jobId,
}: {
  initial: JobPostFormValues;
  mode: "create" | "edit";
  jobId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof JobPostFormValues>(key: K, value: JobPostFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const url = mode === "create" ? "/api/company/jobs" : `/api/company/jobs/${jobId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toApiPayload(form)),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "저장에 실패했습니다.");
        return;
      }
      if (mode === "create") {
        router.push(`/recruit/company/jobs/${data.job.id}`);
      } else {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-20">
      <Card className="flex flex-col gap-4">
        <Input id="title" label="공고 제목" required value={form.title} onChange={(e) => update("title", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input id="jobCategory" label="직종" required value={form.jobCategory} onChange={(e) => update("jobCategory", e.target.value)} />
          <Input id="workLocation" label="근무지" required value={form.workLocation} onChange={(e) => update("workLocation", e.target.value)} />
          <Select id="employmentType" label="고용형태" value={form.employmentType} onChange={(e) => update("employmentType", e.target.value)}>
            <option value="FULL_TIME">정규직</option>
            <option value="PART_TIME">파트타임</option>
            <option value="CONTRACT">계약직</option>
            <option value="DAILY">일용직</option>
            <option value="INTERNSHIP">인턴</option>
            <option value="FREELANCE">프리랜서</option>
          </Select>
          <Select id="salaryType" label="급여형태" value={form.salaryType} onChange={(e) => update("salaryType", e.target.value)}>
            <option value="HOURLY">시급</option>
            <option value="DAILY">일급</option>
            <option value="MONTHLY">월급</option>
            <option value="ANNUAL">연봉</option>
            <option value="NEGOTIABLE">협의</option>
          </Select>
          <Input id="salaryMin" label="급여(최소)" type="number" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} />
          <Input id="salaryMax" label="급여(최대)" type="number" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} />
          <Input id="workDays" label="근무요일" value={form.workDays} onChange={(e) => update("workDays", e.target.value)} placeholder="주5일 (월~금)" />
          <Input id="workHours" label="근무시간" value={form.workHours} onChange={(e) => update("workHours", e.target.value)} placeholder="09:00 ~ 18:00" />
          <Input id="breakTime" label="휴게시간" value={form.breakTime} onChange={(e) => update("breakTime", e.target.value)} />
          <Input id="recruitmentCount" label="모집인원" type="number" value={form.recruitmentCount} onChange={(e) => update("recruitmentCount", e.target.value)} />
          <Input id="deadline" label="마감일" type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <Textarea id="description" label="상세 내용" required rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} />
        <Textarea id="responsibilities" label="담당업무" rows={3} value={form.responsibilities} onChange={(e) => update("responsibilities", e.target.value)} />
        <Textarea id="requirements" label="지원자격" rows={3} value={form.requirements} onChange={(e) => update("requirements", e.target.value)} />
        <Textarea id="preferredConditions" label="우대조건" rows={3} value={form.preferredConditions} onChange={(e) => update("preferredConditions", e.target.value)} />
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-semibold text-slate-900">외국인 채용 정보</h2>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.foreignerAllowed} onChange={(e) => update("foreignerAllowed", e.target.checked)} />
          외국인 지원 가능
        </label>
        {form.foreignerAllowed && (
          <>
            <Input
              id="visaConditions"
              label="허용 비자 (쉼표로 구분)"
              value={form.visaConditionsText}
              onChange={(e) => update("visaConditionsText", e.target.value)}
              placeholder="E-9, H-2, F-4"
            />
            <Select id="koreanLevel" label="요구 한국어 수준" value={form.koreanLevel} onChange={(e) => update("koreanLevel", e.target.value)}>
              <option value="">무관</option>
              <option value="BASIC">기초</option>
              <option value="INTERMEDIATE">중급</option>
              <option value="ADVANCED">고급</option>
              <option value="NATIVE">원어민</option>
            </Select>
          </>
        )}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.housingSupport} onChange={(e) => update("housingSupport", e.target.checked)} />
            숙소제공
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.mealSupport} onChange={(e) => update("mealSupport", e.target.checked)} />
            식사제공
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.transportationSupport} onChange={(e) => update("transportationSupport", e.target.checked)} />
            교통비지원
          </label>
        </div>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">저장되었습니다.</p>}

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-slate-200 bg-white p-3 md:bottom-0">
        <div className="mx-auto max-w-2xl">
          <Button type="submit" loading={loading} fullWidth>
            {mode === "create" ? "임시저장으로 만들기" : "저장"}
          </Button>
        </div>
      </div>
    </form>
  );
}
