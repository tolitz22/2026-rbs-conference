import { NextResponse } from "next/server";
import { getRegistrationCount, getRegistrationSettings, insertRegistration, type DatabaseError } from "@/lib/db";
import { getRegistrationGateStatus } from "@/lib/registration-gate";
import { registrationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const settings = await getRegistrationSettings();
    const currentCount = await getRegistrationCount();
    const gate = getRegistrationGateStatus(settings, currentCount);
    if (!gate.isOpen) {
      return NextResponse.json(
        { message: gate.message, reason: gate.reason, currentCount, maxCapacity: gate.maxCapacity },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const clean = parsed.data;

    const latestCount = await getRegistrationCount();
    const latestSettings = await getRegistrationSettings();
    const latestGate = getRegistrationGateStatus(latestSettings, latestCount);
    if (!latestGate.isOpen) {
      return NextResponse.json(
        { message: latestGate.message, reason: latestGate.reason, currentCount: latestCount, maxCapacity: latestGate.maxCapacity },
        { status: 403 }
      );
    }

    const registration = await insertRegistration({
      fullName: clean.fullName,
      contactNumber: clean.contactNumber,
      email: clean.email || null,
      church: clean.church,
      role: clean.role === "Others" ? clean.roleOther || "Others" : clean.role || null,
      hasVehicle: clean.hasVehicle,
      plateNumber: clean.plateNumber || null
    });

    // Webhook trigger (optional)
    if (process.env.REGISTRATION_WEBHOOK_URL) {
      fetch(process.env.REGISTRATION_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registration)
      }).catch(() => null);
    }

    // Confirmation simulation
    const confirmation = `Dear ${registration.fullName}, your registration for OUR COVENANTAL HERITAGE is confirmed.`;

    return NextResponse.json({ registration, confirmation }, { status: 201 });
  } catch (error) {
    const dbError = error as DatabaseError;
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    if (dbError.code === "23505" || message.toLowerCase().includes("duplicate key value")) {
      return NextResponse.json(
        { message: "Duplicate registration detected for the same name and contact number." },
        { status: 409 }
      );
    }

    return NextResponse.json({ message }, { status: 500 });
  }
}
