import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { handleRouteError, jsonOk } from "@/lib/recruit/api";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return jsonOk({ authenticated: false, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        status: true,
        locale: true,
        jobSeekerProfile: true,
        companyProfile: {
          select: {
            id: true,
            companyName: true,
            verificationStatus: true,
            logoUrl: true,
            industry: true,
          },
        },
      },
    });

    return jsonOk({ authenticated: true, user });
  } catch (e) {
    return handleRouteError(e);
  }
}
