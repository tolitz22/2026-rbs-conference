import { NextResponse } from "next/server";
import { registrationAdminUpdateSchema } from "@/lib/validation";
import { updateRegistrationById, type DatabaseError } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminApi(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = registrationAdminUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const updated = await updateRegistrationById(id, {
      fullName: parsed.data.fullName,
      contactNumber: parsed.data.contactNumber,
      email: parsed.data.email || null,
      church: parsed.data.church,
      role: parsed.data.role === "Others" ? parsed.data.roleOther || "Others" : parsed.data.role || null,
      hasVehicle: parsed.data.hasVehicle,
      plateNumber: parsed.data.plateNumber || null
    });

    if (!updated) {
      return NextResponse.json({ message: "Registration not found." }, { status: 404 });
    }

    return NextResponse.json({ registration: updated });
  } catch (error) {
    const dbError = error as DatabaseError;
    const message = error instanceof Error ? error.message : "Unable to update registration.";
    if (dbError.code === "23505" || message.toLowerCase().includes("duplicate key value")) {
      return NextResponse.json(
        { message: "Duplicate registration detected for the same name and contact number." },
        { status: 409 }
      );
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
