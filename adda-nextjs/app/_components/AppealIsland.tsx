"use client";

// F5.31c/F5.32/F5.33 — vətəndaş müraciəti forması. IdentityGate YOXDUR —
// bu, saytın İLK açıq (kimliksiz) formasıdır (bax F5.31d). Ad/e-poçt s.
// müştəridən BİRBAŞA gəlir (identity-dən götürülmür).
//
// F5.33 — TAM SƏHİFƏ formasıdır, `CorrectionIsland`-ın `.cx-*` (kiçik
// vidcet qabığı, 23-correction.css) SİNİFLƏRİNDƏN TAM AYRIDIR — öz
// `.ap-*` qabığını işlədir (40-appeal.css), enə TOXUNMUR (səhifənin
// `.container`-i idarə edir, bax CLAUDE.md DİZAYN QAYDALARI: "bir səhifə,
// bir en"). Başlıqda rəngli blok/ikon YOX — sadə Fraunces başlıq + bir
// sətir izah, üstdə kartın öz qızılı xətti kifayətdir.
//
// F5.32b — bütün sahələr HƏMİŞƏ göstərilir (əvvəlki versiyada "sual"
// seçiləndə ata adı/ünvan/bölmə gizlənirdi — F5.32-də ata adı MƏCBURİ
// oldu, sahə dəsti sadələşdirildi). Növ seçimi YENƏ DƏ ƏN YUXARIDADIR,
// YALNIZ qeyri-rəsmi/rəsmi QEYD mətni ondan asılıdır.
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
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

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
  const [consent, setConsent] = useState(false);
  // F5.32e — fayl base64 data-url kimi saxlanılır (serverə EYNİ formatda
  // göndərilir). Client tərəfdəki tip/ölçü yoxlaması YALNIZ UX üçündür —
  // əsl yoxlama serverdədir (bax appeal/controllers/appeal.ts sniffFile).
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentData, setAttachmentData] = useState("");
  const [attachmentErr, setAttachmentErr] = useState("");
  // F5.31d — honeypot: real istifadəçiyə görünmür (CSS-lə ekrandan kənara
  // çıxarılıb), botlar adətən HƏR sahəni doldurur. Dolu gələrsə server rədd edir.
  const [hpField, setHpField] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [err, setErr] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  const L = (k: string): string => labels[k] ?? k;
  const isFormal = appealType !== "sual";

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAttachmentErr("");
    if (!file) {
      setAttachmentName("");
      setAttachmentData("");
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentErr(L("attachmentTooLarge"));
      e.target.value = "";
      setAttachmentName("");
      setAttachmentData("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentData(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
    setAttachmentName(file.name);
  };

  const reset = () => {
    setFirstName("");
    setLastName("");
    setPatronymic("");
    setEmail("");
    setPhone("");
    setAddress("");
    setTargetUnit("");
    setSubject("");
    setMessage("");
    setConsent(false);
    setAttachmentName("");
    setAttachmentData("");
    setAttachmentErr("");
    setHpField("");
    setTrackingCode("");
    setErr("");
    setPhase("idle");
  };

  const submit = async () => {
    if (
      !firstName.trim() || !lastName.trim() || !patronymic.trim() ||
      !email.trim() || !phone.trim() || !subject.trim() || !message.trim()
    ) {
      setErr(L("requiredErr"));
      setPhase("error");
      return;
    }
    // F5.32b — razılıq qutusu MƏCBURİDİR, serverə GÖNDƏRİLMİR (sadəcə
    // göndərişdən əvvəlki UI şərtidir — FİN kimi əlavə şəxsi məlumat deyil).
    if (!consent) {
      setErr(L("consentErr"));
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
          attachment: attachmentData || undefined,
          website: hpField,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; trackingCode?: string };
      if (res.status === 429) {
        setErr(L("tooMany"));
        setPhase("error");
        return;
      }
      // F5.32e — əlavə tip/ölçü serverdə rədd edilibsə spesifik mesaj.
      if (data.error === "bad_attachment_type" || data.error === "bad_attachment_encoding") {
        setErr(L("attachmentBadType"));
        setPhase("error");
        return;
      }
      if (data.error === "attachment_too_large") {
        setErr(L("attachmentTooLarge"));
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
      <section className="ap-shell" aria-label={L("title")}>
        <div className="ap-done">
          <span className="ap-done-ic">
            <i className="ti ti-check" aria-hidden="true" />
          </span>
          <p className="ap-done-msg">{L("successMsg")}</p>
          {trackingCode ? (
            <p className="ap-code">
              <span className="ap-code-label">{L("trackingLabel")}</span>
              {/* F5.32c — böyük, seçilə bilən (mətn kimi, düymə DEYİL). */}
              <span className="ap-code-value" role="textbox" aria-readonly="true" tabIndex={0}>
                {trackingCode}
              </span>
            </p>
          ) : null}
          <p className="ap-status">
            <span className={"ap-status-tag" + (isFormal ? " ap-status-tag--formal" : "")}>
              {isFormal ? L("formalStatus") : L("informalStatus")}
            </span>
            <span className="ap-status-type">{L("type_" + appealType)}</span>
          </p>
          {isFormal ? (
            <p className="ap-note ap-note--done">
              <i className="ti ti-clock" aria-hidden="true" />
              {L("deadlineNote")}
            </p>
          ) : null}
          <p className="ap-done-sub">{L("successSub")}</p>
          <button type="button" className="ap-reset" onClick={reset}>
            <i className="ti ti-plus" aria-hidden="true" />
            {L("newAppeal")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="ap-shell" aria-label={L("title")}>
      <header className="ap-header">
        <h3 className="ap-h2">{L("title")}</h3>
        <p className="ap-lead">{L("subtitle")}</p>
      </header>

      <div className="ap-body">
        <div className="ap-field">
          <span className="ap-label">{L("typeLabel")}</span>
          <div className="ap-seg" role="group">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`ap-seg-btn${appealType === t ? " is-active" : ""}`}
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

        <div className="ap-grid">
          <div className="ap-field">
            <label className="ap-label ap-label-ic" htmlFor="ap-first"><i className="ti ti-user" aria-hidden="true" />{L("firstNameLabel")}</label>
            <input id="ap-first" className="ap-in" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={100} required />
          </div>
          <div className="ap-field">
            <label className="ap-label ap-label-ic" htmlFor="ap-last"><i className="ti ti-user" aria-hidden="true" />{L("lastNameLabel")}</label>
            <input id="ap-last" className="ap-in" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={100} required />
          </div>
          <div className="ap-field">
            <label className="ap-label ap-label-ic" htmlFor="ap-patronymic"><i className="ti ti-user" aria-hidden="true" />{L("patronymicLabel")}</label>
            <input id="ap-patronymic" className="ap-in" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} maxLength={100} required />
          </div>
          <div className="ap-field">
            <label className="ap-label ap-label-ic" htmlFor="ap-email"><i className="ti ti-mail" aria-hidden="true" />{L("emailLabel")}</label>
            <input id="ap-email" type="email" className="ap-in" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required />
          </div>
          <div className="ap-field">
            <label className="ap-label ap-label-ic" htmlFor="ap-phone"><i className="ti ti-phone" aria-hidden="true" />{L("phoneLabel")}</label>
            <input id="ap-phone" type="tel" className="ap-in" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} required />
          </div>
          <div className="ap-field">
            <label className="ap-label" htmlFor="ap-address">{L("addressLabel")}</label>
            <input id="ap-address" className="ap-in" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} />
          </div>
          <div className="ap-field ap-grid-full">
            <label className="ap-label ap-label-ic" htmlFor="ap-subject"><i className="ti ti-file-text" aria-hidden="true" />{L("subjectLabel")}</label>
            <input id="ap-subject" className="ap-in" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={300} required />
          </div>
          {units.length ? (
            <div className="ap-field ap-grid-full">
              <label className="ap-label" htmlFor="ap-unit">{L("unitLabel")}</label>
              <select id="ap-unit" className="ap-in" value={targetUnit} onChange={(e) => setTargetUnit(e.target.value)}>
                <option value="">{L("unitPlaceholder")}</option>
                {units.map((u) => (
                  <option key={u.documentId} value={u.documentId}>{u.name}</option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="ap-field ap-grid-full">
            <label className="ap-label ap-label-ic" htmlFor="ap-message"><i className="ti ti-message" aria-hidden="true" />{L("messageLabel")}</label>
            <textarea id="ap-message" className="ap-ta" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} required />
          </div>
          <div className="ap-field ap-grid-full">
            <label className="ap-label" htmlFor="ap-attachment">{L("attachmentLabel")}</label>
            <input
              id="ap-attachment"
              type="file"
              className="ap-in ap-file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={onFileChange}
            />
            <span className="ap-hint">{L("attachmentHint")}</span>
            {attachmentName ? <span className="ap-file-name"><i className="ti ti-paperclip" aria-hidden="true" />{attachmentName}</span> : null}
            {attachmentErr ? <span className="ap-file-err">{attachmentErr}</span> : null}
          </div>
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

        <label className="ap-consent">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
          <span>{L("consentLabel")}</span>
        </label>

        <div className="ap-actions">
          <button type="button" className="ap-submit" onClick={submit} disabled={phase === "sending"}>
            <i className="ti ti-send" aria-hidden="true" />
            {phase === "sending" ? L("sending") : L("submit")}
          </button>
        </div>
        {phase === "error" && err ? <p className="ap-err">{err}</p> : null}
      </div>
    </section>
  );
}
