"use client";

// F2.6e-2 — Paylaşılan kimlik qatı.
// `useIdentity` hidrasiyadan sonra `/api/identity/me`-ni çağırır; səhifələr ISR ilə
// statik qalır (serverdə cookie oxusaydıq render dinamikləşərdi).
// Sessiya tokeni httpOnly cookie-dədir — bu modul onu heç vaxt görmür.
// Etiketlər props ilə gəlir: tam T lüğəti client bundle-a düşmür.
import { useCallback, useEffect, useState } from "react";

export interface Identity {
  email: string;
  name: string;
}

type GatePhase = "idle" | "sending" | "sent" | "error";

export function useIdentity() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/identity/me", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; email?: string; name?: string };
      setIdentity(data && data.ok && data.email ? { email: data.email, name: data.name ?? "" } : null);
    } catch {
      setIdentity(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/identity/logout", { method: "POST" });
    } catch {
      /* cookie yenə də serverdə silinməyə cəhd olundu */
    }
    setIdentity(null);
  }, []);

  return { identity, loading, refresh, logout };
}

interface IdentityGateProps {
  locale: string;
  labels: Record<string, string>;
  /** Təsdiqdən sonra qayıdılacaq daxili yol (məs. /az/tedbirler/xyz) */
  redirect?: string;
  /** Panelin başlığı — çağıran kontekstə uyğunlaşdırır */
  heading?: string;
}

export default function IdentityGate({ locale, labels, redirect, heading }: IdentityGateProps) {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<GatePhase>("idle");
  const [err, setErr] = useState("");

  const L = (k: string): string => labels[k] ?? k;

  const send = async () => {
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setErr(L("badEmail"));
      setPhase("error");
      return;
    }
    setPhase("sending");
    setErr("");
    try {
      const res = await fetch("/api/identity/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, locale, redirect: redirect ?? window.location.pathname }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.status === 429) {
        setErr(L("tooMany"));
        setPhase("error");
        return;
      }
      if (!res.ok || !data.ok) {
        setErr(data.error === "identity_unconfigured" ? L("unconfigured") : L("error"));
        setPhase("error");
        return;
      }
      setPhase("sent");
    } catch {
      setErr(L("error"));
      setPhase("error");
    }
  };

  if (phase === "sent") {
    return (
      <div className="idn-gate idn-gate--sent">
        <span className="idn-gate-ic" aria-hidden="true">
          <i className="ti ti-mail-fast" />
        </span>
        <div className="idn-gate-copy">
          <h4 className="idn-gate-h">{L("linkSent")}</h4>
          <p className="idn-gate-p">{L("checkInbox")}</p>
        </div>
        <button type="button" className="idn-gate-alt" onClick={() => setPhase("idle")}>
          {L("otherAddress")}
        </button>
      </div>
    );
  }

  return (
    <div className="idn-gate">
      <span className="idn-gate-ic" aria-hidden="true">
        <i className="ti ti-shield-lock" />
      </span>
      <div className="idn-gate-copy">
        <h4 className="idn-gate-h">{heading ?? L("verifyHeading")}</h4>
        <p className="idn-gate-p">{L("verifyIntro")}</p>
      </div>
      <div className="idn-gate-form">
        <input
          className="idn-gate-in"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={L("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
        />
        <button type="button" className="idn-gate-btn" onClick={() => void send()} disabled={phase === "sending"}>
          <i className="ti ti-send" aria-hidden="true" />
          {phase === "sending" ? L("sending") : L("sendLink")}
        </button>
      </div>
      {phase === "error" && err ? <p className="idn-gate-err">{err}</p> : null}
    </div>
  );
}
