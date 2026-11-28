"use client";
// Admin Sign-In (bottom of ⋯). Shown only when Supabase is configured. Supabase emails a one-time code;
// the database decides who is an admin (supabase/schema.sql). No passwords live in this app.
import { useState } from "react";
import { remoteEnabled, sendCode, signOut, useAdmin, verifyCode } from "@/lib/remote";

export default function AdminSignIn() {
  const a = useAdmin();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  if (!remoteEnabled) return null;
  const run = async (f: () => Promise<void>) => {
    setBusy(true);
    setMsg(null);
    try {
      await f();
    } catch (e: any) {
      setMsg(e?.message || "That didn't work.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="grid gap-2">
      <p className="k">Admin Sign-In</p>
      {a.signedIn ? (
        <>
          <p className="text-sm">{a.email} · {a.admin ? "admin: Edit → Save publishes live" : "signed in, but not on the admin list"}</p>
          <button type="button" className="btn sm justify-self-start" onClick={() => run(signOut)}>Sign out</button>
        </>
      ) : step === "email" ? (
        <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); run(async () => { await sendCode(email.trim()); setStep("code"); setMsg("Check your email for the code."); }); }}>
          <input className="input" type="email" autoComplete="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="btn sm justify-self-start" disabled={busy || !email.trim()}>Email me a code</button>
        </form>
      ) : (
        <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); run(async () => { await verifyCode(email.trim(), code); setCode(""); setStep("email"); }); }}>
          <input className="input" inputMode="numeric" autoComplete="one-time-code" placeholder="Code from the email" value={code} onChange={(e) => setCode(e.target.value)} required />
          <div className="btn-row">
            <button type="submit" className="btn sm primary" disabled={busy || !code.trim()}>Sign in</button>
            <button type="button" className="btn sm" onClick={() => { setStep("email"); setMsg(null); }}>Back</button>
          </div>
        </form>
      )}
      {msg && <p className="text-sm muted" role="status">{msg}</p>}
    </section>
  );
}
