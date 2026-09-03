export const positionOptions = [
  "F&B · 프랜차이즈 기획 및 R&D",
  "공간 설계 및 인테리어 시공",
  "마케팅 · 브랜딩 전략 기획",
  "글로벌 인재 매칭 및 HR",
  "호스피탈리티 / 숙박업 위탁운영",
] as const;

export const defaultPosition: (typeof positionOptions)[number] = "글로벌 인재 매칭 및 HR";

export interface JobOpening {
  position: (typeof positionOptions)[number];
  badge: string;
  title: string;
  desc: string;
}

export const jobOpenings: JobOpening[] = [
  {
    position: "F&B · 프랜차이즈 기획 및 R&D",
    badge: "정규직 / 경력",
    title: "F&B · 프랜차이즈 기획 및 R&D",
    desc: "외식 브랜드 컨셉 기획, 시그니처 메뉴 개발 및 매뉴얼 표준화",
  },
  {
    position: "공간 설계 및 인테리어 시공",
    badge: "정규직 / 경력·신입",
    title: "공간 설계 및 인테리어 시공",
    desc: "상업 시설 3D 공간 디자인 및 철저한 현장 시공 감리 총괄",
  },
  {
    position: "글로벌 인재 매칭 및 HR",
    badge: "정규직 / 리드",
    title: "글로벌 인재 매칭 및 HR",
    desc: "다국적 인재 풀 구축, 맞춤형 매칭 및 글로벌 파트너십 구축",
  },
];
