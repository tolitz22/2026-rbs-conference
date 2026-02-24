import { NextResponse } from "next/server";
import { getRegistrationCount, getRegistrationSettings } from "@/lib/db";
import { getRegistrationGateStatus } from "@/lib/registration-gate";

export async function GET() {
  try {
    const settings = await getRegistrationSettings();
    const count = await getRegistrationCount();
    const status = getRegistrationGateStatus(settings, count);

    return NextResponse.json({
      ...status,
      currentCount: count
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read registration status.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
