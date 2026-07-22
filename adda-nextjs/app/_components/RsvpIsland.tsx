'use client';

// F2.6b / Tədbir RSVP — cilalanmış qeydiyyat paneli (client island).
// Status pill düymələri (dropdown yox), zərif input-lar, uğur vəziyyəti + .ics yükləmə.
// Etiketlər props ilə (server komponentindən əvvəlcədən tərcümə — tam T lüğəti import edilmir).
import { useState } from 'react';
import { generateIcs } from '@/lib/ics';
import { STRAPI_URL } from '@/lib/strapi';

type RsvpStatus = 'going' | 'maybe' | 'declined';

interface RsvpIslandProps {
  eventSlug: string;
  eventTitle: string;
  startAt: string;
  endAt?: string;
  location?: string;
  description?: string;
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
  labels,
}: RsvpIslandProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<RsvpStatus>('going');
  const [guests, setGuests] = useState(0);
  const [note, setNote] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch(STRAPI_URL + '/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { eventSlug, eventTitle, name, email, status, guests, note },
        }),
      });
      if (!res.ok) throw new Error('rsvp failed');
      setState('success');
    } catch {
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

  if (state === 'success') {
    return (
      <section className="rsvp">
        <div className="rsvp-success">
          <div className="rsvp-check" aria-hidden="true">
            <i className="ti ti-check" />
          </div>
          <p className="rsvp-success-msg">{labels.successMsg}</p>
          <button type="button" className="rsvp-cal" onClick={downloadIcs}>
            <i className="ti ti-calendar-plus" />
            {labels.addToCal}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rsvp">
      <header className="rsvp-head">
        <span className="rsvp-head-ic" aria-hidden="true">
          <i className="ti ti-calendar-check" />
        </span>
        <div>
          <h3 className="rsvp-title">{labels.register}</h3>
          <p className="rsvp-sub">{labels.subtitle}</p>
        </div>
      </header>

      <form className="rsvp-body" onSubmit={handleSubmit}>
        <div className="rsvp-status">
          <span className="rsvp-label">{labels.status}</span>
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
                {labels[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="rsvp-row">
          <div className="rsvp-field">
            <label className="rsvp-label" htmlFor="rsvp-name">
              {labels.name}
            </label>
            <input
              id="rsvp-name"
              className="rsvp-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="rsvp-field">
            <label className="rsvp-label" htmlFor="rsvp-email">
              {labels.email}
            </label>
            <input
              id="rsvp-email"
              className="rsvp-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="rsvp-field rsvp-field--sm">
          <label className="rsvp-label" htmlFor="rsvp-guests">
            {labels.guests}
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
            {labels.note}
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
          {state === 'loading' ? labels.sending : labels.submit}
        </button>
        {state === 'error' ? <p className="rsvp-err">{labels.error}</p> : null}
      </form>
    </section>
  );
}
