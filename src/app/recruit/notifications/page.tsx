import { requirePageUser } from "@/lib/auth/page-guard";
import NotificationList from "@/components/recruit/NotificationList";

export default async function NotificationsPage() {
  await requirePageUser(["JOB_SEEKER", "COMPANY", "ADMIN"]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-slate-900">알림</h1>
      <NotificationList />
    </div>
  );
}
