"use client";
// Supabase-ready publishing for card edits. Off unless NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// are set at build time; with neither set, nothing here runs and edits stay in dojo_content_overrides_v1 as before.
// Plain fetch calls to Supabase's REST and Auth endpoints. Who may publish is decided by the database
// (row-level security + the admins table, see supabase/schema.sql), never by anything in this file.
import { useSyncExternalStore } from "react";

const BASE = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const remoteEnabled = !!(BASE && ANON);

const SESSION_KEY = "dojo_admin_session_v1";

export type Published = Record<string, { body: string; at: string }>;
interface Session { access_token: string; refresh_token: string; expires_at: number; email?: string }
export interface AdminState { email?: string; signedIn: boolean; admin: boolean }

function store<T>(initial: T) {
  let v = initial;
  const ls = new Set<() => void>();
  return {
    get: () => v,
    set: (n: T) => {
      v = n;
      ls.forEach((l) => l());
    },
    sub: (l: () => void) => {
      ls.add(l);
      return () => {
        ls.delete(l);
      };
    },
  };
}
const EMPTY: Published = {};
const OUT: AdminState = { signedIn: false, admin: false };
const published = store<Published>(EMPTY);
const admin = store<AdminState>(OUT);
let session: Session | null = null;

export const usePublished = () => useSyncExternalStore(published.sub, published.get, () => EMPTY);
export const useAdmin = () => useSyncExternalStore(admin.sub, admin.get, () => OUT);
export const isAdminNow = () => remoteEnabled && admin.get().admin && !!session;

const headers = (token?: string): Record<string, string> => ({ apikey: ANON, Authorization: `Bearer ${token || ANON}`, "Content-Type": "application/json" });

async function call(path: string, init: RequestInit = {}, token?: string) {
  const r = await fetch(`${BASE}${path}`, { ...init, headers: { ...headers(token), ...((init.headers as Record<string, string>) || {}) } });
  if (!r.ok) {
    let msg = `${r.status}`;
    try {
      const j = await r.json();
      msg = j.msg || j.message || j.error_description || j.error || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

function keep(s: any, email?: string): Session {
  const out: Session = {
    access_token: s.access_token,
    refresh_token: s.refresh_token,
    expires_at: s.expires_at ? s.expires_at * 1000 : Date.now() + (s.expires_in || 3600) * 1000,
    email: s.user?.email || email,
  };
  session = out;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(out));
  } catch {
    /* ignore */
  }
  return out;
}

async function token(): Promise<string | null> {
  if (!session) return null;
  if (Date.now() < session.expires_at - 60_000) return session.access_token;
  try {
    const s = await call("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: JSON.stringify({ refresh_token: session.refresh_token }) });
    return keep(s, session.email).access_token;
  } catch {
    await signOut();
    return null;
  }
}

async function checkAdmin() {
  const t = await token();
  if (!t) return admin.set(OUT);
  try {
    const ok = await call("/rest/v1/rpc/is_admin", { method: "POST", body: "{}" }, t);
    admin.set({ email: session?.email, signedIn: true, admin: ok === true });
  } catch {
    admin.set({ email: session?.email, signedIn: true, admin: false });
  }
}

export async function refreshPublished() {
  if (!remoteEnabled) return;
  try {
    const rows: { card_id: string; body: string; updated_at: string }[] = await call("/rest/v1/content_overrides?select=card_id,body,updated_at");
    const next: Published = {};
    for (const r of rows || []) next[r.card_id] = { body: r.body, at: r.updated_at };
    published.set(next);
  } catch {
    /* offline or not set up yet: keep the built-in text */
  }
}

let booted = false;
export function bootRemote() {
  if (!remoteEnabled || booted || typeof window === "undefined") return;
  booted = true;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) session = JSON.parse(raw);
  } catch {
    session = null;
  }
  refreshPublished();
  if (session) checkAdmin();
}

/** Step 1: Supabase emails a one-time code. No account is created for an unknown address. */
export async function sendCode(email: string) {
  await call("/auth/v1/otp", { method: "POST", body: JSON.stringify({ email, create_user: false }) });
}
/** Step 2: the code from that email signs in; the database then says whether this account is an admin. */
export async function verifyCode(email: string, code: string) {
  const s = await call("/auth/v1/verify", { method: "POST", body: JSON.stringify({ type: "email", email, token: code.trim() }) });
  keep(s, email);
  await checkAdmin();
  return admin.get();
}
export async function signOut() {
  const t = session?.access_token;
  session = null;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  admin.set(OUT);
  if (t) await call("/auth/v1/logout", { method: "POST" }, t).catch(() => undefined);
}

export async function publish(cardId: string, body: string) {
  const t = await token();
  if (!t) throw new Error("Signed out");
  const at = new Date().toISOString();
  await call("/rest/v1/content_overrides", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify([{ card_id: cardId, body, updated_at: at }]) }, t);
  published.set({ ...published.get(), [cardId]: { body, at } });
}
export async function unpublish(cardId: string) {
  const t = await token();
  if (!t) throw new Error("Signed out");
  await call(`/rest/v1/content_overrides?card_id=eq.${encodeURIComponent(cardId)}`, { method: "DELETE" }, t);
  const next = { ...published.get() };
  delete next[cardId];
  published.set(next);
}
