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
    return new Response(result.error.message, { status: 500 });
  }

  const rows = result.data.map(rowToRegistration);
  const header = ["Name", "Contact", "Email", "Church", "Has Vehicle", "Plate Number", "Date Registered"];
  const csvRows = rows.map((row) =>
    [
      row.fullName,
      row.contactNumber,
      row.email ?? "",
      row.church,
      row.hasVehicle ? "Yes" : "No",
      row.plateNumber ?? "",
      new Date(row.createdAt).toISOString()
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(",")
  );

  const csv = [header.join(","), ...csvRows].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=registrations.csv"
    }
  });
}
