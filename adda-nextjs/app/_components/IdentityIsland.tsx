"use client";

// F2.6e-2 — /[locale]/kimlik səhifəsinin adası.
// Təsdiqlənməyibsə IdentityGate, təsdiqlənibsə kimlik kartı + çıxış.
import IdentityGate, { useIdentity } from "./IdentityGate";

interface IdentityIslandProps {
  locale: string;
  labels: Record<string, string>;
}

export default function IdentityIsland({ locale, labels }: IdentityIslandProps) {
  const { identity, loading, logout } = useIdentity();
  const L = (k: string): string => labels[k] ?? k;

  if (loading) {
    return (
      <section className="idn-card idn-card--wait" aria-busy="true">
        <span className="idn-spin" aria-hidden="true" />
        <p className="idn-wait-p">{L("loading")}</p>
      </section>
    );
  }

  if (!identity) {
    return (
      <section className="idn-card">
        <IdentityGate locale={locale} labels={labels} />
      </section>
    );
  }

  const initial = (identity.name || identity.email).trim().charAt(0).toUpperCase();

  return (
    <section className="idn-card">
      <div className="idn-who">
        <span className="idn-avatar" aria-hidden="true">
          {initial}
        </span>
        <div className="idn-who-copy">
          <div className="idn-who-line">
            <span className="idn-who-name">{identity.name || identity.email}</span>
            <span className="idn-badge">
              <i className="ti ti-rosette-discount-check" aria-hidden="true" />
              {L("verified")}
            </span>
          </div>
          {identity.name ? <p className="idn-who-mail">{identity.email}</p> : null}
          <p className="idn-who-note">{L("verifiedNote")}</p>
        </div>
      </div>
      <button type="button" className="idn-logout" onClick={() => void logout()}>
        <i className="ti ti-logout" aria-hidden="true" />
        {L("logout")}
      </button>
    </section>
  );
}
