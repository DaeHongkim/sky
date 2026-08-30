export interface BusinessPillar {
  titleKey: "b1_title" | "b2_title" | "b3_title" | "b4_title" | "b5_title" | "b6_title" | "b7_title";
  descKey: "b1_desc" | "b2_desc" | "b3_desc" | "b4_desc" | "b5_desc" | "b6_desc" | "b7_desc";
  image: string;
  tags: string[];
}

export const businessPillars: BusinessPillar[] = [
  {
    titleKey: "b1_title",
    descKey: "b1_desc",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    tags: ["브랜드 기획", "메뉴 R&D", "가맹 시스템"],
  },
  {
    titleKey: "b2_title",
    descKey: "b2_desc",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    tags: ["상업공간 설계", "인테리어 시공", "감리 총괄"],
  },
  {
    titleKey: "b3_title",
    descKey: "b3_desc",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    tags: ["디지털 마케팅", "브랜드 전략"],
  },
  {
    titleKey: "b4_title",
    descKey: "b4_desc",
    image: "https://images.unsplash.com/photo-1542744094-3a31243364d0?auto=format&fit=crop&w=800&q=80",
    tags: ["시각 디자인", "콘텐츠 미디어"],
  },
  {
    titleKey: "b5_title",
    descKey: "b5_desc",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    tags: ["직무별 매칭", "글로벌 인력풀"],
  },
  {
    titleKey: "b6_title",
    descKey: "b6_desc",
    image: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=800&q=80",
    tags: ["로컬 상권 재생", "도시 재생"],
  },
  {
    titleKey: "b7_title",
    descKey: "b7_desc",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    tags: ["위탁 운영", "호스피탈리티"],
  },
];
