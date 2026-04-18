"use client";
import { useState } from "react";
import { mockStores } from "@/data/mockData";
import { Store, StoreCategory } from "@/types";
import StoreCard from "@/components/StoreCard";
import MapView from "@/components/MapView";

const CATEGORIES: StoreCategory[] = ["음식점", "카페", "편의점", "미용실", "약국", "학원", "의류", "기타"];
const STATUS_LABELS = { available: "임대가능", occupied: "임대중", pending: "협의중" };
const STATUS_COLORS = { available: "bg-green-100 text-green-700", occupied: "bg-red-100 text-red-700", pending: "bg-yellow-100 text-yellow-700" };

export default function MapPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [selectedStatus, setSelectedStatus] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const filtered = mockStores.filter((s) => {
    const matchCat = selectedCategory === "전체" || s.category === selectedCategory;
    const matchStatus = selectedStatus === "전체" || s.status === selectedStatus;
    const matchSearch = s.name.includes(searchQuery) || s.address.includes(searchQuery) || s.district.includes(searchQuery);
    return matchCat && matchStatus && matchSearch;
  });

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 mb-3">점포 검색</h2>
          <input
            type="text"
            placeholder="지역명, 점포명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">업종</p>
          <div className="flex flex-wrap gap-1">
            {["전체", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">임대 상태</p>
          <div className="flex gap-1">
            {["전체", "available", "occupied", "pending"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${selectedStatus === st ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {st === "전체" ? "전체" : STATUS_LABELS[st as keyof typeof STATUS_LABELS]}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs text-gray-500 mb-2">검색결과 {filtered.length}개</p>
          <div className="space-y-2">
            {filtered.map((store) => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`cursor-pointer rounded-lg border p-3 transition-colors ${selectedStore?.id === store.id ? "border-blue-400 bg-blue-50" : "border-gray-100 hover:border-gray-300 bg-white"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{store.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{store.district} · {store.category}</p>
                    {store.monthlyRent && (
                      <p className="text-xs text-blue-600 mt-1">월 {store.monthlyRent}만원 · {store.size}평</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[store.status]}`}>
                    {STATUS_LABELS[store.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative">
        <MapView stores={filtered} selectedStore={selectedStore} onSelectStore={setSelectedStore} />

        {/* Store Detail Panel */}
        {selectedStore && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800">{selectedStore.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedStore.address}</p>
              </div>
              <button onClick={() => setSelectedStore(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>
            <div className="flex gap-3 mt-3 text-sm">
              {selectedStore.monthlyRent && <span className="text-blue-600 font-medium">월 {selectedStore.monthlyRent}만원</span>}
              {selectedStore.size && <span className="text-gray-600">{selectedStore.size}평</span>}
              <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[selectedStore.status]}`}>
                {STATUS_LABELS[selectedStore.status]}
              </span>
            </div>
            {selectedStore.description && <p className="text-sm text-gray-600 mt-2">{selectedStore.description}</p>}
            {selectedStore.phone && <p className="text-sm text-gray-500 mt-1">📞 {selectedStore.phone}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
