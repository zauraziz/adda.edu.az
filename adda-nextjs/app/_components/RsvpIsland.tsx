'use client';

// F2.6b / Tədbir RSVP — cilalanmış qeydiyyat paneli (client island).
// Status pill düymələri (dropdown yox), zərif input-lar, uğur vəziyyəti + .ics yükləmə.
// Etiketlər props ilə (server komponentindən əvvəlcədən tərcümə — tam T lüğəti import edilmir).
//
// F2.6e-2: SƏRT KİMLİK. Ad/e-poçt sahələri silindi — Strapi onları təsdiqlənmiş
// kimlikdən götürür. Yazı artıq birbaşa Strapi-yə getmir: sessiya httpOnly
// cookie-dədir, ona görə POST `/api/submit/rsvp` route handler-indən keçir.
import { useState } from 'react';
import { generateIcs } from '@/lib/ics';
import IdentityGate, { useIdentity } from './IdentityGate';

type RsvpStatus = 'going' | 'maybe' | 'declined';

interface RsvpIslandProps {
  eventSlug: string;
  eventTitle: string;
  startAt: string;
  endAt?: string;
  location?: string;
  description?: string;
  locale: string;
  labels: Record<string, string>;
}

const STATUS_ICONS: Record<RsvpStatus, string> = {
  going: 'ti-circle-check',
  maybe: 'ti-help-circle',
  declined: 'ti-circle-x',
};

const STATUSES: RsvpStatus[] = ['going', 'maybe', 'declined'];

export default function RsvpIsland({
  eventSlug,
  eventTitle,
  startAt,
  endAt,
  location,
  description,
  locale,
  labels,
}: RsvpIslandProps) {
  const { identity, loading, refresh } = useIdentity();
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [status, setStatus] = useState<RsvpStatus>('going');
  const [guests, setGuests] = useState(0);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  const L = (k: string): string => labels[k] ?? k;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setErr('');
    try {
      const res = await fetch('/api/submit/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventSlug, eventTitle, status, guests, note }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.status === 401) {
        // Sessiya bitib — qapını yenidən göstər.
        await refresh();
        setState('idle');
        return;
      }
      if (res.status === 429) {
        setErr(L('tooMany'));
        setState('error');
        return;
      }
      if (!res.ok || !data.ok) throw new Error(data.error || 'rsvp failed');
      setState('success');
    } catch {
      setErr(L('error'));
      setState('error');
    }
  }

  function downloadIcs() {
    const ics = generateIcs({
      title: eventTitle,
      startAt,
      endAt,
      location,
      description,
      uid: eventSlug + '@adda.edu.az',
    });
    if (!ics) return;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = eventSlug + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const header = (
    <header className="rsvp-head">
      <span className="rsvp-head-ic" aria-hidden="true">
        <i className="ti ti-calendar-check" />
      </span>
      <div>
        <h3 className="rsvp-title">{L('register')}</h3>
        <p className="rsvp-sub">{L('subtitle')}</p>
      </div>
    </header>
  );

  if (state === 'success') {
    return (
      <section className="rsvp">
        <div className="rsvp-success">
          <div className="rsvp-check" aria-hidden="true">
            <i className="ti ti-check" />
          </div>
          <p className="rsvp-success-msg">{L('successMsg')}</p>
          <button type="button" className="rsvp-cal" onClick={downloadIcs}>
            <i className="ti ti-calendar-plus" />
            {L('addToCal')}
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="rsvp" aria-busy="true">
        {header}
        <div className="rsvp-body rsvp-body--wait">
          <span className="idn-spin" aria-hidden="true" />
        </div>
      </section>
    );
  }

  if (!identity) {
    return (
      <section className="rsvp">
        {header}
        <div className="rsvp-body">
          <IdentityGate locale={locale} labels={labels} heading={L('gateRsvp')} />
        </div>
      </section>
    );
  }

  return (
    <section className="rsvp">
      {header}

      <form className="rsvp-body" onSubmit={handleSubmit}>
        <div className="idn-chip">
          <i className="ti ti-rosette-discount-check" aria-hidden="true" />
          <span className="idn-chip-mail">{identity.email}</span>
          <span className="idn-chip-tag">{L('verified')}</span>
        </div>

        <div className="rsvp-status">
          <span className="rsvp-label">{L('status')}</span>
          <div className="rsvp-pills" role="group">
            {STATUSES.map((s) => (
              <button
                type="button"
                key={s}
                className={'rsvp-pill ' + s + (status === s ? ' is-active' : '')}
                onClick={() => setStatus(s)}
                aria-pressed={status === s}
              >
                <i className={'ti ' + STATUS_ICONS[s]} />
                {L(s)}
              </button>
            ))}
          </div>
        </div>

        <div className="rsvp-field rsvp-field--sm">
          <label className="rsvp-label" htmlFor="rsvp-guests">
            {L('guests')}
          </label>
          <input
            id="rsvp-guests"
            className="rsvp-input"
            type="number"
            min={0}
            max={10}
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value, 10) || 0)}
          />
        </div>

        <div className="rsvp-field">
          <label className="rsvp-label" htmlFor="rsvp-note">
            {L('note')}
          </label>
          <textarea
            id="rsvp-note"
            className="rsvp-textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button type="submit" className="rsvp-submit" disabled={state === 'loading'}>
          <i className="ti ti-send" />
          {state === 'loading' ? L('sending') : L('submit')}
        </button>
        {state === 'error' ? <p className="rsvp-err">{err || L('error')}</p> : null}
      </form>
    </section>
  );
}
