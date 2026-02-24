import { createClient } from "@supabase/supabase-js";
import { Registration, RegistrationPayload } from "@/types/registration";

export function getDb() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: { persistSession: false }
  });
}

type RegistrationRow = {
  id: string;
  full_name: string;
  contact_number: string;
  email: string | null;
  church: string;
  has_vehicle: boolean;
  plate_number: string | null;
  created_at: string;
};

export function rowToRegistration(row: RegistrationRow): Registration {
  return {
    id: row.id,
    fullName: row.full_name,
    contactNumber: row.contact_number,
    email: row.email,
    church: row.church,
    hasVehicle: row.has_vehicle,
    plateNumber: row.plate_number,
    createdAt: row.created_at
  };
}

export function payloadToRow(payload: RegistrationPayload) {
  return {
    full_name: payload.fullName.trim(),
    contact_number: payload.contactNumber.trim(),
    email: payload.email?.trim() || null,
    church: payload.church.trim(),
    has_vehicle: payload.hasVehicle,
    plate_number: payload.hasVehicle ? payload.plateNumber?.trim() || null : null
  };
}
