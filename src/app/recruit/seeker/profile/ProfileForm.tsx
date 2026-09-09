"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/recruit/ui/Input";
import Select from "@/components/recruit/ui/Select";
import Textarea from "@/components/recruit/ui/Textarea";
import Button from "@/components/recruit/ui/Button";
import Card from "@/components/recruit/ui/Card";

interface InitialProfile {
  name: string;
  phone: string | null;
  birthDate: string;
  gender: string | null;
  residenceRegion: string | null;
  desiredRegion: string | null;
  desiredJobCategory: string | null;
  desiredSalaryMin: number | null;
  desiredSalaryMax: number | null;
  availableFrom: string;
  selfIntroduction: string | null;
  skills: string;
  nationality: string | null;
  koreaResident: boolean;
  koreanLevel: string | null;
}

export default function ProfileForm({
  initial,
  email,
}: {
  initial: InitialProfile | null;
  email: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    birthDate: initial?.birthDate ?? "",
    gender: initial?.gender ?? "",
    residenceRegion: initial?.residenceRegion ?? "",
    desiredRegion: initial?.desiredRegion ?? "",
    desiredJobCategory: initial?.desiredJobCategory ?? "",
    desiredSalaryMin: initial?.desiredSalaryMin?.toString() ?? "",
    desiredSalaryMax: initial?.desiredSalaryMax?.toString() ?? "",
    availableFrom: initial?.availableFrom ?? "",
    selfIntroduction: initial?.selfIntroduction ?? "",
    skills: initial?.skills ?? "",
    nationality: initial?.nationality ?? "",
    koreaResident: initial?.koreaResident ?? false,
    koreanLevel: initial?.koreanLevel ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/seeker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          gender: form.gender || null,
          birthDate: form.birthDate || null,
          availableFrom: form.availableFrom || null,
          desiredSalaryMin: form.desiredSalaryMin ? Number(form.desiredSalaryMin) : null,
          desiredSalaryMax: form.desiredSalaryMax ? Number(form.desiredSalaryMax) : null,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          koreanLevel: form.koreanLevel || null,
          nationality: form.nationality || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "저장에 실패했습니다.");
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4">
        <p className="text-sm text-slate-500">{email}</p>
        <Input id="name" label="이름" required value={form.name} onChange={(e) => update("name", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input id="phone" label="연락처" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          <Input id="birthDate" label="생년월일" type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
          <Select id="gender" label="성별" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
            <option value="">선택안함</option>
            <option value="MALE">남성</option>
            <option value="FEMALE">여성</option>
            <option value="UNSPECIFIED">선택안함</option>
          </Select>
          <Input id="residenceRegion" label="거주지역" value={form.residenceRegion} onChange={(e) => update("residenceRegion", e.target.value)} />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-semibold text-slate-900">희망 근무조건</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input id="desiredRegion" label="희망근무지역" value={form.desiredRegion} onChange={(e) => update("desiredRegion", e.target.value)} />
          <Input id="desiredJobCategory" label="희망직종" value={form.desiredJobCategory} onChange={(e) => update("desiredJobCategory", e.target.value)} />
          <Input id="desiredSalaryMin" label="희망급여(최소)" type="number" value={form.desiredSalaryMin} onChange={(e) => update("desiredSalaryMin", e.target.value)} />
          <Input id="desiredSalaryMax" label="희망급여(최대)" type="number" value={form.desiredSalaryMax} onChange={(e) => update("desiredSalaryMax", e.target.value)} />
          <Input id="availableFrom" label="입사가능일" type="date" value={form.availableFrom} onChange={(e) => update("availableFrom", e.target.value)} />
        </div>
        <Input id="skills" label="보유기술 (쉼표로 구분)" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
        <Textarea id="selfIntroduction" label="자기소개" rows={4} value={form.selfIntroduction} onChange={(e) => update("selfIntroduction", e.target.value)} />
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-semibold text-slate-900">외국인 정보 (해당 시)</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input id="nationality" label="국적" value={form.nationality} onChange={(e) => update("nationality", e.target.value)} />
          <Select id="koreanLevel" label="한국어 수준" value={form.koreanLevel} onChange={(e) => update("koreanLevel", e.target.value)}>
            <option value="">선택안함</option>
            <option value="BASIC">기초</option>
            <option value="INTERMEDIATE">중급</option>
            <option value="ADVANCED">고급</option>
            <option value="NATIVE">원어민</option>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.koreaResident}
            onChange={(e) => update("koreaResident", e.target.checked)}
          />
          현재 한국에 거주 중
        </label>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">저장되었습니다.</p>}
      <Button type="submit" loading={loading} fullWidth>
        저장
      </Button>
    </form>
  );
}
