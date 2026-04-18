"use client";
import { useState } from "react";
import { mockStores } from "@/data/mockData";
import { Store } from "@/types";
import Link from "next/link";

const STATUS_LABELS = { available: "임대가능", occupied: "임대중", pending: "협의중" };
const STATUS_COLORS = {
  available: "bg-green-100 text-green-700 border-green-200",
  occupied: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export default function ListingsPage() {
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [filter, setFilter] = useState("전체");
  const [search, setSearch] = useState("");

  const filtered = stores.filter((s) => {
    const matchStatus = filter === "전체" || s.status === filter;
    const matchSearch = s.name.includes(search) || s.district.includes(search) || s.address.includes(search);
    return matchStatus && matchSearch;
  });

  function deleteStore(id: string) {
    if (confirm("이 매물을 삭제하시겠습니까?")) {
      setStores((prev) => prev.filter((s) => s.id !== id));
    }
  }

  function updateStatus(id: string, status: Store["status"]) {
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  const counts = {
    전체: stores.length,
    available: stores.filter((s) => s.status === "available").length,
    occupied: stores.filter((s) => s.status === "occupied").length,
    pending: stores.filter((s) => s.status === "pending").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">매물 관리</h1>
          <p className="text-gray-500 text-sm mt-1">등록된 매물을 관리하고 상태를 업데이트합니다.</p>
        </div>
        <Link
          href="/listings/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + 매물 등록
        </Link>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { key: "전체", label: "전체", color: "border-blue-200 bg-blue-50 text-blue-700" },
          { key: "available", label: "임대가능", color: "border-green-200 bg-green-50 text-green-700" },
          { key: "occupied", label: "임대중", color: "border-red-200 bg-red-50 text-red-700" },
          { key: "pending", label: "협의중", color: "border-yellow-200 bg-yellow-50 text-yellow-700" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`border rounded-xl p-3 text-left transition-all ${s.color} ${filter === s.key ? "ring-2 ring-offset-1 ring-blue-400" : "opacity-70 hover:opacity-100"}`}
          >
            <p className="text-xs font-medium">{s.label}</p>
            <p className="text-2xl font-bold mt-0.5">{counts[s.key as keyof typeof counts]}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="매물명, 지역, 주소 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">매물명</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">업종</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">위치</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">임대료</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">상태</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{store.name}</p>
                  <p className="text-xs text-gray-400">{store.createdAt} 등록</p>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{store.category}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-gray-700">{store.district}</p>
                  <p className="text-xs text-gray-400 truncate max-w-40">{store.address}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {store.monthlyRent ? (
                    <span className="text-blue-600 font-medium">월 {store.monthlyRent}만원</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                  {store.size && <p className="text-xs text-gray-400">{store.size}평</p>}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={store.status}
                    onChange={(e) => updateStatus(store.id, e.target.value as Store["status"])}
                    className={`text-xs px-2 py-1 rounded-full border font-medium cursor-pointer ${STATUS_COLORS[store.status]}`}
                  >
                    <option value="available">임대가능</option>
                    <option value="occupied">임대중</option>
                    <option value="pending">협의중</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteStore(store.id)}
                    className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
