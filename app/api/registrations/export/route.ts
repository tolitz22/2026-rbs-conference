import { listRegistrations } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function GET(request: Request) {
  const unauthorized = requireAdminApi(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const vehicle = searchParams.get("vehicle");
    const confirmed = searchParams.get("confirmed");
    const vehicleFilter = vehicle === "yes" || vehicle === "no" ? vehicle : undefined;
    const confirmedFilter = confirmed === "yes" || confirmed === "no" ? confirmed : undefined;
    const rows = await withTimeout(listRegistrations({ query, vehicle: vehicleFilter, confirmed: confirmedFilter }), 8000);
    const header = ["Name", "Contact", "Email", "Church", "Role/Ministry", "Has Vehicle", "Plate Number", "Confirmed Attendance", "Date Registered"];
    const csvRows = rows.map((row) =>
      [
        row.fullName,
        row.contactNumber,
        row.email ?? "",
        row.church,
        row.role ?? "",
        row.hasVehicle ? "Yes" : "No",
        row.plateNumber ?? "",
        row.confirmedAttendance ? "Yes" : "No",
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to export registrations.";
    const status = message.includes("timed out") ? 504 : 500;
    return new Response(message, { status });
  }
}
