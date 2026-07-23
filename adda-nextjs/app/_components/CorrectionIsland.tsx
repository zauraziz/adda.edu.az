"use client";

// F2.6d duzelis adasi + soz-seviyyeli LCS diff.
// F2.6e-2: SERT KIMLIK. Ad/e-poct saheleri silindi — Strapi onlari tesdiqlenmis
// kimlikden goturur. POST birbasa Strapi-ye yox, `/api/submit/correction`
// route handler-ine gedir (sessiya httpOnly cookie-dedir).
import { useMemo, useState } from "react";
import IdentityGate, { useIdentity } from "./IdentityGate";

type TargetType = "article" | "announcement" | "event" | "milestone";
type FieldKey = "title" | "body" | "other";
type Phase = "idle" | "sending" | "done" | "error";

interface CorrectionIslandProps {
  targetType: TargetType;
  targetSlug: string;
  title?: string;
  locale: string;
  labels: Record<string, string>;
}

type DiffOp = { t: "eq" | "ins" | "del"; s: string };

const MAX_CELLS = 200000;

function tokenize(s: string): string[] {
  return s.match(/\s+|[^\s]+/g) ?? [];
}

// Soz-seviyyeli LCS diff. Uzun payload-da (n*m > MAX_CELLS) tam-blok evezlemeye kecir.
function wordDiff(a: string, b: string): DiffOp[] {
  const A = tokenize(a);
  const B = tokenize(b);
  const n = A.length;
  const m = B.length;
  if (n === 0 && m === 0) return [];
  if (n * m > MAX_CELLS) {
    const coarse: DiffOp[] = [];
    if (a) coarse.push({ t: "del", s: a });
    if (b) coarse.push({ t: "ins", s: b });
    return coarse;
  }
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const raw: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      raw.push({ t: "eq", s: A[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      raw.push({ t: "del", s: A[i] });
      i++;
    } else {
      raw.push({ t: "ins", s: B[j] });
      j++;
    }
  }
  while (i < n) {
    raw.push({ t: "del", s: A[i] });
    i++;
  }
  while (j < m) {
    raw.push({ t: "ins", s: B[j] });
    j++;
  }
  const merged: DiffOp[] = [];
  for (const op of raw) {
    const last = merged[merged.length - 1];
    if (last && last.t === op.t) last.s += op.s;
    else merged.push({ t: op.t, s: op.s });
  }
  return merged;
}

export default function CorrectionIsland({ targetType, targetSlug, title, locale, labels }: CorrectionIslandProps) {
  const { identity, loading, refresh } = useIdentity();
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<FieldKey>("body");
  const [current, setCurrent] = useState("");
  const [suggested, setSuggested] = useState("");
  const [reason, setReason] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [err, setErr] = useState("");

  const L = (k: string): string => labels[k] ?? k;

  const diff = useMemo(() => (suggested.trim() ? wordDiff(current, suggested) : []), [current, suggested]);

  const pickField = (f: FieldKey) => {
    if (f === field) return;
    setField(f);
    if (f === "title" && title) setCurrent(title);
    else setCurrent("");
  };

  const submit = async () => {
    if (!suggested.trim()) {
      setErr(L("emptyErr"));
      setPhase("error");
      return;
    }
    setPhase("sending");
    setErr("");
    try {
      const res = await fetch("/api/submit/correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetSlug,
          fieldPath: field,
          currentValue: current,
          suggestedValue: suggested,
          reason,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.status === 401) {
        // Sessiya bitib — kimlik qapisini yeniden goster.
        await refresh();
        setPhase("idle");
        return;
      }
      if (res.status === 429) {
        setErr(L("tooMany"));
        setPhase("error");
        return;
      }
      if (!res.ok || !data.ok) throw new Error(data.error || "correction post failed");
      setPhase("done");
    } catch {
      setErr(L("error"));
      setPhase("error");
    }
  };

  if (!open) {
    return (
      <div className="cx-trigger-wrap">
        <button type="button" className="cx-trigger" onClick={() => setOpen(true)}>
          <i className="ti ti-flag" aria-hidden="true" />
          <span className="cx-trigger-lead">{L("promptHint")}</span>
          <span className="cx-trigger-cta">{L("prompt")}</span>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <section className="cx cx--wait" aria-busy="true">
        <span className="idn-spin" aria-hidden="true" />
      </section>
    );
  }

  if (!identity) {
    return (
      <section className="cx" aria-label={L("title")}>
        <header className="cx-head">
          <span className="cx-head-ic">
            <i className="ti ti-pencil" aria-hidden="true" />
          </span>
          <div>
            <h3 className="cx-title">{L("title")}</h3>
            <p className="cx-sub">{L("subtitle")}</p>
          </div>
          <button type="button" className="cx-x" aria-label={L("close")} onClick={() => setOpen(false)}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </header>
        <div className="cx-body">
          <IdentityGate locale={locale} labels={labels} heading={L("gateCorrection")} />
        </div>
      </section>
    );
  }

  if (phase === "done") {
    return (
      <section className="cx" aria-label={L("title")}>
        <div className="cx-done">
          <span className="cx-done-ic">
            <i className="ti ti-check" aria-hidden="true" />
          </span>
          <p className="cx-done-msg">{L("successMsg")}</p>
          <p className="cx-done-sub">{L("successSub")}</p>
          <button type="button" className="cx-close" onClick={() => setOpen(false)}>
            {L("close")}
          </button>
        </div>
      </section>
    );
  }

  const fields: FieldKey[] = ["title", "body", "other"];
  const identityEmail = identity.email;

  return (
    <section className="cx" aria-label={L("title")}>
      <header className="cx-head">
        <span className="cx-head-ic">
          <i className="ti ti-pencil" aria-hidden="true" />
        </span>
        <div>
          <h3 className="cx-title">{L("title")}</h3>
          <p className="cx-sub">{L("subtitle")}</p>
        </div>
        <button type="button" className="cx-x" aria-label={L("close")} onClick={() => setOpen(false)}>
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </header>

      <div className="cx-body">
        <div className="idn-chip">
          <i className="ti ti-rosette-discount-check" aria-hidden="true" />
          <span className="idn-chip-mail">{identityEmail}</span>
          <span className="idn-chip-tag">{L("verified")}</span>
        </div>

        <div className="cx-field">
          <span className="cx-label">{L("fieldLabel")}</span>
          <div className="cx-seg" role="group">
            {fields.map((f) => (
              <button
                key={f}
                type="button"
                className={`cx-seg-btn${field === f ? " is-active" : ""}`}
                onClick={() => pickField(f)}
              >
                {L("f_" + f)}
              </button>
            ))}
          </div>
        </div>

        <div className="cx-grid">
          <div className="cx-field">
            <label className="cx-label" htmlFor="cx-cur">
              {L("currentLabel")}
            </label>
            <textarea
              id="cx-cur"
              className="cx-ta"
              value={current}
              placeholder={L("currentHint")}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="cx-field">
            <label className="cx-label" htmlFor="cx-sug">
              {L("suggestedLabel")}
            </label>
            <textarea
              id="cx-sug"
              className="cx-ta"
              value={suggested}
              placeholder={L("suggestedHint")}
              onChange={(e) => setSuggested(e.target.value)}
            />
          </div>
        </div>

        {diff.length ? (
          <div className="cx-field">
            <span className="cx-label">{L("diffLabel")}</span>
            <div className="cx-diff" aria-live="polite">
              {diff.map((op, k) => (
                <span
                  key={k}
                  className={op.t === "ins" ? "cx-ins" : op.t === "del" ? "cx-del" : "cx-eq"}
                >
                  {op.s}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="cx-field">
          <label className="cx-label" htmlFor="cx-reason">
            {L("reasonLabel")}
          </label>
          <textarea
            id="cx-reason"
            className="cx-ta cx-ta--sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="cx-actions">
          <button type="button" className="cx-submit" onClick={submit} disabled={phase === "sending"}>
            <i className="ti ti-send" aria-hidden="true" />
            {phase === "sending" ? L("sending") : L("submit")}
          </button>
          <button type="button" className="cx-cancel" onClick={() => setOpen(false)}>
            {L("close")}
          </button>
        </div>
        {phase === "error" && err ? <p className="cx-err">{err}</p> : null}
      </div>
    </section>
  );
}
