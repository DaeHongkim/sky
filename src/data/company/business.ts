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
    image:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3IFVlh83yxpn7dSqzy3C9YyRaWI/hf_20260903_010952_1a203fe7-9b78-40c4-8c49-3e14d8aa853f.png",
    tags: ["브랜드 기획", "메뉴 R&D", "가맹 시스템"],
  },
  {
    titleKey: "b2_title",
    descKey: "b2_desc",
    image:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3IFVlh83yxpn7dSqzy3C9YyRaWI/hf_20260903_011020_55faa38c-754b-4695-9ade-087ba92fc04b.png",
    tags: ["상업공간 설계", "인테리어 시공", "감리 총괄"],
  },
  {
    titleKey: "b3_title",
    descKey: "b3_desc",
    image:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3IFVlh83yxpn7dSqzy3C9YyRaWI/hf_20260903_011045_182c3da2-fb16-4925-9a6e-7583fe527024.png",
    tags: ["디지털 마케팅", "브랜드 전략"],
  },
  {
    titleKey: "b4_title",
    descKey: "b4_desc",
    image:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3IFVlh83yxpn7dSqzy3C9YyRaWI/hf_20260903_010923_a0003f26-0586-4282-a061-66ef85c87565.png",
    tags: ["시각 디자인", "콘텐츠 미디어"],
  },
  {
    titleKey: "b5_title",
    descKey: "b5_desc",
    image:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3IFVlh83yxpn7dSqzy3C9YyRaWI/hf_20260903_011111_ebd15959-ac30-4738-8171-5583e4926be6.png",
    tags: ["직무별 매칭", "글로벌 인력풀"],
  },
  {
    titleKey: "b6_title",
    descKey: "b6_desc",
    image:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3IFVlh83yxpn7dSqzy3C9YyRaWI/hf_20260903_011136_d8f0070b-3783-491f-9b18-5b3368f676f0.png",
    tags: ["로컬 상권 재생", "도시 재생"],
  },
  {
    titleKey: "b7_title",
    descKey: "b7_desc",
    // TODO: swap for a generated Korean-hotel shot once image credits are topped up
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    tags: ["위탁 운영", "호스피탈리티"],
  },
];
