"use client";

// F5.31c/F5.32/F5.33/F5.36 — vətəndaş müraciəti forması. IdentityGate YOXDUR —
// bu, saytın İLK açıq (kimliksiz) formasıdır (bax F5.31d). Ad/e-poçt s.
// müştəridən BİRBAŞA gəlir (identity-dən götürülmür).
//
// F5.36 — portal.adda.edu.az «Onlayn qeydiyyat forması» üslubu: ağ kart,
// dörd nömrələnmiş bölmə (1 Müraciət növü · 2 Şəxsi məlumatlar · 3 Müraciətin
// məzmunu · 4 Təsdiq və göndərmə), məcburi sahələrdə «*», göy (navy) göndər
// düyməsi. Kartın ÖZ başlığı YOXDUR — başlıq səhifədədir (`.ap-head`,
// vetendaslarin-muracieti/page.tsx).
//
// DİQQƏT — `<header>` elementi İŞLƏDİLMİR: 02-header.css-dəki QLOBAL
// `header{}` seçicisi (saytın öz başlığı üçün) hər <header>-ə navy gradient,
// kölgə və z-index verir. F5.33-ün `<header class="ap-header">`-i məhz buna
// görə göy fonda tünd/boz mətnlə görünürdü.
//
// `.cx-*` (CorrectionIsland, kiçik vidcet qabığı) sinifləri ilə PAYLAŞILMIR —
// öz `.ap-*` qabığı (40-appeal.css), enə TOXUNMUR (səhifənin `.container`-i
// idarə edir, CLAUDE.md DİZAYN QAYDALARI: "bir səhifə, bir en").
import { useEffect, useState } from "react";

export type AppealType = "sual" | "teklif" | "erize" | "sikayet";
type Phase = "idle" | "sending" | "done" | "error";

/**
 * F5.36b — «Aidiyyəti bölmə» istiqaməti (4 əsas istiqamət, səhifədə həll
 * olunur). `documentId` — müraciətin `targetUnit`-i (e-poçt marşrutu).
 */
export interface AppealDirection {
  key: string;
  documentId: string;
  label: string;
  hint: string;
}

interface AppealIslandProps {
  directions: AppealDirection[];
  labels: Record<string, string>;
}

