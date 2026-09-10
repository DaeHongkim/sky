import { requirePageUser } from "@/lib/auth/page-guard";
import TalentSearch from "@/components/recruit/TalentSearch";

export default async function CompanyTalentsPage() {
  await requirePageUser(["COMPANY"]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">인재검색</h1>
      <TalentSearch />
    </div>
  );
}
