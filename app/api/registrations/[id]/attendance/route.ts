import { NextResponse } from "next/server";
import { z } from "zod";
import { updateConfirmedAttendance } from "@/lib/db";

const attendanceSchema = z.object({
  confirmedAttendance: z.boolean()
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = attendanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid attendance payload." }, { status: 400 });
    }

    const updated = await updateConfirmedAttendance(id, parsed.data.confirmedAttendance);
    if (!updated) {
      return NextResponse.json({ message: "Registration not found." }, { status: 404 });
    }

    return NextResponse.json({ registration: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update attendance.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
