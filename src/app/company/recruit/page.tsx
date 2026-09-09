import type { Metadata } from "next";
import RecruitContent from "@/components/company/RecruitContent";

export const metadata: Metadata = {
  title: "채용공고 및 이력서 작성 | 하이홍화토",
};

export default function CompanyRecruitPage() {
  return <RecruitContent />;
}