const TYPES: AppealType[] = ["sual", "teklif", "erize", "sikayet"];
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export default function AppealIsland({ directions, labels }: AppealIslandProps) {
  const [appealType, setAppealType] = useState<AppealType>("sual");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  // F5.36b — seçilmiş istiqamətin `key`-i ("" = seçilməyib, ümumi ünvan).
  const [direction, setDirection] = useState("");
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

  // F5.36c — footer «Rektorla əlaqə» → `?istiqamet=rektor`: istiqamət əvvəlcədən
  // seçilir. Parametr klientdə oxunur ki, səhifə statik (ISR) qalsın.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("istiqamet");
    if (q && directions.some((d) => d.key === q)) setDirection(q);
  }, [directions]);

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
    setDirection("");
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
    const targetUnit = directions.find((d) => d.key === direction)?.documentId;
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

  // F5.36 — məcburi sahə nişanı (portal üslubu). Rəng qızılıdır: DİZAYN
  // QAYDALARI qırmızı palitranı qadağan edir.
  const req = (
    <span className="ap-req" title={L("requiredMark")} aria-hidden="true">
      *
    </span>
  );

  if (phase === "done") {
    return (
      <section className="ap-card" aria-label={L("title")}>
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
    <section className="ap-card" aria-label={L("title")}>
      {/* ── 1. Müraciət növü ── */}
      <div className="ap-sec">
        <div className="ap-sec-head">
          <span className="ap-sec-num" aria-hidden="true">1</span>
          <div>
            <h3 className="ap-sec-title">{L("sec1Title")}</h3>
            <p className="ap-sec-sub">{L("sec1Sub")}</p>
          </div>
        </div>
        <div className="ap-seg" role="group" aria-label={L("sec1Title")}>
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={`ap-seg-btn${appealType === t ? " is-active" : ""}`}
              aria-pressed={appealType === t}
              onClick={() => setAppealType(t)}
            >
              {L("type_" + t)}
            </button>
          ))}
        </div>
        <p className="ap-note">
          <i className={`ti ${isFormal ? "ti-clock" : "ti-info-circle"}`} aria-hidden="true" />
          {isFormal ? L("deadlineNote") : L("informalNote")}
        </p>
      </div>

      {/* ── 2. Şəxsi məlumatlar ── */}
      <div className="ap-sec">
        <div className="ap-sec-head">
          <span className="ap-sec-num" aria-hidden="true">2</span>
          <div>
            <h3 className="ap-sec-title">{L("sec2Title")}</h3>
            <p className="ap-sec-sub">{L("sec2Sub")}</p>
          </div>
        </div>
        <div className="ap-grid">
          <div className="ap-field">
            <label className="ap-label" htmlFor="ap-last">{L("lastNameLabel")}{req}</label>
            <input id="ap-last" className="ap-in" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={100} required autoComplete="family-name" />
          </div>
          <div className="ap-field">
            <label className="ap-label" htmlFor="ap-first">{L("firstNameLabel")}{req}</label>
            <input id="ap-first" className="ap-in" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={100} required autoComplete="given-name" />
          </div>
          <div className="ap-field">
            <label className="ap-label" htmlFor="ap-patronymic">{L("patronymicLabel")}{req}</label>
            <input id="ap-patronymic" className="ap-in" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} maxLength={100} required autoComplete="additional-name" />
          </div>
          <div className="ap-field">
            <label className="ap-label" htmlFor="ap-phone">{L("phoneLabel")}{req}</label>
            <input id="ap-phone" type="tel" className="ap-in" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} required autoComplete="tel" placeholder="+994 XX XXX XX XX" />
          </div>
          <div className="ap-field">
            <label className="ap-label" htmlFor="ap-email">{L("emailLabel")}{req}</label>
            <input id="ap-email" type="email" className="ap-in" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required autoComplete="email" />
          </div>
          <div className="ap-field">
            <label className="ap-label" htmlFor="ap-address">{L("addressLabel")}</label>
            <input id="ap-address" className="ap-in" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} autoComplete="street-address" />
          </div>
        </div>
      </div>

      {/* ── 3. Müraciətin məzmunu ── */}
      <div className="ap-sec">
        <div className="ap-sec-head">
          <span className="ap-sec-num" aria-hidden="true">3</span>
          <div>
            <h3 className="ap-sec-title">{L("sec3Title")}</h3>
            <p className="ap-sec-sub">{L("sec3Sub")}</p>
          </div>
        </div>

        {/* F5.36b — istiqamət kartları (portal «course-radio» üslubu). TƏK
            seçim (radio): müraciət bir bölməyə ünvanlanır. Seçilmiş karta
            yenidən klik seçimi LƏĞV edir — sahə istəyə bağlıdır. */}
        {directions.length ? (
          <fieldset className="ap-field ap-dirs">
            <legend className="ap-label">{L("unitLabel")}</legend>
            <div className="ap-dir-grid">
              {directions.map((d) => (
                <div className="ap-dir" key={d.key}>
                  <input
                    type="radio"
                    name="ap-direction"
                    id={`ap-dir-${d.key}`}
                    value={d.key}
                    checked={direction === d.key}
                    onChange={() => setDirection(d.key)}
                    onClick={() => {
                      if (direction === d.key) setDirection("");
                    }}
                  />
                  <label htmlFor={`ap-dir-${d.key}`}>
                    <span className="ap-dir-box" aria-hidden="true">
                      <i className="ti ti-check" />
                    </span>
                    <span className="ap-dir-name">{d.label}</span>
                    <span className="ap-dir-hint">{d.hint}</span>
                  </label>
                </div>
              ))}
            </div>
            <span className="ap-hint">{L("unitHint")}</span>
          </fieldset>
        ) : null}

        <div className="ap-field">
          <label className="ap-label" htmlFor="ap-subject">{L("subjectLabel")}{req}</label>
          <input id="ap-subject" className="ap-in" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={300} required />
        </div>
        <div className="ap-field">
          <label className="ap-label" htmlFor="ap-message">{L("messageLabel")}{req}</label>
          <textarea id="ap-message" className="ap-ta" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} required />
        </div>
        <div className="ap-field">
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

      {/* ── 4. Təsdiq və göndərmə ── */}
      <div className="ap-sec ap-sec--last">
        <div className="ap-sec-head">
          <span className="ap-sec-num" aria-hidden="true">4</span>
          <div>
            <h3 className="ap-sec-title">{L("sec4Title")}</h3>
            <p className="ap-sec-sub">{L("sec4Sub")}</p>
          </div>
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
        {phase === "error" && err ? <p className="ap-err" role="alert">{err}</p> : null}
      </div>
    </section>
  );
}
