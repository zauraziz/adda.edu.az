'use client';
import { useState } from 'react';
import { generateIcs } from '@/lib/ics';
import { STRAPI_URL } from '@/lib/strapi';

interface RsvpProps {
  eventSlug: string;
  eventTitle: string;
  startAt: string;
  endAt?: string;
  location?: string;
  description?: string;
  labels: Record<string, string>;
}

export default function RsvpIsland({
  eventSlug,
  eventTitle,
  startAt,
  endAt,
  location,
  description,
  labels
}: RsvpProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rsvpStatus: 'going',
    guests: 0,
    note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${STRAPI_URL}/api/rsvps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            eventSlug,
            eventTitle,
            name: formData.name,
            email: formData.email,
            status: formData.rsvpStatus,
            guests: Number(formData.guests),
            note: formData.note
          }
        })
      });
      if (!res.ok) throw new Error('API error');
      setStatus('success');
    } catch (err) {
      console.error('RSVP API xetasi:', err);
      setStatus('error');
    }
  };

  const handleDownloadIcs = () => {
    const icsData = generateIcs({
      title: eventTitle,
      startAt,
      endAt,
      location,
      description,
      uid: `${eventSlug}@adda.edu.az`
    });
    
    if (!icsData) return;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${eventSlug}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === 'success') {
    return (
      <div className="rsvp-island success">
        <h3>{labels.successMsg}</h3>
        <button type="button" className="btn-primary" onClick={handleDownloadIcs}>
          {labels.addToCal}
        </button>
      </div>
    );
  }

  return (
    <div className="rsvp-island">
      <h3>{labels.register}</h3>
      <form onSubmit={handleSubmit} className="rsvp-form">
        <div className="form-group row">
          <div className="col">
            <label>{labels.name}</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="col">
            <label>{labels.email}</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
        </div>
        <div className="form-group row">
          <div className="col">
            <label>{labels.status}</label>
            <select value={formData.rsvpStatus} onChange={e => setFormData({...formData, rsvpStatus: e.target.value})}>
              <option value="going">{labels.going}</option>
              <option value="maybe">{labels.maybe}</option>
              <option value="declined">{labels.declined}</option>
            </select>
          </div>
          <div className="col">
            <label>{labels.guests}</label>
            <input type="number" min="0" max="10" value={formData.guests} onChange={e => setFormData({...formData, guests: parseInt(e.target.value) || 0})} />
          </div>
        </div>
        <div className="form-group">
          <label>{labels.note}</label>
          <textarea rows={3} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
        </div>
        <button type="submit" disabled={status === 'loading'} className="btn-primary">
          {status === 'loading' ? '...' : labels.submit}
        </button>
        {status === 'error' && <p className="error-msg">{labels.error}</p>}
      </form>
    </div>
  );
}
