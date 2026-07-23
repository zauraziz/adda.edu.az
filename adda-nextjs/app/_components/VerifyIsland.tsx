"use client";

// F2.6e-2 — Magic-link təsdiq adası (/[locale]/kimlik/tesdiq).
//
// Token QƏSDƏN serverdən prop kimi ötürülmür — ada onu `window.location`-dan
// oxuyur. Bu sayədə (a) səhifə statik qalır, (b) token server HTML-inə düşmür.
// Təsdiq POST-ladır: poçt skanerləri GET etdiyi üçün tək istifadəlik token
// istifadəçi klikləməmiş yanardı.
import { useEffect, useState } from "react";

type Phase = "reading" | "ready" | "sending" | "done" | "invalid" | "missing";

interface VerifyIslandProps {
  locale: string;
  labels: Record<string, string>;
}

export default function VerifyIsland({ locale, labels }: VerifyIslandProps) {
  const [phase, setPhase] = useState<Phase>("reading");
  const [token, setToken] = useState("");
  const [target, setTarget] = useState("");

  const L = (k: string): string => labels[k] ?? k;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("t") ?? "";
    const r = params.get("r") ?? "";
    setTarget(r.startsWith("/") && !r.startsWith("//") ? r : "/" + locale + "/kimlik");
    if (!t) {
      setPhase("missing");
      return;
    }
    setToken(t);
    setPhase("ready");
  }, [locale]);

  const confirm = async () => {
    setPhase("sending");
    try {
      const res = await fetch("/api/identity/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (!res.ok || !data.ok) {
        setPhase("invalid");
        return;
      }
      // Tokeni ünvan sətrindən sil — brauzer tarixçəsində qalmasın.
      window.history.replaceState({}, "", window.location.pathname);
      setToken("");
      setPhase("done");
    } catch {
      setPhase("invalid");
    }
  };

  if (phase === "reading") {
    return (
      <section className="idn-card idn-card--wait" aria-busy="true">
        <span className="idn-spin" aria-hidden="true" />
      </section>
    );
  }

  if (phase === "done") {
    return (
      <section className="idn-card idn-verify">
        <span className="idn-verify-ic idn-verify-ic--ok" aria-hidden="true">
          <i className="ti ti-check" />
        </span>
        <h3 className="idn-verify-h">{L("verifiedOk")}</h3>
        <a className="idn-verify-cta" href={target}>
          {L("continue")}
          <i className="ti ti-arrow-right" aria-hidden="true" />
        </a>
      </section>
    );
  }

  if (phase === "invalid" || phase === "missing") {
    return (
      <section className="idn-card idn-verify">
        <span className="idn-verify-ic idn-verify-ic--bad" aria-hidden="true">
          <i className="ti ti-link-off" />
        </span>
        <h3 className="idn-verify-h">{phase === "missing" ? L("linkMissing") : L("linkInvalid")}</h3>
        <a className="idn-verify-cta" href={"/" + locale + "/kimlik"}>
          {L("requestNew")}
          <i className="ti ti-arrow-right" aria-hidden="true" />
        </a>
      </section>
    );
  }

  return (
    <section className="idn-card idn-verify">
      <span className="idn-verify-ic" aria-hidden="true">
        <i className="ti ti-mail-opened" />
      </span>
      <h3 className="idn-verify-h">{L("confirmHeading")}</h3>
      <p className="idn-verify-p">{L("confirmIntro")}</p>
      <button type="button" className="idn-verify-btn" onClick={() => void confirm()} disabled={phase === "sending"}>
        <i className="ti ti-shield-check" aria-hidden="true" />
        {phase === "sending" ? L("confirming") : L("confirm")}
      </button>
    </section>
  );
}
