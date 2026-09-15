"use client";

// F5.31c — vətəndaş müraciəti forması. CorrectionIsland.tsx nümunəsi
// (paneli, `labels` prop-u, phase axını), AMMA IdentityGate YOXDUR — bu,
// saytın İLK açıq (kimliksiz) formasıdır (bax F5.31d). Ad/e-poçt s.
// müştəridən BİRBAŞA gəlir (identity-dən götürülmür, çünki kimlik yoxdur).
//
// "Sual" (qeyri-rəsmi) seçiləndə YALNIZ məcburi sahələr göstərilir (ad,
// soyad, e-poçt, telefon, mövzu, mətn) + qısa qeyd. Rəsmi növ (təklif/
// ərizə/şikayət) seçiləndə əlavə olaraq ata adı/ünvan/aidiyyəti bölmə də
// göstərilir ("tam sahələr") + qanuni müddət qeydi (səhifədəki "Baxılma
// müddətləri" bölməsinə keçid — BURADA rəqəm YAZILMIR, F5.31b-dəki eyni
// səbəb: hüquq məsləhətçisi təsdiqləyənədək boş).
import { useState } from "react";

export type AppealType = "sual" | "teklif" | "erize" | "sikayet";
type Phase = "idle" | "sending" | "done" | "error";

export interface AppealUnitOption {
  documentId: string;
  name: string;
}

interface AppealIslandProps {
  units: AppealUnitOption[];
  labels: Record<string, string>;
}

const TYPES: AppealType[] = ["sual", "teklif", "erize", "sikayet"];

export default function AppealIsland({ units, labels }: AppealIslandProps) {
  const [appealType, setAppealType] = useState<AppealType>("sual");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [targetUnit, setTargetUnit] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  // F5.31d — honeypot: real istifadəçiyə görünmür (CSS-lə ekrandan kənara
  // çıxarılıb), botlar adətən HƏR sahəni doldurur. Dolu gələrsə server rədd edir.
  const [hpField, setHpField] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [err, setErr] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  const L = (k: string): string => labels[k] ?? k;
  const isFormal = appealType !== "sual";

  const submit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !subject.trim() || !message.trim()) {
      setErr(L("requiredErr"));
      setPhase("error");
      return;
    }
    setPhase("sending");
    setErr("");
    try {
      const res = await fetch("/api/submit/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appealType,
          firstName,
          lastName,
          patronymic,
          email,
          phone,
          address,
          targetUnit: targetUnit || undefined,
          subject,
          message,
          website: hpField,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; trackingCode?: string };
      if (res.status === 429) {
        setErr(L("tooMany"));
        setPhase("error");
        return;
      }
      if (!res.ok || !data.ok) throw new Error(data.error || "appeal post failed");
      setTrackingCode(data.trackingCode || "");
      setPhase("done");
    } catch {
      setErr(L("error"));
      setPhase("error");
    }
  };

  if (phase === "done") {
    return (
      <section className="cx ap" aria-label={L("title")}>
        <div className="cx-done">
          <span className="cx-done-ic">
            <i className="ti ti-check" aria-hidden="true" />
          </span>
          <p className="cx-done-msg">{L("successMsg")}</p>
          {trackingCode ? (
            <p className="ap-code">
              <span className="ap-code-label">{L("trackingLabel")}</span>
              <span className="ap-code-value">{trackingCode}</span>
            </p>
          ) : null}
          <p className="cx-done-sub">{L("successSub")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="cx ap" aria-label={L("title")}>
      <header className="cx-head">
        <span className="cx-head-ic">
          <i className="ti ti-send" aria-hidden="true" />
        </span>
        <div>
          <h3 className="cx-title">{L("title")}</h3>
          <p className="cx-sub">{L("subtitle")}</p>
        </div>
      </header>

      <div className="cx-body">
        <div className="cx-field">
          <span className="cx-label">{L("typeLabel")}</span>
          <div className="cx-seg" role="group">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`cx-seg-btn${appealType === t ? " is-active" : ""}`}
                onClick={() => setAppealType(t)}
              >
                {L("type_" + t)}
              </button>
            ))}
          </div>
        </div>

        {!isFormal ? (
          <p className="ap-note">
            <i className="ti ti-info-circle" aria-hidden="true" />
            {L("informalNote")}
          </p>
        ) : (
          <p className="ap-note">
            <i className="ti ti-clock" aria-hidden="true" />
            {L("deadlineNote")}
          </p>
        )}

        <div className="cx-row">
          <div className="cx-field">
            <label className="cx-label" htmlFor="ap-first">{L("firstNameLabel")}</label>
            <input id="ap-first" className="cx-in" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={100} required />
          </div>
          <div className="cx-field">
            <label className="cx-label" htmlFor="ap-last">{L("lastNameLabel")}</label>
            <input id="ap-last" className="cx-in" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={100} required />
          </div>
          {isFormal ? (
            <div className="cx-field">
              <label className="cx-label" htmlFor="ap-patronymic">{L("patronymicLabel")}</label>
              <input id="ap-patronymic" className="cx-in" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} maxLength={100} />
            </div>
          ) : null}
        </div>

        <div className="cx-row">
          <div className="cx-field">
            <label className="cx-label" htmlFor="ap-email">{L("emailLabel")}</label>
            <input id="ap-email" type="email" className="cx-in" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required />
          </div>
          <div className="cx-field">
            <label className="cx-label" htmlFor="ap-phone">{L("phoneLabel")}</label>
            <input id="ap-phone" type="tel" className="cx-in" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} required />
          </div>
        </div>

        {isFormal ? (
          <div className="cx-row">
            <div className="cx-field">
              <label className="cx-label" htmlFor="ap-address">{L("addressLabel")}</label>
              <input id="ap-address" className="cx-in" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} />
            </div>
            {units.length ? (
              <div className="cx-field">
                <label className="cx-label" htmlFor="ap-unit">{L("unitLabel")}</label>
                <select id="ap-unit" className="cx-in" value={targetUnit} onChange={(e) => setTargetUnit(e.target.value)}>
                  <option value="">{L("unitPlaceholder")}</option>
                  {units.map((u) => (
                    <option key={u.documentId} value={u.documentId}>{u.name}</option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="cx-field">
          <label className="cx-label" htmlFor="ap-subject">{L("subjectLabel")}</label>
          <input id="ap-subject" className="cx-in" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={300} required />
        </div>

        <div className="cx-field">
          <label className="cx-label" htmlFor="ap-message">{L("messageLabel")}</label>
          <textarea id="ap-message" className="cx-ta" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} required />
        </div>

        {/* F5.31d — honeypot: gizli sahə, real istifadəçi görmür/doldurmur. */}
        <div className="ap-hp" aria-hidden="true">
          <label htmlFor="ap-hp-field">Website</label>
          <input
            id="ap-hp-field"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={hpField}
            onChange={(e) => setHpField(e.target.value)}
          />
        </div>

        <div className="cx-actions">
          <button type="button" className="cx-submit" onClick={submit} disabled={phase === "sending"}>
            <i className="ti ti-send" aria-hidden="true" />
            {phase === "sending" ? L("sending") : L("submit")}
          </button>
        </div>
        {phase === "error" && err ? <p className="cx-err">{err}</p> : null}
      </div>
    </section>
  );
}
