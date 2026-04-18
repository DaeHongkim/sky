"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["음식점", "카페", "편의점", "미용실", "약국", "학원", "의류", "기타"];
const DISTRICTS = ["해운대구", "부산진구", "중구", "동래구", "수영구", "기장군", "강서구", "사하구", "남구", "북구", "연제구", "금정구", "사상구", "영도구", "서구", "동구"];

export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", category: "음식점", district: "해운대구",
    address: "", monthlyRent: "", size: "", phone: "", description: "", status: "available",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 실제 서비스에서는 API 호출
    setSubmitted(true);
    setTimeout(() => router.push("/listings"), 2000);
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-800">매물이 등록되었습니다!</h2>
        <p className="text-gray-500 mt-2">매물 목록 페이지로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">매물 등록</h1>
        <p className="text-gray-500 text-sm mt-1">임대 가능한 점포 정보를 입력해주세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">매물명 *</label>
            <input
              name="name" required value={form.name} onChange={handleChange}
              placeholder="예: 해운대 1층 카페 자리"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">업종 *</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">구/군 *</label>
            <select name="district" value={form.district} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">상세 주소</label>
            <input
              name="address" value={form.address} onChange={handleChange}
              placeholder="예: 부산 해운대구 해운대해변로 30"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">월 임대료 (만원)</label>
            <input
              name="monthlyRent" type="number" value={form.monthlyRent} onChange={handleChange}
              placeholder="예: 150"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">면적 (평)</label>
            <input
              name="size" type="number" value={form.size} onChange={handleChange}
              placeholder="예: 30"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
            <input
              name="phone" value={form.phone} onChange={handleChange}
              placeholder="예: 051-123-4567"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">임대 상태</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="available">임대가능</option>
              <option value="pending">협의중</option>
              <option value="occupied">임대중</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              rows={3}
              placeholder="매물에 대한 추가 설명을 입력해주세요."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
}
