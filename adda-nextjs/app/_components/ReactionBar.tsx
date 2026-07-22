"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { STRAPI_URL } from "@/lib/strapi";

interface ReactionBarProps {
  targetType: "article" | "announcement" | "event" | "milestone";
  targetSlug: string;
}

type EmojiType = "anchor" | "ship" | "compass" | "wave";
type Locale = "az" | "ru" | "en";

const EMOJIS: { type: EmojiType; icon: string }[] = [
  { type: "anchor", icon: "\u2693" },
  { type: "ship", icon: "\uD83D\uDEA2" },
  { type: "compass", icon: "\uD83E\uDDED" },
  { type: "wave", icon: "\uD83C\uDF0A" },
];

// Kicik yerli luget — boyuk T lugeti DEYIL (islands qaydasi: ~55kB import yox).
const L: Record<Locale, { prompt: string; aria: Record<EmojiType, string> }> = {
  az: {
    prompt: "Reaksiyan\u0131z\u0131 bildirin",
    aria: {
      anchor: "L\u00f6vb\u0259r reaksiyas\u0131",
      ship: "G\u0259mi reaksiyas\u0131",
      compass: "Kompas reaksiyas\u0131",
      wave: "Dal\u011fa reaksiyas\u0131",
    },
  },
  ru: {
    prompt: "\u041e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u0440\u0435\u0430\u043a\u0446\u0438\u044e",
    aria: {
      anchor: "\u0420\u0435\u0430\u043a\u0446\u0438\u044f \u00ab\u044f\u043a\u043e\u0440\u044c\u00bb",
      ship: "\u0420\u0435\u0430\u043a\u0446\u0438\u044f \u00ab\u043a\u043e\u0440\u0430\u0431\u043b\u044c\u00bb",
      compass: "\u0420\u0435\u0430\u043a\u0446\u0438\u044f \u00ab\u043a\u043e\u043c\u043f\u0430\u0441\u00bb",
      wave: "\u0420\u0435\u0430\u043a\u0446\u0438\u044f \u00ab\u0432\u043e\u043b\u043d\u0430\u00bb",
    },
  },
  en: {
    prompt: "Leave a reaction",
    aria: {
      anchor: "Anchor reaction",
      ship: "Ship reaction",
      compass: "Compass reaction",
      wave: "Wave reaction",
    },
  },
};

function localeFromPath(p: string | null): Locale {
  const seg = (p || "").split("/").filter(Boolean)[0];
  return seg === "ru" || seg === "en" ? seg : "az";
}

const ZERO: Record<EmojiType, number> = { anchor: 0, ship: 0, compass: 0, wave: 0 };
const OFF: Record<EmojiType, boolean> = { anchor: false, ship: false, compass: false, wave: false };

export default function ReactionBar({ targetType, targetSlug }: ReactionBarProps) {
  const t = L[localeFromPath(usePathname())];
  const [counts, setCounts] = useState<Record<EmojiType, number>>({ ...ZERO });
  const [reacted, setReacted] = useState<Record<EmojiType, boolean>>({ ...OFF });
  const [sessionId, setSessionId] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [pop, setPop] = useState<EmojiType | null>(null);

  useEffect(() => {
    let sid = localStorage.getItem("adda_session_id");
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      localStorage.setItem("adda_session_id", sid);
    }
    setSessionId(sid);

    let active = true;
    fetch(
      `${STRAPI_URL}/api/reactions?filters[targetType][$eq]=${targetType}&filters[targetSlug][$eq]=${targetSlug}&pagination[pageSize]=200`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!active) return;
        if (res?.data) {
          const c: Record<EmojiType, number> = { ...ZERO };
          const u: Record<EmojiType, boolean> = { ...OFF };
          res.data.forEach((item: { emoji?: EmojiType; sessionId?: string }) => {
            const e = item.emoji;
            if (e && e in c) {
              c[e] += 1;
              if (item.sessionId === sid) u[e] = true;
            }
          });
          setCounts(c);
          setReacted(u);
        }
        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [targetType, targetSlug]);

  const react = async (emoji: EmojiType) => {
    if (!loaded || reacted[emoji] || !sessionId) return;

    setCounts((prev) => ({ ...prev, [emoji]: prev[emoji] + 1 }));
    setReacted((prev) => ({ ...prev, [emoji]: true }));
    setPop(emoji);
    window.setTimeout(() => setPop((cur) => (cur === emoji ? null : cur)), 480);

    try {
      const res = await fetch(`${STRAPI_URL}/api/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { targetType, targetSlug, emoji, sessionId } }),
      });
      if (!res.ok) throw new Error("reaction post failed");
    } catch {
      setCounts((prev) => ({ ...prev, [emoji]: Math.max(0, prev[emoji] - 1) }));
      setReacted((prev) => ({ ...prev, [emoji]: false }));
    }
  };

  return (
    <section className={`na-rx${loaded ? " is-loaded" : " is-pending"}`} aria-label={t.prompt}>
      <span className="na-rx-label">
        <i className="ti ti-mood-smile" aria-hidden="true" />
        {t.prompt}
      </span>
      <div className="na-rx-list" role="group">
        {EMOJIS.map((e) => {
          const on = reacted[e.type];
          return (
            <button
              key={e.type}
              type="button"
              onClick={() => react(e.type)}
              className={`na-rx-btn${on ? " is-on" : ""}${pop === e.type ? " is-pop" : ""}`}
              disabled={!loaded || on}
              aria-pressed={on}
              aria-label={t.aria[e.type]}
            >
              <span className="na-rx-emoji" aria-hidden="true">
                {e.icon}
              </span>
              <span className="na-rx-count">{counts[e.type]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
