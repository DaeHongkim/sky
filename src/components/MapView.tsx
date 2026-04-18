"use client";
import { Store } from "@/types";

interface Props {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
}

const STATUS_COLORS = {
  available: "#16a34a",
  occupied: "#dc2626",
  pending: "#d97706",
};

export default function MapView({ stores, selectedStore, onSelectStore }: Props) {
  // 부산 지도 SVG 목업 (실제 서비스에서는 카카오맵 API 키 등록 후 react-kakao-maps-sdk 사용)
  const busan = { minLat: 34.88, maxLat: 35.38, minLng: 128.74, maxLng: 129.34 };
  const W = 800;
  const H = 500;

  function toSvgX(lng: number) {
    return ((lng - busan.minLng) / (busan.maxLng - busan.minLng)) * W;
  }
  function toSvgY(lat: number) {
    return H - ((lat - busan.minLat) / (busan.maxLat - busan.minLat)) * H;
  }

  return (
    <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Map background label */}
      <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs px-3 py-1 rounded-full">
        카카오맵 API 키 등록 후 실제 지도 연동 가능
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full max-h-full"
        style={{ background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)" }}
      >
        {/* Busan outline (simplified) */}
        <text x="400" y="50" textAnchor="middle" fontSize="18" fill="#93c5fd" fontWeight="bold">
          부산광역시
        </text>

        {/* Grid lines */}
        {[...Array(6)].map((_, i) => (
          <line key={`v${i}`} x1={(i + 1) * (W / 7)} y1={0} x2={(i + 1) * (W / 7)} y2={H} stroke="#bfdbfe" strokeWidth="0.5" />
        ))}
        {[...Array(4)].map((_, i) => (
          <line key={`h${i}`} x1={0} y1={(i + 1) * (H / 5)} x2={W} y2={(i + 1) * (H / 5)} stroke="#bfdbfe" strokeWidth="0.5" />
        ))}

        {/* Store markers */}
        {stores.map((store) => {
          const x = toSvgX(store.lng);
          const y = toSvgY(store.lat);
          const isSelected = selectedStore?.id === store.id;
          const color = STATUS_COLORS[store.status];
          return (
            <g key={store.id} onClick={() => onSelectStore(store)} style={{ cursor: "pointer" }}>
              <circle
                cx={x} cy={y}
                r={isSelected ? 14 : 10}
                fill={color}
                opacity={0.9}
                stroke="white"
                strokeWidth={isSelected ? 3 : 2}
              />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
                {store.category.slice(0, 2)}
              </text>
              {isSelected && (
                <text x={x} y={y - 18} textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="bold">
                  {store.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg p-3 text-xs flex flex-col gap-1 shadow">
        <p className="font-semibold text-gray-700 mb-1">범례</p>
        {Object.entries({ available: "임대가능", occupied: "임대중", pending: "협의중" }).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: STATUS_COLORS[k as keyof typeof STATUS_COLORS] }} />
            <span className="text-gray-600">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
