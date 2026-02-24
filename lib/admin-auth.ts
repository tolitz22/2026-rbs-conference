import "server-only";
import { createHmac, createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function parseCookie(cookieHeader: string | null, key: string) {
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${key}=`));

  if (!match) return null;
  const [, rawValue] = match.split("=");
  if (!rawValue) return null;

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return null;
  }
}

function secureCompare(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function createAdminSessionToken() {
  const secret = getSessionSecret();
  if (!secret) return null;

  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = String(expiresAt);
  const signature = sign(payload, secret);
  return `${payload}.${signature}`;
}

export function isValidAdminSessionToken(token: string | null) {
  if (!token) return false;

  const secret = getSessionSecret();
  if (!secret) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt)) return false;
  if (expiresAt <= Date.now()) return false;

  const expected = sign(payload, secret);
  return secureCompare(signature, expected);
}

export function isAdminAuthenticatedFromCookieHeader(cookieHeader: string | null) {
  const token = parseCookie(cookieHeader, ADMIN_SESSION_COOKIE);
  return isValidAdminSessionToken(token);
}

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: encodeURIComponent(token),
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION_MS / 1000
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0)
  });
}

export function requireAdminApi(request: Request) {
  const isAuthed = isAdminAuthenticatedFromCookieHeader(request.headers.get("cookie"));
  if (isAuthed) return null;
  return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
}
