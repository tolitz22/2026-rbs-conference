import { createClient } from "@supabase/supabase-js";
import { Registration, RegistrationPayload } from "@/types/registration";

type RegistrationRow = {
  id: string;
  full_name: string;
  contact_number: string;
  email: string | null;
  church: string;
  role: string | null;
  has_vehicle: boolean;
  plate_number: string | null;
  confirmed_attendance: boolean;
  created_at: string;
};

export type RegistrationSettings = {
  id: number;
  enabled: boolean;
  starts_at: string | null;
  ends_at: string | null;
  max_capacity: number | null;
};

function getDb() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
}

function rowToRegistration(row: RegistrationRow): Registration {
  return {
    id: row.id,
    fullName: row.full_name,
    contactNumber: row.contact_number,
    email: row.email,
    church: row.church,
    role: row.role,
    hasVehicle: row.has_vehicle,
    plateNumber: row.plate_number,
    confirmedAttendance: row.confirmed_attendance,
    createdAt: row.created_at
  };
}

function payloadToRow(payload: RegistrationPayload) {
  return {
    full_name: payload.fullName.trim(),
    contact_number: payload.contactNumber.trim(),
    email: payload.email?.trim() || null,
    church: payload.church.trim(),
    role: payload.role?.trim() || null,
    has_vehicle: payload.hasVehicle,
    plate_number: payload.hasVehicle ? payload.plateNumber?.trim() || null : null,
    confirmed_attendance: false
  };
}

export async function listRegistrations(params?: { query?: string; vehicle?: "yes" | "no"; confirmed?: "yes" | "no" }) {
  const db = getDb();
  const query = params?.query?.trim();

  let qb = db.from("registrations").select("*").order("created_at", { ascending: false });

  if (query) {
    qb = qb.or(`full_name.ilike.%${query}%,contact_number.ilike.%${query}%`);
  }

  if (params?.vehicle === "yes") qb = qb.eq("has_vehicle", true);
  if (params?.vehicle === "no") qb = qb.eq("has_vehicle", false);
  if (params?.confirmed === "yes") qb = qb.eq("confirmed_attendance", true);
  if (params?.confirmed === "no") qb = qb.eq("confirmed_attendance", false);

  const result = await qb;
  if (result.error) throw new Error(result.error.message);

  return (result.data ?? []).map((row) => rowToRegistration(row as RegistrationRow));
}

export async function hasDuplicateRegistration(fullName: string, contactNumber: string) {
  const db = getDb();
  const result = await db
    .from("registrations")
    .select("id")
    .eq("full_name", fullName.trim())
    .eq("contact_number", contactNumber.trim())
    .limit(1);

  if (result.error) throw new Error(result.error.message);
  return (result.data?.length ?? 0) > 0;
}

export async function insertRegistration(payload: RegistrationPayload): Promise<Registration> {
  const db = getDb();
  const insert = await db
    .from("registrations")
    .insert(payloadToRow(payload))
    .select("*")
    .single();

  if (insert.error || !insert.data) {
    throw new Error(insert.error?.message ?? "Unable to save registration.");
  }

  return rowToRegistration(insert.data as RegistrationRow);
}

export async function updateRegistrationById(id: string, payload: RegistrationPayload): Promise<Registration | null> {
  const db = getDb();
  const result = await db
    .from("registrations")
    .update({
      full_name: payload.fullName.trim(),
      contact_number: payload.contactNumber.trim(),
      email: payload.email?.trim() || null,
      church: payload.church.trim(),
      role: payload.role?.trim() || null,
      has_vehicle: payload.hasVehicle,
      plate_number: payload.hasVehicle ? payload.plateNumber?.trim() || null : null
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (result.error) throw new Error(result.error.message);
  if (!result.data) return null;

  return rowToRegistration(result.data as RegistrationRow);
}

export async function getRegistrationCount(): Promise<number> {
  const db = getDb();
  const result = await db
    .from("registrations")
    .select("id", { count: "exact", head: true });

  if (result.error) throw new Error(result.error.message);
  return result.count ?? 0;
}

export async function getRegistrationSettings(): Promise<RegistrationSettings> {
  const db = getDb();
  const result = await db
    .from("registration_settings")
    .select("id,enabled,starts_at,ends_at,max_capacity")
    .eq("id", 1)
    .maybeSingle();

  if (result.error) throw new Error(result.error.message);

  if (result.data) {
    return result.data as RegistrationSettings;
  }

  const inserted = await db
    .from("registration_settings")
    .upsert({
      id: 1,
      enabled: true,
      starts_at: null,
      ends_at: null,
      max_capacity: null
    })
    .select("id,enabled,starts_at,ends_at,max_capacity")
    .single();

  if (inserted.error || !inserted.data) {
    throw new Error(inserted.error?.message ?? "Unable to initialize registration settings.");
  }

  return inserted.data as RegistrationSettings;
}

export async function updateRegistrationSettings(input: {
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  maxCapacity: number | null;
}): Promise<RegistrationSettings> {
  const db = getDb();
  const result = await db
    .from("registration_settings")
    .upsert({
      id: 1,
      enabled: input.enabled,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      max_capacity: input.maxCapacity
    })
    .select("id,enabled,starts_at,ends_at,max_capacity")
    .single();

  if (result.error || !result.data) {
    throw new Error(result.error?.message ?? "Unable to update registration settings.");
  }

  return result.data as RegistrationSettings;
}

export async function updateConfirmedAttendance(id: string, confirmedAttendance: boolean): Promise<Registration | null> {
  const db = getDb();
  const result = await db
    .from("registrations")
    .update({ confirmed_attendance: confirmedAttendance })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (result.error) throw new Error(result.error.message);
  if (!result.data) return null;

  return rowToRegistration(result.data as RegistrationRow);
}
