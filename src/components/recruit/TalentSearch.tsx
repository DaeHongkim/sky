"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Input from "@/components/recruit/ui/Input";
import Select from "@/components/recruit/ui/Select";
import Button from "@/components/recruit/ui/Button";
import Card from "@/components/recruit/ui/Card";
import Loading from "@/components/recruit/ui/Loading";
import EmptyState from "@/components/recruit/ui/EmptyState";

interface Talent {
  userId: string;
  name: string;
  desiredJobCategory: string | null;
  desiredRegion: string | null;
  careerYears: number | null;
  nationality: string | null;
  koreanLevel: string | null;
  skills: string[];
}

export default function TalentSearch() {
  const [jobCategory, setJobCategory] = useState("");
  const [region, setRegion] = useState("");
  const [koreanLevel, setKoreanLevel] = useState("");
  const [careerYearsMin, setCareerYearsMin] = useState("");
  const [talents, setTalents] = useState<Talent[] | null>(null);
  const [loading, setLoading] = useState(false);

  function buildParams() {
    const params = new URLSearchParams();
    if (jobCategory) params.set("jobCategory", jobCategory);
    if (region) params.set("region", region);
    if (koreanLevel) params.set("koreanLevel", koreanLevel);
    if (careerYearsMin) params.set("careerYearsMin", careerYearsMin);
    return params;
  }

  async function search() {
    setLoading(true);
    try {
      const res = await fetch(`/api/company/talents?${buildParams().toString()}`);
      const data = await res.json();
      setTalents(data.talents ?? []);
    } finally {
      setLoading(false);
    }
  }

  // 최초 진입 시 자동 검색 (talents === null 상태 자체가 로딩 표시 역할을 한다).
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/company/talents`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setTalents(data.talents ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Card className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Input placeholder="희망직종" value={jobCategory} onChange={(e) => setJobCategory(e.target.value)} />
        <Input placeholder="희망지역" value={region} onChange={(e) => setRegion(e.target.value)} />
        <Select value={koreanLevel} onChange={(e) => setKoreanLevel(e.target.value)}>
          <option value="">한국어 수준(전체)</option>
          <option value="BASIC">기초</option>
          <option value="INTERMEDIATE">중급</option>
          <option value="ADVANCED">고급</option>
          <option value="NATIVE">원어민</option>
        </Select>
        <Input
          type="number"
          placeholder="최소 경력(년)"
          value={careerYearsMin}
          onChange={(e) => setCareerYearsMin(e.target.value)}
        />
        <Button className="col-span-2 sm:col-span-4" onClick={search} loading={loading}>
          검색
        </Button>
      </Card>

      {talents === null ? (
        <Loading />
      ) : talents.length === 0 ? (
        <EmptyState title="조건에 맞는 인재가 없습니다." description="공개 이력서를 등록한 구직자만 검색됩니다." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {talents.map((t) => (
            <Link key={t.userId} href={`/recruit/company/talents/${t.userId}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {t.desiredJobCategory ?? "직종 미기재"} · {t.desiredRegion ?? "지역 미기재"}
                </p>
                <p className="mt-1 text-sm text-slate-500">경력 {t.careerYears ?? 0}년</p>
                {t.skills.length > 0 && (
                  <p className="mt-2 text-xs text-slate-400">{t.skills.slice(0, 5).join(", ")}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
