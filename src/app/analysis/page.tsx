"use client";
import { useState } from "react";
import { mockDistricts, mockStores } from "@/data/mockData";
import { District } from "@/types";

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );
}

export default function AnalysisPage() {
  const [selected, setSelected] = useState<District | null>(null);
  const maxStores = Math.max(...mockDistricts.map((d) => d.storeCount));
  const maxRent = Math.max(...mockDistricts.map((d) => d.avgRent));

  const districtStores = selected
    ? mockStores.filter((s) => s.district === selected.name)
    : [];

  const categoryCounts = districtStores.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">부산 상권 분석</h1>
      <p className="text-gray-500 text-sm mb-6">구/군별 상권 현황과 임대 시장 데이터를 분석합니다.</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "분석 구/군", value: `${mockDistricts.length}개`, color: "text-blue-600" },
          { label: "평균 임대료", value: `${Math.round(mockDistricts.reduce((a, d) => a + d.avgRent, 0) / mockDistricts.length)}만원`, color: "text-green-600" },
          { label: "최고 성장률", value: `${Math.max(...mockDistricts.map((d) => d.growthRate))}%`, color: "text-purple-600" },
          { label: "총 점포 수", value: `${mockDistricts.reduce((a, d) => a + d.storeCount, 0).toLocaleString()}개`, color: "text-orange-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* District Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">구/군별 현황</h2>
            <p className="text-xs text-gray-400 mt-0.5">클릭하면 상세 분석을 볼 수 있습니다</p>
          </div>
          <div className="divide-y divide-gray-50">
            {mockDistricts
              .sort((a, b) => b.growthRate - a.growthRate)
              .map((d) => (
                <div
                  key={d.name}
                  onClick={() => setSelected(selected?.name === d.name ? null : d)}
                  className={`p-4 cursor-pointer transition-colors ${selected?.name === d.name ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{d.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.growthRate >= 8 ? "bg-green-100 text-green-700" : d.growthRate >= 5 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        +{d.growthRate}%
                      </span>
                      <span className="text-sm text-gray-500">{d.avgRent}만원</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>점포 수</span>
                      <span>{d.storeCount.toLocaleString()}개</span>
                    </div>
                    <Bar value={d.storeCount} max={maxStores} color="bg-blue-400" />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>평균 임대료</span>
                      <span>{d.avgRent}만원</span>
                    </div>
                    <Bar value={d.avgRent} max={maxRent} color="bg-purple-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">주요 업종: {d.topCategory}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div>
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-100 bg-blue-50">
                <h2 className="font-bold text-gray-800 text-lg">{selected.name} 상세 분석</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3 border-b border-gray-100">
                {[
                  { label: "점포 수", value: `${selected.storeCount.toLocaleString()}개` },
                  { label: "평균 월 임대료", value: `${selected.avgRent}만원` },
                  { label: "성장률", value: `+${selected.growthRate}%` },
                  { label: "주요 업종", value: selected.topCategory },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-semibold text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Category breakdown */}
              {districtStores.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">등록 매물 업종 분포</h3>
                  <div className="space-y-2">
                    {Object.entries(categoryCounts).map(([cat, count]) => (
                      <div key={cat} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-16">{cat}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${(count / districtStores.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{count}개</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  * 데이터는 샘플 데이터입니다. 실제 서비스에서는 공공데이터포털 및 소상공인시장진흥공단 API와 연동됩니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              <div className="text-4xl mb-3">📊</div>
              <p>왼쪽에서 구/군을 선택하면</p>
              <p>상세 분석 데이터를 볼 수 있습니다.</p>
            </div>
          )}

          {/* Growth Ranking */}
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-3">성장률 TOP 3</h3>
            {mockDistricts
              .sort((a, b) => b.growthRate - a.growthRate)
              .slice(0, 3)
              .map((d, i) => (
                <div key={d.name} className="flex items-center gap-3 py-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : "bg-orange-400"}`}>
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-800 flex-1">{d.name}</span>
                  <span className="text-green-600 font-semibold">+{d.growthRate}%</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
