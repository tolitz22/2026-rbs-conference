import { NextResponse } from "next/server";
import { getDb, payloadToRow, rowToRegistration } from "@/lib/db";
import { registrationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const db = getDb();
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
    const duplicateCheck = await db
      .from("registrations")
      .select("id")
      .eq("full_name", clean.fullName.trim())
      .eq("contact_number", clean.contactNumber.trim())
      .maybeSingle();

    if (duplicateCheck.data) {
      return NextResponse.json(
        { message: "Duplicate registration detected for the same name and contact number." },
        { status: 409 }
      );
    }

    const insert = await db.from("registrations").insert(payloadToRow({
      fullName: clean.fullName,
      contactNumber: clean.contactNumber,
      email: clean.email || null,
      church: clean.church,
      hasVehicle: clean.hasVehicle,
      plateNumber: clean.plateNumber || null
    })).select("*").single();

    if (insert.error || !insert.data) {
      return NextResponse.json({ message: insert.error?.message ?? "Unable to save registration." }, { status: 500 });
    }

    const registration = rowToRegistration(insert.data);

    // Webhook trigger (optional)
    if (process.env.REGISTRATION_WEBHOOK_URL) {
      fetch(process.env.REGISTRATION_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registration)
      }).catch(() => null);
    }

    // Google Sheets sync via Apps Script webhook (optional)
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registration)
      }).catch(() => null);
    }

    // Confirmation simulation
    const confirmation = `Dear ${registration.fullName}, your registration for OUR COVENANTAL HERITAGE is confirmed.`;

    return NextResponse.json({ registration, confirmation }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unexpected server error." }, { status: 500 });
  }
}
