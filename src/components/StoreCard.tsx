import { Store } from "@/types";
import Link from "next/link";

const STATUS_LABELS = { available: "임대가능", occupied: "임대중", pending: "협의중" };
const STATUS_COLORS = { available: "bg-green-100 text-green-700", occupied: "bg-red-100 text-red-700", pending: "bg-yellow-100 text-yellow-700" };

export default function StoreCard({ store }: { store: Store }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{store.name}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[store.status]}`}>
          {STATUS_LABELS[store.status]}
        </span>
      </div>
      <p className="text-sm text-gray-500">{store.address}</p>
      <div className="flex gap-3 mt-2 text-sm">
        <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{store.category}</span>
        {store.monthlyRent && <span className="text-blue-600 font-medium">월 {store.monthlyRent}만원</span>}
        {store.size && <span className="text-gray-500">{store.size}평</span>}
      </div>
      {store.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{store.description}</p>}
    </div>
  );
}
