import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function SeekerProfilePage() {
  const user = await requirePageUser(["JOB_SEEKER"]);
  const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId: user.id } });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-slate-900">프로필 관리</h1>
      <ProfileForm
        initial={
          profile
            ? {
                ...profile,
                birthDate: profile.birthDate?.toISOString().slice(0, 10) ?? "",
                availableFrom: profile.availableFrom?.toISOString().slice(0, 10) ?? "",
                skills: profile.skills.join(", "),
              }
            : null
        }
        email={user.email}
      />
    </div>
  );
}
