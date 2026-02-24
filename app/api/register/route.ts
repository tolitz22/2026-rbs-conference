import { NextResponse } from "next/server";
import { hasDuplicateRegistration, insertRegistration } from "@/lib/db";
import { registrationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
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

    // Duplicate prevention: same name + contact number
    const duplicate = await hasDuplicateRegistration(clean.fullName, clean.contactNumber);
    if (duplicate) {
      return NextResponse.json(
        { message: "Duplicate registration detected for the same name and contact number." },
        { status: 409 }
      );
    }

    const registration = await insertRegistration({
      fullName: clean.fullName,
      contactNumber: clean.contactNumber,
      email: clean.email || null,
      church: clean.church,
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
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    if (message.toLowerCase().includes("duplicate key value")) {
      return NextResponse.json(
        { message: "Duplicate registration detected for the same name and contact number." },
        { status: 409 }
      );
    }

    return NextResponse.json({ message }, { status: 500 });
  }
}
