import { NextResponse } from "next/server";
import { getDb, rowToRegistration } from "@/lib/db";

export async function GET(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const vehicle = searchParams.get("vehicle");

  let qb = db.from("registrations").select("*").order("created_at", { ascending: false });

  if (query) {
    qb = qb.or(`full_name.ilike.%${query}%,contact_number.ilike.%${query}%`);
  }

  if (vehicle === "yes") qb = qb.eq("has_vehicle", true);
  if (vehicle === "no") qb = qb.eq("has_vehicle", false);

  const result = await qb;

  if (result.error) {
    return NextResponse.json({ message: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ registrations: result.data.map(rowToRegistration) });
}
