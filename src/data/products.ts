/** 하늘사주 수익 상품 · 월 1,000만 원 설계 기준 */

export type ProductId = "report" | "yearly" | "membership" | "consult";

export interface Product {
  id: ProductId;
  name: string;
  tagline: string;
  price: number;
  unit: "회" | "월";
  features: string[];
  /** 월 목표 판매(구독) 건수 — 합산 약 1,000만 원 */
  monthlyTarget: number;
  highlighted?: boolean;
  cta: string;
}

export const products: Product[] = [
  {
    id: "report",
    name: "정밀 사주 리포트",
    tagline: "일간·십신·오행을 한 권으로 정리한 디지털 해석서",
    price: 29_000,
    unit: "회",
    monthlyTarget: 150,
    features: [
      "사주팔자·오행 상세 해설",
      "성격·직업·인간관계 힌트",
      "PDF로 저장·공유",
    ],
    cta: "리포트 받기",
  },
  {
    id: "yearly",
    name: "연간 운세 패키지",
    tagline: "올해 대운·세운을 월별로 짚어 주는 심화 패키지",
    price: 49_000,
    unit: "회",
    monthlyTarget: 80,
    highlighted: true,
    features: [
      "연·월 운세 캘린더",
      "직업·연애·재물 테마 해석",
      "리포트 상품 포함",
    ],
    cta: "패키지 열기",
  },
  {
    id: "membership",
    name: "하늘 멤버십",
    tagline: "매일 한 줄 운세와 월간 흐름을 구독으로",
    price: 9_900,
    unit: "월",
    monthlyTarget: 100,
    features: [
      "오늘의 운세 알림",
      "월간 요약 리포트",
      "신규 해석 우선 공개",
    ],
    cta: "멤버십 시작",
  },
  {
    id: "consult",
    name: "1:1 상담",
    tagline: "60분 화상·전화로 사주를 함께 읽는 세션",
    price: 150_000,
    unit: "회",
    monthlyTarget: 12,
    features: [
      "사전 만세력 분석",
      "질문 중심 맞춤 해석",
      "상담 후 요약 메모",
    ],
    cta: "상담 예약",
  },
];

export interface RevenueScenario {
  label: string;
  description: string;
  monthlyRevenue: number;
}

/** 목표 판매량 달성 시 월 매출 (부가세 별도) */
export function projectedMonthlyRevenue(items: Product[] = products): number {
  return items.reduce((sum, p) => sum + p.price * p.monthlyTarget, 0);
}

export const revenueGoal = 10_000_000;

export const funnelSteps = [
  {
    title: "무료로 기둥 세우기",
    body: "생년월일시 입력 → 사주팔자·오행 요약. SEO·숏폼·카톡 공유로 유입을 모읍니다.",
  },
  {
    title: "리포트로 전환",
    body: "결과 화면에서 상세 해석을 잠그고, 2.9만 원 리포트로 첫 결제를 유도합니다.",
  },
  {
    title: "연간·멤버십으로 객단가↑",
    body: "리포트 구매자에게 연간 패키지·월 구독을 제안해 LTV를 올립니다.",
  },
  {
    title: "고단가 상담",
    body: "질문이 깊은 고객만 1:1 상담(15만 원)으로 연결해 월 매출을 안정화합니다.",
  },
] as const;

export const channelPlan = [
  {
    channel: "검색·콘텐츠",
    action: "‘사주팔자 보는 법’, ‘일간 해석’ 등 롱 글 + 하늘사주 체험 링크",
  },
  {
    channel: "숏폼·릴스",
    action: "오행·일간 한 컷 콘텐츠 → 프로필 링크로 무료 사주 유도",
  },
  {
    channel: "카카오·커뮤니티",
    action: "결과 공유 카드 + 친구 초대 시 멤버십 할인",
  },
  {
    channel: "재구매",
    action: "리포트 구매 후 7일·30일 연간/상담 제안 메시지",
  },
] as const;

export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}
