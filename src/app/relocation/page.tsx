"use client";
import { useState } from "react";
import { districtInfos, relocationSteps } from "@/data/relocationData";
import { DistrictInfo } from "@/types/relocation";

const tabs = ["구/군 비교", "이전 절차", "체크리스트"] as const;
type Tab = (typeof tabs)[number];

const checklist = [
  { category: "이사 전", items: ["이사 업체 예약 (최소 2~4주 전)", "전입신고 관련 서류 준비", "전기/가스/인터넷 이전 신청", "자녀 학교 전학 서류 준비", "우편물 주소 변경 신청"] },
  { category: "이사 당일", items: ["기존 집 에너지 검침 확인", "새 집 열쇠 수령 및 상태 확인", "이삿짐 파손 여부 확인", "새 집 가스/전기/수도 개통 확인"] },
  { category: "이사 후 1주일", items: ["전입신고 (주민센터)", "건강보험 주소 변경", "인터넷/TV 개통", "주변 생활 인프라 파악 (마트, 병원, 약국)"] },
  { category: "이사 후 2주일", items: ["자동차 등록 주소 변경", "운전면허증 주소 변경", "은행/카드사 주소 변경", "어린이집/학교 전학 완료"] },
];

export default function RelocationPage() {
  const [activeTab, setActiveTab] = useState<Tab>("구/군 비교");
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  function toggleCheck(item: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  }

  const totalItems = checklist.flatMap((c) => c.items).length;
  const progress = Math.round((checkedItems.size / totalItems) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">부산 거주지 이전</h1>
        <p className="text-gray-500 text-sm mt-1">부산으로의 이사를 위한 구/군 비교, 이전 절차, 체크리스트를 제공합니다.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: 구/군 비교 */}
      {activeTab === "구/군 비교" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {districtInfos.map((d) => (
              <div
                key={d.name}
                onClick={() => setSelectedDistrict(selectedDistrict?.name === d.name ? null : d)}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${selectedDistrict?.name === d.name ? "border-blue-400 shadow-md" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{d.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{d.character}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">월세 {d.avgMonthlyRent}만원~</p>
                    <p className="text-xs text-gray-400">전세 {(d.avgJeonse / 10000).toFixed(1)}억~</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {d.subwayLines.map((line) => (
                    <span key={line} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{line}</span>
                  ))}
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">인구 {(d.population / 10000).toFixed(0)}만명</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div className="sticky top-20">
            {selectedDistrict ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-blue-600 text-white p-4">
                  <h2 className="font-bold text-xl">{selectedDistrict.name}</h2>
                  <p className="text-blue-100 text-sm mt-0.5">{selectedDistrict.character}</p>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3 border-b border-gray-100">
                  {[
                    { label: "평균 월세", value: `${selectedDistrict.avgMonthlyRent}만원~` },
                    { label: "평균 전세", value: `${(selectedDistrict.avgJeonse / 10000).toFixed(1)}억~` },
                    { label: "학교 수", value: `${selectedDistrict.schools}개` },
                    { label: "의료기관", value: `${selectedDistrict.hospitals}개` },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="font-semibold text-gray-800 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-1">👍 장점</p>
                    <ul className="space-y-1">
                      {selectedDistrict.pros.map((p) => (
                        <li key={p} className="text-sm text-gray-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-600 mb-1">👎 단점</p>
                    <ul className="space-y-1">
                      {selectedDistrict.cons.map((c) => (
                        <li key={c} className="text-sm text-gray-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                <div className="text-4xl mb-3">🏙️</div>
                <p>구/군을 선택하면 상세 정보를 볼 수 있습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: 이전 절차 */}
      {activeTab === "이전 절차" && (
        <div className="max-w-2xl space-y-4">
          {relocationSteps.map((s) => (
            <div key={s.step} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {s.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-800">{s.title}</h3>
                  <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">{s.deadline}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.required.map((r) => (
                    <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{r}</span>
                  ))}
                </div>
                {s.link && (
                  <p className="text-xs text-blue-500 mt-1">온라인 신청 가능 (정부24 등)</p>
                )}
              </div>
            </div>
          ))}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            💡 전입신고는 <strong>정부24 (gov.kr)</strong> 또는 새 주소지 주민센터에서 할 수 있습니다.
          </div>
        </div>
      )}

      {/* Tab: 체크리스트 */}
      {activeTab === "체크리스트" && (
        <div className="max-w-2xl">
          {/* Progress */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">이전 준비 진행률</span>
              <span className="text-sm font-bold text-blue-600">{checkedItems.size}/{totalItems} ({progress}%)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="h-3 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="space-y-4">
            {checklist.map((section) => (
              <div key={section.category} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-700">{section.category}</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {section.items.map((item) => (
                    <label key={item} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={checkedItems.has(item)}
                        onChange={() => toggleCheck(item)}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                      <span className={`text-sm ${checkedItems.has(item) ? "line-through text-gray-400" : "text-gray-700"}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {progress === 100 && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-semibold">🎉 모든 이전 준비가 완료되었습니다!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
