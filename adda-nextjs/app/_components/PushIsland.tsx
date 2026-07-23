"use client";

// F2.6e-3 — Web Push abunəlik adası.
// Kimlik TƏLƏB ETMİR: bildirişlər anonim ola bilər. Kimlik varsa server
// abunəliyi ona bağlayır (cookie route handler-də oxunur).
// Etiketlər props ilə — tam T lüğəti client bundle-a düşmür.
import { useCallback, useEffect, useState } from "react";

type Phase = "checking" | "unsupported" | "denied" | "off" | "on" | "busy" | "error";

const TOPICS = ["news", "announcements", "events"] as const;
type Topic = (typeof TOPICS)[number];

interface PushIslandProps {
  locale: string;
  labels: Record<string, string>;
}

/** VAPID açıq açarı base64url-dur; PushManager BufferSource gözləyir. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export default function PushIsland({ locale, labels }: PushIslandProps) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [topics, setTopics] = useState<Topic[]>([...TOPICS]);
  const [err, setErr] = useState("");

  const L = (k: string): string => labels[k] ?? k;

  const supported = useCallback(
    () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window,
    []
  );

  useEffect(() => {
    if (!supported()) {
      setPhase("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setPhase("denied");
      return;
    }
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => (reg ? reg.pushManager.getSubscription() : null))
      .then((sub) => setPhase(sub ? "on" : "off"))
      .catch(() => setPhase("off"));
  }, [supported]);

  const send = async (path: string, payload: Record<string, unknown>) => {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) throw new Error(data.error || "push request failed");
  };

  const enable = async (nextTopics?: Topic[]) => {
    setPhase("busy");
    setErr("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPhase(permission === "denied" ? "denied" : "off");
        return;
      }

      const keyRes = await fetch("/api/push/key", { cache: "no-store" });
      const keyData = (await keyRes.json()) as { ok?: boolean; key?: string };
      if (!keyRes.ok || !keyData.ok || !keyData.key) {
        setErr(L("pushUnconfigured"));
        setPhase("error");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyData.key) as unknown as BufferSource,
        });
      }

      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      await send("/api/push/subscribe", {
        endpoint: json.endpoint,
        keys: json.keys,
        locale,
        topics: nextTopics ?? topics,
      });
      setPhase("on");
    } catch {
      setErr(L("error"));
      setPhase("error");
    }
  };

  const disable = async () => {
    setPhase("busy");
    setErr("");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await send("/api/push/unsubscribe", { endpoint });
      }
      setPhase("off");
    } catch {
      setErr(L("error"));
      setPhase("error");
    }
  };

  const toggleTopic = (t: Topic) => {
    const next = topics.indexOf(t) !== -1 ? topics.filter((x) => x !== t) : [...topics, t];
    if (!next.length) return;
    setTopics(next);
    if (phase === "on") void enable(next);
  };

  if (phase === "checking") {
    return (
      <section className="psh psh--wait" aria-busy="true">
        <span className="idn-spin" aria-hidden="true" />
      </section>
    );
  }

  if (phase === "unsupported") {
    return (
      <section className="psh psh--muted">
        <span className="psh-ic" aria-hidden="true">
          <i className="ti ti-bell-off" />
        </span>
        <div className="psh-copy">
          <h3 className="psh-h">{L("pushTitle")}</h3>
          <p className="psh-p">{L("unsupported")}</p>
        </div>
      </section>
    );
  }

  if (phase === "denied") {
    return (
      <section className="psh psh--muted">
        <span className="psh-ic" aria-hidden="true">
          <i className="ti ti-bell-x" />
        </span>
        <div className="psh-copy">
          <h3 className="psh-h">{L("pushTitle")}</h3>
          <p className="psh-p">{L("blocked")}</p>
        </div>
      </section>
    );
  }

  const on = phase === "on";
  const busy = phase === "busy";

  return (
    <section className={"psh" + (on ? " is-on" : "")}>
      <span className="psh-ic" aria-hidden="true">
        <i className={on ? "ti ti-bell-ringing" : "ti ti-bell"} />
      </span>
      <div className="psh-copy">
        <h3 className="psh-h">{on ? L("pushOn") : L("pushTitle")}</h3>
        <p className="psh-p">{L("pushIntro")}</p>

        <div className="psh-topics">
          <span className="psh-topics-h">{L("topicsLabel")}</span>
          <div className="psh-chips" role="group">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                className={"psh-chip" + (topics.indexOf(t) !== -1 ? " is-active" : "")}
                aria-pressed={topics.indexOf(t) !== -1}
                onClick={() => toggleTopic(t)}
                disabled={busy}
              >
                {L("topic_" + t)}
              </button>
            ))}
          </div>
        </div>

        <div className="psh-actions">
          {on ? (
            <button type="button" className="psh-btn psh-btn--off" onClick={() => void disable()} disabled={busy}>
              <i className="ti ti-bell-off" aria-hidden="true" />
              {busy ? L("working") : L("turnOff")}
            </button>
          ) : (
            <button type="button" className="psh-btn" onClick={() => void enable()} disabled={busy}>
              <i className="ti ti-bell-plus" aria-hidden="true" />
              {busy ? L("working") : L("turnOn")}
            </button>
          )}
        </div>
        {phase === "error" && err ? <p className="psh-err">{err}</p> : null}
      </div>
    </section>
  );
}
