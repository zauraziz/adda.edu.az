'use client';

// F2.7-6 / AI köməkçi — client island.
//
// Etiketlər props ilə gəlir (server komponentindən əvvəlcədən tərcümə olunur)
// — tam `T` lüğəti (~55 kB) brauzer bundle-ına DÜŞMÜR.
//
// Axın SSE-dir, amma `EventSource` işlədilə BİLMİR: o yalnız GET edir, sual
// isə POST gövdəsindədir. Ona görə `fetch` + `ReadableStream` oxucusu.
import { useCallback, useRef, useState } from 'react';

interface SourceRef {
  n?: number;
  kind?: string;
  title?: string;
  url?: string;
  snippet?: string;
}

interface EntityRef {
  kind?: string;
  title?: string;
  url?: string;
  surface?: string;
}

interface CopilotIslandProps {
  locale: string;
  labels: Record<string, string>;
  samples: string[];
}

type Phase = 'idle' | 'searching' | 'generating' | 'done' | 'error';

const KIND_ICON: Record<string, string> = {
  article: 'ti-news',
  announcement: 'ti-speakerphone',
  event: 'ti-calendar-event',
  page: 'ti-file-text',
  department: 'ti-building',
  program: 'ti-school',
  faculty: 'ti-building-bank',
  person: 'ti-user',
  unit: 'ti-sitemap',
};

export default function CopilotIsland({ locale, labels, samples }: CopilotIslandProps) {
  const [q, setQ] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [sources, setSources] = useState<SourceRef[]>([]);
  const [answer, setAnswer] = useState('');
  const [answered, setAnswered] = useState(true);
  const [cited, setCited] = useState<SourceRef[]>([]);
  const [entities, setEntities] = useState<EntityRef[]>([]);
  const [errCode, setErrCode] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const L = (k: string): string => labels[k] || k;

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (text.length < 3 || phase === 'searching' || phase === 'generating') return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setPhase('searching');
      setSources([]);
      setAnswer('');
      setCited([]);
      setEntities([]);
      setErrCode('');
      setAnswered(true);

      try {
        const res = await fetch('/api/copilot', {
          method: 'POST',
          signal: ac.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text, locale }),
        });
        if (!res.body) throw new Error('no-stream');

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });

          // SSE mesajları boş sətirlə ayrılır; yarımçıq blok buferdə qalır.
          let cut = buf.indexOf('\n\n');
          while (cut !== -1) {
            const block = buf.slice(0, cut);
            buf = buf.slice(cut + 2);
            cut = buf.indexOf('\n\n');

            let evt = 'message';
            let data = '';
            for (const line of block.split('\n')) {
              if (line.startsWith('event: ')) evt = line.slice(7).trim();
              else if (line.startsWith('data: ')) data += line.slice(6);
            }
            if (!data) continue;

            let parsed: Record<string, unknown>;
            try {
              parsed = JSON.parse(data) as Record<string, unknown>;
            } catch {
              continue;
            }

            if (evt === 'stage') {
              setPhase(parsed.step === 'generating' ? 'generating' : 'searching');
            } else if (evt === 'sources') {
              setSources((parsed.hits as SourceRef[]) || []);
            } else if (evt === 'answer') {
              setAnswered(parsed.answered === true);
              setAnswer(String(parsed.answer || ''));
              setCited((parsed.sources as SourceRef[]) || []);
              setEntities((parsed.entities as EntityRef[]) || []);
              setPhase('done');
            } else if (evt === 'error') {
              setErrCode(String(parsed.code || 'error'));
              setPhase('error');
            }
          }
        }
        setPhase((p) => (p === 'searching' || p === 'generating' ? 'done' : p));
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setErrCode('unreachable');
          setPhase('error');
        }
      }
    },
    [locale, phase],
  );

  const busy = phase === 'searching' || phase === 'generating';

  return (
    <section className="copilot" aria-labelledby="copilot-title">
      <header className="copilot__head">
        <h1 id="copilot-title" className="copilot__title">
          {L('title')}
        </h1>
        <p className="copilot__lede">{L('lede')}</p>
      </header>

      <div className="copilot__bar">
        <input
          className="copilot__input"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') ask(q);
          }}
          placeholder={L('placeholder')}
          aria-label={L('placeholder')}
          maxLength={300}
          disabled={busy}
        />
        <button className="copilot__go" onClick={() => ask(q)} disabled={busy || q.trim().length < 3}>
          {busy ? <span className="copilot__spin" aria-hidden="true" /> : <i className="ti ti-arrow-right" aria-hidden="true" />}
          <span>{busy ? L('working') : L('ask')}</span>
        </button>
      </div>

      {phase === 'idle' && samples.length > 0 && (
        <div className="copilot__samples">
          <span className="copilot__samplesLabel">{L('samples')}</span>
          {samples.map((s) => (
            <button
              key={s}
              className="copilot__sample"
              onClick={() => {
                setQ(s);
                ask(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {busy && (
        <p className="copilot__stage" role="status" aria-live="polite">
          <span className="copilot__dot" aria-hidden="true" />
          {phase === 'searching' ? L('searching') : L('generating')}
        </p>
      )}

      {/* Mənbələr cavabdan ƏVVƏL gəlir — retrieval generasiyadan tez bitir. */}
      {sources.length > 0 && phase !== 'done' && (
        <ul className="copilot__peek">
          {sources.map((s, i) => (
            <li key={i} className="copilot__peekItem">
              <i className={'ti ' + (KIND_ICON[String(s.kind)] || 'ti-file')} aria-hidden="true" />
              <span>{s.title}</span>
            </li>
          ))}
        </ul>
      )}

      {phase === 'error' && (
        <p className="copilot__error" role="alert">
          <i className="ti ti-alert-triangle" aria-hidden="true" />
          {L('err_' + errCode) !== 'err_' + errCode ? L('err_' + errCode) : L('err_generic')}
        </p>
      )}

      {phase === 'done' && answer && (
        <article className={'copilot__answer' + (answered ? '' : ' copilot__answer--empty')}>
          <p className="copilot__text">{answer}</p>

          {!answered && <p className="copilot__hint">{L('refusal_hint')}</p>}

          {cited.length > 0 && (
            <div className="copilot__sources">
              <h2 className="copilot__sourcesTitle">{L('sources')}</h2>
              <ol className="copilot__sourceList">
                {cited.map((s) => (
                  <li key={s.n} className="copilot__source">
                    <span className="copilot__sourceNum">{s.n}</span>
                    <a href={s.url} className="copilot__sourceLink">
                      <i className={'ti ' + (KIND_ICON[String(s.kind)] || 'ti-file')} aria-hidden="true" />
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {entities.length > 0 && (
            <div className="copilot__entities">
              <span className="copilot__entitiesLabel">{L('related')}</span>
              {entities.map((e, i) => (
                <a key={i} href={e.url} className={'copilot__chip copilot__chip--' + (e.kind || 'x')}>
                  <i className={'ti ' + (KIND_ICON[String(e.kind)] || 'ti-link')} aria-hidden="true" />
                  {e.title}
                </a>
              ))}
            </div>
          )}

          <p className="copilot__note">{L('note')}</p>
        </article>
      )}
    </section>
  );
}
