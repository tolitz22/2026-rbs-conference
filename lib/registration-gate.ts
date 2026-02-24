import { RegistrationSettings } from "@/lib/db";

export type RegistrationGateStatus = {
  isOpen: boolean;
  reason: "manual_off" | "not_started" | "ended" | "full" | "open";
  message: string;
  startsAt: string | null;
  endsAt: string | null;
  maxCapacity: number | null;
};

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getRegistrationGateStatus(settings: RegistrationSettings, currentCount: number): RegistrationGateStatus {
  const startsAt = parseDate(settings.starts_at);
  const endsAt = parseDate(settings.ends_at);
  const maxCapacity = settings.max_capacity;
  const now = new Date();

  if (!settings.enabled) {
    return {
      isOpen: false,
      reason: "manual_off",
      message: "Registration is currently closed.",
      startsAt: startsAt?.toISOString() ?? null,
      endsAt: endsAt?.toISOString() ?? null,
      maxCapacity
    };
  }

  if (!startsAt) {
    return {
      isOpen: false,
      reason: "not_started",
      message: "Registration opening date is not set yet.",
      startsAt: null,
      endsAt: endsAt?.toISOString() ?? null,
      maxCapacity
    };
  }

  if (startsAt && now < startsAt) {
    return {
      isOpen: false,
      reason: "not_started",
      message: `Registration opens on ${startsAt.toLocaleString()}.`,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt?.toISOString() ?? null,
      maxCapacity
    };
  }

  if (endsAt && now > endsAt) {
    return {
      isOpen: false,
      reason: "ended",
      message: "Registration has ended.",
      startsAt: startsAt?.toISOString() ?? null,
      endsAt: endsAt.toISOString(),
      maxCapacity
    };
  }

  if (maxCapacity !== null && currentCount >= maxCapacity) {
    return {
      isOpen: false,
      reason: "full",
      message: "Registration is closed: maximum capacity reached.",
      startsAt: startsAt?.toISOString() ?? null,
      endsAt: endsAt?.toISOString() ?? null,
      maxCapacity
    };
  }

  return {
    isOpen: true,
    reason: "open",
    message: "Registration is open.",
    startsAt: startsAt?.toISOString() ?? null,
    endsAt: endsAt?.toISOString() ?? null,
    maxCapacity
  };
}
