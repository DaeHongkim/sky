"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/recruit/ui/Input";
import Select from "@/components/recruit/ui/Select";
import Textarea from "@/components/recruit/ui/Textarea";
import Button from "@/components/recruit/ui/Button";
import Card from "@/components/recruit/ui/Card";
import Loading from "@/components/recruit/ui/Loading";

interface Career {
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
  resignReason: string;
}
interface Education {
  schoolName: string;
  major: string;
  degree: string;
  admissionDate: string;
  graduationDate: string;
  status: string;
}
interface Certificate {
  name: string;
  issuer: string;
  acquiredDate: string;
}
interface Language {
  language: string;
  level: string;
}
interface Portfolio {
  title: string;
  url: string;
  description: string;
}

function toDateInput(v: string | null | undefined) {
  return v ? v.slice(0, 10) : "";
}

export default function ResumeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState("");
  const [profileSummary, setProfileSummary] = useState("");
  const [desiredJob, setDesiredJob] = useState("");
  const [desiredLocation, setDesiredLocation] = useState("");
  const [desiredSalary, setDesiredSalary] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [availableDate, setAvailableDate] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");
  const [status, setStatus] = useState("DRAFT");

  const [careers, setCareers] = useState<Career[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  useEffect(() => {
    fetch(`/api/resumes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const r = data.resume;
        if (!r) return;
        setTitle(r.title ?? "");
        setProfileSummary(r.profileSummary ?? "");
        setDesiredJob(r.desiredJob ?? "");
        setDesiredLocation(r.desiredLocation ?? "");
        setDesiredSalary(r.desiredSalary?.toString() ?? "");
        setEmploymentType(r.employmentType ?? "");
        setAvailableDate(toDateInput(r.availableDate));
        setSkillsText((r.skills ?? []).join(", "));
        setVisibility(r.visibility ?? "PRIVATE");
        setStatus(r.status ?? "DRAFT");
        setCareers(
          (r.careers ?? []).map((c: Career) => ({
            ...c,
            startDate: toDateInput(c.startDate),
            endDate: toDateInput(c.endDate),
            position: c.position ?? "",
            responsibilities: c.responsibilities ?? "",
            resignReason: c.resignReason ?? "",
          }))
        );
        setEducations(
          (r.educations ?? []).map((e: Education) => ({
            ...e,
            admissionDate: toDateInput(e.admissionDate),
            graduationDate: toDateInput(e.graduationDate),
            major: e.major ?? "",
            degree: e.degree ?? "",
          }))
        );
        setCertificates(
          (r.certificates ?? []).map((c: Certificate) => ({
            ...c,
            acquiredDate: toDateInput(c.acquiredDate),
            issuer: c.issuer ?? "",
          }))
        );
        setLanguages(r.languages ?? []);
        setPortfolios(
          (r.portfolios ?? []).map((p: Portfolio) => ({
            ...p,
            url: p.url ?? "",
            description: p.description ?? "",
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          profileSummary,
          desiredJob,
          desiredLocation,
          desiredSalary: desiredSalary ? Number(desiredSalary) : null,
          employmentType: employmentType || null,
          availableDate: availableDate || null,
          skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
          visibility,
          status,
          careers: careers.map((c) => ({
            ...c,
            startDate: c.startDate || null,
            endDate: c.endDate || null,
          })),
          educations: educations.map((e) => ({
            ...e,
            admissionDate: e.admissionDate || null,
            graduationDate: e.graduationDate || null,
          })),
          certificates: certificates.map((c) => ({
            ...c,
            acquiredDate: c.acquiredDate || null,
          })),
          languages,
          portfolios,
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
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-24">
      <h1 className="text-xl font-bold text-slate-900">이력서 편집</h1>

      <Card className="flex flex-col gap-4">
        <Input id="title" label="이력서 제목" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          id="summary"
          label="자기소개 요약"
          rows={4}
          value={profileSummary}
          onChange={(e) => setProfileSummary(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input id="desiredJob" label="희망직종" value={desiredJob} onChange={(e) => setDesiredJob(e.target.value)} />
          <Input id="desiredLocation" label="희망지역" value={desiredLocation} onChange={(e) => setDesiredLocation(e.target.value)} />
          <Input id="desiredSalary" label="희망급여" type="number" value={desiredSalary} onChange={(e) => setDesiredSalary(e.target.value)} />
          <Select id="employmentType" label="희망고용형태" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
            <option value="">선택안함</option>
            <option value="FULL_TIME">정규직</option>
            <option value="PART_TIME">파트타임</option>
            <option value="CONTRACT">계약직</option>
            <option value="DAILY">일용직</option>
            <option value="INTERNSHIP">인턴</option>
            <option value="FREELANCE">프리랜서</option>
          </Select>
          <Input id="availableDate" label="입사가능일" type="date" value={availableDate} onChange={(e) => setAvailableDate(e.target.value)} />
        </div>
        <Input
          id="skills"
          label="보유기술 (쉼표로 구분)"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          placeholder="POS운영, 바리스타, 재고관리"
        />
        <div className="grid grid-cols-2 gap-3">
          <Select id="visibility" label="공개범위" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="PRIVATE">비공개</option>
            <option value="PUBLIC">공개</option>
          </Select>
          <Select id="status" label="작성상태" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="DRAFT">작성중</option>
            <option value="COMPLETED">완료</option>
          </Select>
        </div>
      </Card>

      <ListSection
        title="경력"
        items={careers}
        onAdd={() =>
          setCareers((prev) => [
            ...prev,
            { companyName: "", position: "", startDate: "", endDate: "", isCurrent: false, responsibilities: "", resignReason: "" },
          ])
        }
        onRemove={(idx) => setCareers((prev) => prev.filter((_, i) => i !== idx))}
        renderItem={(item, idx) => (
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="회사명"
              value={item.companyName}
              onChange={(e) => updateAt(setCareers, idx, { companyName: e.target.value })}
            />
            <Input
              placeholder="직무"
              value={item.position}
              onChange={(e) => updateAt(setCareers, idx, { position: e.target.value })}
            />
            <Input
              type="date"
              value={item.startDate}
              onChange={(e) => updateAt(setCareers, idx, { startDate: e.target.value })}
            />
            <Input
              type="date"
              value={item.endDate}
              disabled={item.isCurrent}
              onChange={(e) => updateAt(setCareers, idx, { endDate: e.target.value })}
            />
            <label className="col-span-2 flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={item.isCurrent}
                onChange={(e) => updateAt(setCareers, idx, { isCurrent: e.target.checked })}
              />
              재직중
            </label>
            <Textarea
              className="col-span-2"
              placeholder="담당업무"
              rows={2}
              value={item.responsibilities}
              onChange={(e) => updateAt(setCareers, idx, { responsibilities: e.target.value })}
            />
            <Input
              className="col-span-2"
              placeholder="퇴사사유 (선택)"
              value={item.resignReason}
              onChange={(e) => updateAt(setCareers, idx, { resignReason: e.target.value })}
            />
          </div>
        )}
      />

      <ListSection
        title="학력"
        items={educations}
        onAdd={() =>
          setEducations((prev) => [
            ...prev,
            { schoolName: "", major: "", degree: "", admissionDate: "", graduationDate: "", status: "GRADUATED" },
          ])
        }
        onRemove={(idx) => setEducations((prev) => prev.filter((_, i) => i !== idx))}
        renderItem={(item, idx) => (
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="학교명" value={item.schoolName} onChange={(e) => updateAt(setEducations, idx, { schoolName: e.target.value })} />
            <Input placeholder="전공" value={item.major} onChange={(e) => updateAt(setEducations, idx, { major: e.target.value })} />
            <Input placeholder="학위" value={item.degree} onChange={(e) => updateAt(setEducations, idx, { degree: e.target.value })} />
            <Select value={item.status} onChange={(e) => updateAt(setEducations, idx, { status: e.target.value })}>
              <option value="ENROLLED">재학중</option>
              <option value="ON_LEAVE">휴학</option>
              <option value="GRADUATED">졸업</option>
              <option value="DROPPED_OUT">중퇴</option>
            </Select>
            <Input type="date" value={item.admissionDate} onChange={(e) => updateAt(setEducations, idx, { admissionDate: e.target.value })} />
            <Input type="date" value={item.graduationDate} onChange={(e) => updateAt(setEducations, idx, { graduationDate: e.target.value })} />
          </div>
        )}
      />

      <ListSection
        title="자격증"
        items={certificates}
        onAdd={() => setCertificates((prev) => [...prev, { name: "", issuer: "", acquiredDate: "" }])}
        onRemove={(idx) => setCertificates((prev) => prev.filter((_, i) => i !== idx))}
        renderItem={(item, idx) => (
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="자격증명" value={item.name} onChange={(e) => updateAt(setCertificates, idx, { name: e.target.value })} />
            <Input placeholder="발급기관" value={item.issuer} onChange={(e) => updateAt(setCertificates, idx, { issuer: e.target.value })} />
            <Input type="date" value={item.acquiredDate} onChange={(e) => updateAt(setCertificates, idx, { acquiredDate: e.target.value })} />
          </div>
        )}
      />

      <ListSection
        title="언어"
        items={languages}
        onAdd={() => setLanguages((prev) => [...prev, { language: "", level: "BASIC" }])}
        onRemove={(idx) => setLanguages((prev) => prev.filter((_, i) => i !== idx))}
        renderItem={(item, idx) => (
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="언어" value={item.language} onChange={(e) => updateAt(setLanguages, idx, { language: e.target.value })} />
            <Select value={item.level} onChange={(e) => updateAt(setLanguages, idx, { level: e.target.value })}>
              <option value="BASIC">기초</option>
              <option value="INTERMEDIATE">중급</option>
              <option value="ADVANCED">고급</option>
              <option value="NATIVE">원어민</option>
            </Select>
          </div>
        )}
      />

      <ListSection
        title="포트폴리오"
        items={portfolios}
        onAdd={() => setPortfolios((prev) => [...prev, { title: "", url: "", description: "" }])}
        onRemove={(idx) => setPortfolios((prev) => prev.filter((_, i) => i !== idx))}
        renderItem={(item, idx) => (
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="제목" value={item.title} onChange={(e) => updateAt(setPortfolios, idx, { title: e.target.value })} />
            <Input placeholder="URL" value={item.url} onChange={(e) => updateAt(setPortfolios, idx, { url: e.target.value })} />
            <Textarea className="col-span-2" placeholder="설명" rows={2} value={item.description} onChange={(e) => updateAt(setPortfolios, idx, { description: e.target.value })} />
          </div>
        )}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">저장되었습니다.</p>}

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-slate-200 bg-white p-3 md:bottom-0">
        <div className="mx-auto max-w-2xl">
          <Button onClick={handleSave} loading={saving} fullWidth>
            저장하기
          </Button>
        </div>
      </div>
    </div>
  );
}

function updateAt<T>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  idx: number,
  patch: Partial<T>
) {
  setter((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
}

function ListSection<T>({
  title,
  items,
  onAdd,
  onRemove,
  renderItem,
}: {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
  renderItem: (item: T, idx: number) => React.ReactNode;
}) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <Button variant="secondary" size="sm" type="button" onClick={onAdd}>
          + 추가
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">등록된 항목이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 p-3">
              {renderItem(item, idx)}
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="mt-2 text-xs text-red-600 hover:underline"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
