import { NextResponse } from "next/server";
import { z } from "zod";
import { getRegistrationSettings, updateRegistrationSettings } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

const settingsSchema = z.object({
  enabled: z.boolean(),
  startsAt: z.string().datetime().nullable(),
  endsAt: z.string().datetime().nullable(),
  maxCapacity: z.number().int().positive().nullable()
}).superRefine((value, ctx) => {
  if (value.startsAt && value.endsAt && new Date(value.endsAt) <= new Date(value.startsAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endsAt"],
      message: "End date must be after start date."
    });
  }
});

export async function GET(request: Request) {
  const unauthorized = requireAdminApi(request);
  if (unauthorized) return unauthorized;

  try {
    const settings = await getRegistrationSettings();
    return NextResponse.json({
      enabled: settings.enabled,
      startsAt: settings.starts_at,
      endsAt: settings.ends_at,
      maxCapacity: settings.max_capacity
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load registration settings.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const unauthorized = requireAdminApi(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid settings.", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateRegistrationSettings(parsed.data);

    return NextResponse.json({
      enabled: updated.enabled,
      startsAt: updated.starts_at,
      endsAt: updated.ends_at,
      maxCapacity: updated.max_capacity
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update registration settings.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
