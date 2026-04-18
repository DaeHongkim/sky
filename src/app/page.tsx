import Link from "next/link";

const features = [
  {
    href: "/map",
    icon: "📍",
    title: "지도 기반 점포 검색",
    desc: "부산 전역 점포를 지도에서 직접 확인하고 필터링하세요.",
    color: "bg-blue-50 border-blue-200",
    btn: "bg-blue-600 hover:bg-blue-700",
  },
  {
    href: "/analysis",
    icon: "📊",
    title: "상권 분석",
    desc: "구별 상권 현황, 평균 임대료, 성장률 데이터를 분석하세요.",
    color: "bg-green-50 border-green-200",
    btn: "bg-green-600 hover:bg-green-700",
  },
  {
    href: "/listings",
    icon: "🏪",
    title: "매물 등록/관리",
    desc: "임대 매물을 등록하고 현황을 한눈에 관리하세요.",
    color: "bg-purple-50 border-purple-200",
    btn: "bg-purple-600 hover:bg-purple-700",
  },
];

const stats = [
  { label: "등록 매물", value: "1,240+" },
  { label: "부산 구/군", value: "16개" },
  { label: "분석 상권", value: "120+" },
  { label: "월 방문자", value: "8,500+" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">부산 점포 개발 플랫폼</h1>
          <p className="text-blue-100 text-lg mb-8">
            부산 전역의 점포 정보와 상권 분석을 한 곳에서. 최적의 창업 입지를 찾아드립니다.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/map" className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              지도로 검색하기
            </Link>
            <Link href="/listings/new" className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              매물 등록하기
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-blue-600">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">주요 기능</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.href} className={`border rounded-xl p-6 ${f.color}`}>
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{f.desc}</p>
                <Link href={f.href} className={`${f.btn} text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors`}>
                  바로가기 →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
