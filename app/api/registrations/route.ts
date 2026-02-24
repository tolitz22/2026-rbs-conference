import { NextResponse } from "next/server";
import { listRegistrations } from "@/lib/db";

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
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const vehicle = searchParams.get("vehicle");
  const confirmed = searchParams.get("confirmed");
  const vehicleFilter = vehicle === "yes" || vehicle === "no" ? vehicle : undefined;
  const confirmedFilter = confirmed === "yes" || confirmed === "no" ? confirmed : undefined;

  try {
    const registrations = await withTimeout(listRegistrations({ query, vehicle: vehicleFilter, confirmed: confirmedFilter }), 8000);
    return NextResponse.json({ registrations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load registrations.";
    const status = message.includes("timed out") ? 504 : 500;
    return NextResponse.json({ message }, { status });
  }
}
