import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAdminSessionToken,
  setAdminSessionCookie
} from "@/lib/admin-auth";
import { verifyAdminCredentials } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const attempts = new Map<string, { count: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 8;
const BLOCK_WINDOW_MS = 1000 * 60 * 10;

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function isBlocked(key: string) {
  const record = attempts.get(key);
  if (!record) return false;
  if (record.blockedUntil <= Date.now()) {
    attempts.delete(key);
    return false;
  }
  return true;
}

function recordFailedAttempt(key: string) {
  const current = attempts.get(key);
  if (!current) {
    attempts.set(key, { count: 1, blockedUntil: 0 });
    return;
  }

  const nextCount = current.count + 1;
  if (nextCount >= MAX_ATTEMPTS) {
    attempts.set(key, { count: nextCount, blockedUntil: Date.now() + BLOCK_WINDOW_MS });
    return;
  }

  attempts.set(key, { count: nextCount, blockedUntil: current.blockedUntil });
}

function clearAttempts(key: string) {
  attempts.delete(key);
}

export async function POST(request: Request) {
  if (!process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ message: "ADMIN_SESSION_SECRET is not configured." }, { status: 500 });
  }

  try {
    const ip = getClientIp(request);
    if (isBlocked(ip)) {
      return NextResponse.json({ message: "Too many attempts. Try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Valid email and password are required." }, { status: 400 });
    }

    const valid = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
    if (!valid) {
      recordFailedAttempt(ip);
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }
    clearAttempts(ip);

    const token = createAdminSessionToken();
    if (!token) {
      return NextResponse.json({ message: "Admin session could not be created." }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true });
    setAdminSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }
}
