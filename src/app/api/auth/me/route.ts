import { jsonOk, handleRouteError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonOk({ user: null });

    const detail = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        name: true,
        jobSeekerProfile: true,
        companyProfile: true,
      },
    });

    return jsonOk({ user: detail });
  } catch (error) {
    return handleRouteError(error);
  }
}
