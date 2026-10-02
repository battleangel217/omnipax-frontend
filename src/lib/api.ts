/**
 * Omnipax backend client (Django REST + SimpleJWT).
 *
 * Base URL comes from NEXT_PUBLIC_API_URL (see .env.example).
 * All calls are safe to use when the backend is down: network errors
 * throw ApiUnreachable, which callers treat as "stay in demo mode".
 */

const BASE =
  (
    process.env.NEXT_PUBLIC_API_URL ??
    "https://omnipax-backend-jgmx.onrender.com"
  ).replace(/\/$/, "");

export class ApiUnreachable extends Error {
  constructor() {
    super("Backend unreachable");
    this.name = "ApiUnreachable";
  }
}

type Tokens = { access: string; refresh: string };

const TOKEN_KEY = "transitsight-tokens";

export function loadTokens(): Tokens | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  } catch {
    return null;
  }
}

export function saveTokens(t: Tokens | null) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, JSON.stringify(t));
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  auth = true,
  timeoutMs = 25000
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (auth) {
    const tokens = loadTokens();
    if (tokens) headers.Authorization = `Bearer ${tokens.access}`;
  }
  let res: Response;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers,
      signal: ctrl.signal,
    });
  } catch {
    throw new ApiUnreachable();
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {}
    const err = new Error(
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : `Request failed (${res.status})`
    );
    (err as { status?: number; body?: unknown }).status = res.status;
    (err as { body?: unknown }).body = body;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // --- public ---
  health: () =>
    request<{ status: string; db: string; cache: string; redis: string }>(
      "/api/health/",
      {},
      false
    ),

  // --- auth (AllowAny) ---
  signup: (p: { email: string; phone_number: string; password: string }) =>
    request<{ id: string; email: string; detail: string }>(
      "/api/auth/signup/",
      { method: "POST", body: JSON.stringify(p) },
      false
    ),
  otpRequest: (email: string) =>
    request<{ detail: string }>(
      "/api/auth/otp/request/",
      { method: "POST", body: JSON.stringify({ email }) },
      false
    ),
  otpVerify: (email: string, code: string) =>
    request<{ detail: string } & Tokens>(
      "/api/auth/otp/verify/",
      { method: "POST", body: JSON.stringify({ email, code }) },
      false
    ),
  login: (phone_number: string, password: string) =>
    request<Tokens>(
      "/api/auth/login/",
      { method: "POST", body: JSON.stringify({ phone_number, password }) },
      false
    ),

  // --- pins (authenticated) ---
  pinCreate: (p: {
    device_id: string;
    latitude: number;
    longitude: number;
    corridor_id: string;
    vehicle_type: string;
    direction?: string;
  }) => request<unknown>("/api/pins/", { method: "POST", body: JSON.stringify(p) }),
  pinActive: () => request<unknown>("/api/pins/active/"),
  pinStatus: (id: string) => request<unknown>(`/api/pins/${id}/status/`),
  pinCancel: (id: string) =>
    request<unknown>(`/api/pins/${id}/cancel/`, { method: "POST" }),
  tipInitiate: (pinId: string, amount?: number) =>
    request<{ tip_id: string; status: string; redirect_url?: string }>(
      `/api/pins/${pinId}/tip/`,
      { method: "POST", body: JSON.stringify({ amount: amount ?? null }) }
    ),

  // --- driver (role-gated) ---
  driverRegister: (p: {
    registration_id: string;
    vehicle_type: string;
    plate_number: string;
    approved_corridor_id: string;
  }) =>
    request<unknown>("/api/auth/driver/register/", {
      method: "POST",
      body: JSON.stringify(p),
    }),
  driverHeartbeat: (p: {
    latitude: number;
    longitude: number;
    accuracy_meters?: number;
  }) =>
    request<unknown>("/api/driver/location/", {
      method: "POST",
      body: JSON.stringify(p),
    }),
  driverOnline: (is_online: boolean) =>
    request<unknown>("/api/driver/online/", {
      method: "POST",
      body: JSON.stringify({ is_online }),
    }),
  driverZones: () => request<unknown>("/api/driver/zones/"),
  driverPins: () => request<unknown>("/api/driver/pins/"),
  pinAccept: (id: string) =>
    request<unknown>(`/api/driver/pins/${id}/accept/`, { method: "POST" }),
  pinDecline: (id: string) =>
    request<unknown>(`/api/driver/pins/${id}/decline/`, { method: "POST" }),
  pinComplete: (id: string) =>
    request<unknown>(`/api/driver/pins/${id}/complete/`, { method: "POST" }),

  // --- admin geo (IsAdminRole) ---
  corridors: () => request<unknown[]>("/api/admin/corridors/"),
  junctions: () => request<unknown[]>("/api/admin/junctions/"),
  restrictedZones: () => request<unknown[]>("/api/admin/restricted-zones/"),

  wsDriverUrl: (accessToken: string) =>
    `${BASE.replace(/^http/, "ws")}/ws/driver/?token=${accessToken}`,
};
