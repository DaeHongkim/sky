import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/current-user";
import { runVisaExpiryCheck } from "@/lib/visa/expiry-check";
import { errorResponse } from "@/lib/api/respond";

export async function POST() {
  try {
    await requireUser(["ADMIN"]);
    const result = await runVisaExpiryCheck();
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
