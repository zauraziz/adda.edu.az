'use client';

// K26-12 — əməkdaşın öz profilini redaktə etməsi.
//
// GİRİŞ: mövcud magic-link kimliyi (F2.6e). İşçi korporativ ünvanını yazır,
// linkə klikləyir, sessiya httpOnly cookie-yə düşür.
//
// HANSI PROFİL AÇILIR — BURADA QƏRAR VERİLMİR. Ada slug göndərmir; Strapi
// sessiyadakı təsdiqlənmiş e-poçtu `person.email`/`altEmail` ilə tutuşdurur.
// Beləliklə istifadəçi başqasının profilini istəsə də aça bilmir.
//
// LABEL-LƏR PROPS İLƏ GƏLİR — i18n lüğəti client bundle-a düşməməlidir.

import { useCallback, useEffect, useState } from 'react';
import IdentityGate, { useIdentity } from './IdentityGate';

interface Row { [k: string]: unknown }

interface Profile {
  slug: string;
  name: string;
  displayName: string | null;
  email: string | null;
  position: string | null;
  phone: string;
  office: string;
  building: string;
  academicTitle: string;
  academicDegree: string;
  bio: string;
  teaching: string;
  responsibilities: string;
  other: string;
  languages: { lang: string; level: string }[];
  researchAreas: { label: string }[];
  publications: { title: string; year: number | null; source: string; url: string }[];
  experience: { period: string; organization: string; position: string; sortYear: number | null }[];
  education: { period: string; institution: string; qualification: string; sortYear: number | null }[];
  scholar: Row | null;
}

type Phase = 'loading' | 'ready' | 'saving' | 'saved' | 'denied' | 'error';

interface Props {
  locale: string;
  labels: Record<string, string>;
  gateLabels: Record<string, string>;
  redirect: string;
  degrees: { value: string; label: string }[];
  langs: { value: string; label: string }[];
}

const SCHOLAR_FIELDS = ['spin', 'orcid', 'researcherId', 'scopusAuthorId', 'googleScholar'] as const;
const SCHOLAR_LABEL: Record<string, string> = {
  spin: 'SPIN-kod',
  orcid: 'ORCID',
  researcherId: 'ResearcherID',
  scopusAuthorId: 'Scopus AuthorID',
  googleScholar: 'Google Scholar',
};

export default function ProfileEditorIsland({ locale, labels, gateLabels, redirect, degrees, langs }: Props) {
  const { identity, loading } = useIdentity();
  const [phase, setPhase] = useState<Phase>('loading');
  const [p, setP] = useState<Profile | null>(null);
  const [err, setErr] = useState('');

  const L = (k: string): string => labels[k] ?? k;

  const load = useCallback(async () => {
    setPhase('loading');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read' }),
      });
      const data = (await res.json()) as { ok?: boolean; person?: Profile; error?: string };
      if (res.status === 403 || data.error === 'not_staff') { setPhase('denied'); return; }
      if (!res.ok || !data.ok || !data.person) { setErr(data.error ?? ''); setPhase('error'); return; }
      setP({
        ...data.person,
        languages: data.person.languages ?? [],
        researchAreas: data.person.researchAreas ?? [],
        publications: data.person.publications ?? [],
        experience: data.person.experience ?? [],
        education: data.person.education ?? [],
      });
      setPhase('ready');
    } catch {
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    if (!loading && identity) void load();
  }, [loading, identity, load]);

  if (loading) return <p className="pe-note">{L('loading')}</p>;

  if (!identity) {
    return (
      <IdentityGate
        locale={locale}
        labels={gateLabels}
        redirect={redirect}
        heading={L('gateHeading')}
      />
    );
  }

  if (phase === 'denied') {
    return (
      <div className="pe-note pe-note--warn">
        <strong>{L('deniedTitle')}</strong>
        <p>{L('deniedBody').replace('{email}', identity.email)}</p>
      </div>
    );
  }
  if (phase === 'loading') return <p className="pe-note">{L('loading')}</p>;
  // `phase` burada daralır; aşağıda saxlama xətasını göstərmək üçün ayrıca
  // dəyişən lazımdır, yoxsa TS "üst-üstə düşmür" deyir.
  const failed: boolean = phase === 'error';
  if (failed || !p) {
    return (
      <div className="pe-note pe-note--warn">
        {L('loadFailed')} {err ? <code>{err}</code> : null}
        <button type="button" className="pe-btn" onClick={() => void load()}>{L('retry')}</button>
      </div>
    );
  }

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP({ ...p, [k]: v });

  async function save() {
    if (!p) return;
    setPhase('saving');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          data: {
            phone: p.phone, office: p.office, building: p.building,
            academicTitle: p.academicTitle, academicDegree: p.academicDegree,
            bio: p.bio, teaching: p.teaching, responsibilities: p.responsibilities, other: p.other,
            languages: p.languages.filter((l) => l.lang),
            researchAreas: p.researchAreas.filter((t) => t.label.trim()),
            publications: p.publications.filter((x) => x.title.trim()),
            experience: p.experience.filter((x) => x.period.trim() && x.organization.trim()),
            education: p.education.filter((x) => x.period.trim() && x.institution.trim()),
            scholar: p.scholar ?? {},
          },
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) { setErr(data.error ?? ''); setPhase('error'); return; }
      setPhase('saved');
    } catch {
      setPhase('error');
    }
  }

  /** Təkrarlanan siyahılar üçün ümumi sətir idarəsi. */
  function listOps<T>(key: keyof Profile, blank: T) {
    const arr = p![key] as unknown as T[];
    return {
      arr,
      add: () => set(key, [...arr, { ...blank }] as never),
      del: (i: number) => set(key, arr.filter((_, n) => n !== i) as never),
      upd: (i: number, patch: Partial<T>) =>
        set(key, arr.map((x, n) => (n === i ? { ...x, ...patch } : x)) as never),
    };
  }

  const areas = listOps<{ label: string }>('researchAreas', { label: '' });
  const lgs = listOps<{ lang: string; level: string }>('languages', { lang: 'az', level: '' });
  const pubs = listOps<{ title: string; year: number | null; source: string; url: string }>(
    'publications', { title: '', year: null, source: '', url: '' });
  const exps = listOps<{ period: string; organization: string; position: string; sortYear: number | null }>(
    'experience', { period: '', organization: '', position: '', sortYear: null });
  const edus = listOps<{ period: string; institution: string; qualification: string; sortYear: number | null }>(
    'education', { period: '', institution: '', qualification: '', sortYear: null });

  const scholar = (p.scholar ?? {}) as Record<string, string>;

  return (
    <div className="pe">
      <div className="pe-who">
        <span className="pe-who-name">{p.displayName || p.name}</span>
        <span className="pe-who-mail">{p.email}</span>
      </div>

      {/* Redaktə oluna BİLMƏYƏN sahələr — səbəbi ilə. Susmaq istifadəçini
          "niyə adımı dəyişə bilmirəm" sualı ilə tək qoyardı. */}
      <p className="pe-note pe-note--info">{L('lockedNote')}</p>

      <fieldset className="pe-group">
        <legend>{L('contact')}</legend>
        <div className="pe-row">
          <label className="pe-field">
            <span>{L('phone')}</span>
            <input value={p.phone} onChange={(e) => set('phone', e.target.value)} inputMode="tel" />
          </label>
          <label className="pe-field">
            <span>{L('building')}</span>
            <input value={p.building} onChange={(e) => set('building', e.target.value)} />
          </label>
          <label className="pe-field">
            <span>{L('office')}</span>
            <input value={p.office} onChange={(e) => set('office', e.target.value)} />
          </label>
        </div>
      </fieldset>

      <fieldset className="pe-group">
        <legend>{L('academic')}</legend>
        <div className="pe-row">
          <label className="pe-field">
            <span>{L('academicTitle')}</span>
            <input value={p.academicTitle} onChange={(e) => set('academicTitle', e.target.value)} />
          </label>
          <label className="pe-field">
            <span>{L('academicDegree')}</span>
            <select value={p.academicDegree} onChange={(e) => set('academicDegree', e.target.value)}>
              <option value="">{L('notSelected')}</option>
              {degrees.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="pe-group">
        <legend>{L('bio')}</legend>
        <textarea rows={6} value={p.bio} onChange={(e) => set('bio', e.target.value)} />
        <p className="pe-hint">{L('markdownHint')}</p>
      </fieldset>

      <fieldset className="pe-group">
        <legend>{L('researchAreas')}</legend>
        {areas.arr.map((t, i) => (
          <div key={i} className="pe-item">
            <input value={t.label} onChange={(e) => areas.upd(i, { label: e.target.value })} placeholder={L('tagPlaceholder')} />
            <button type="button" className="pe-del" onClick={() => areas.del(i)} aria-label={L('remove')}>×</button>
          </div>
        ))}
        <button type="button" className="pe-add" onClick={areas.add}>+ {L('add')}</button>
      </fieldset>

      <fieldset className="pe-group">
        <legend>{L('languages')}</legend>
        {lgs.arr.map((l, i) => (
          <div key={i} className="pe-item">
            <select value={l.lang} onChange={(e) => lgs.upd(i, { lang: e.target.value })}>
              {langs.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
            <input value={l.level} onChange={(e) => lgs.upd(i, { level: e.target.value })} placeholder={L('levelPlaceholder')} />
            <button type="button" className="pe-del" onClick={() => lgs.del(i)} aria-label={L('remove')}>×</button>
          </div>
        ))}
        <button type="button" className="pe-add" onClick={lgs.add}>+ {L('add')}</button>
      </fieldset>

      <fieldset className="pe-group">
        <legend>{L('scholarIds')}</legend>
        <div className="pe-row">
          {SCHOLAR_FIELDS.map((f) => (
            <label key={f} className="pe-field">
              <span>{SCHOLAR_LABEL[f]}</span>
              <input
                value={scholar[f] ?? ''}
                onChange={(e) => set('scholar', { ...scholar, [f]: e.target.value } as Row)}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="pe-group">
        <legend>{L('education')}</legend>
        {edus.arr.map((e, i) => (
          <div key={i} className="pe-item pe-item--wide">
            <input value={e.period} onChange={(x) => edus.upd(i, { period: x.target.value })} placeholder={L('periodPlaceholder')} />
            <input value={e.institution} onChange={(x) => edus.upd(i, { institution: x.target.value })} placeholder={L('institution')} />
            <input value={e.qualification} onChange={(x) => edus.upd(i, { qualification: x.target.value })} placeholder={L('qualification')} />
            <button type="button" className="pe-del" onClick={() => edus.del(i)} aria-label={L('remove')}>×</button>
          </div>
        ))}
        <button type="button" className="pe-add" onClick={edus.add}>+ {L('add')}</button>
      </fieldset>

      <fieldset className="pe-group">
        <legend>{L('experience')}</legend>
        {exps.arr.map((e, i) => (
          <div key={i} className="pe-item pe-item--wide">
            <input value={e.period} onChange={(x) => exps.upd(i, { period: x.target.value })} placeholder={L('periodPlaceholder')} />
            <input value={e.organization} onChange={(x) => exps.upd(i, { organization: x.target.value })} placeholder={L('organization')} />
            <input value={e.position} onChange={(x) => exps.upd(i, { position: x.target.value })} placeholder={L('positionField')} />
            <button type="button" className="pe-del" onClick={() => exps.del(i)} aria-label={L('remove')}>×</button>
          </div>
        ))}
        <button type="button" className="pe-add" onClick={exps.add}>+ {L('add')}</button>
      </fieldset>

      <fieldset className="pe-group">
        <legend>{L('publications')}</legend>
        {pubs.arr.map((x, i) => (
          <div key={i} className="pe-item pe-item--wide">
            <input value={x.title} onChange={(e) => pubs.upd(i, { title: e.target.value })} placeholder={L('pubTitle')} />
            <input value={x.source} onChange={(e) => pubs.upd(i, { source: e.target.value })} placeholder={L('pubSource')} />
            <input
              value={x.year ?? ''}
              onChange={(e) => pubs.upd(i, { year: e.target.value ? Number(e.target.value) : null })}
              placeholder={L('pubYear')}
              inputMode="numeric"
            />
            <input value={x.url} onChange={(e) => pubs.upd(i, { url: e.target.value })} placeholder="https://…" />
            <button type="button" className="pe-del" onClick={() => pubs.del(i)} aria-label={L('remove')}>×</button>
          </div>
        ))}
        <button type="button" className="pe-add" onClick={pubs.add}>+ {L('add')}</button>
      </fieldset>

      <fieldset className="pe-group">
        <legend>{L('teaching')}</legend>
        <textarea rows={5} value={p.teaching} onChange={(e) => set('teaching', e.target.value)} />
      </fieldset>

      <fieldset className="pe-group">
        <legend>{L('responsibilities')}</legend>
        <textarea rows={5} value={p.responsibilities} onChange={(e) => set('responsibilities', e.target.value)} />
      </fieldset>

      <fieldset className="pe-group">
        <legend>{L('other')}</legend>
        <textarea rows={4} value={p.other} onChange={(e) => set('other', e.target.value)} />
      </fieldset>

      <div className="pe-actions">
        <button type="button" className="pe-btn pe-btn--primary" onClick={() => void save()} disabled={phase === 'saving'}>
          {phase === 'saving' ? L('saving') : L('save')}
        </button>
        {phase === 'saved' ? <span className="pe-ok">{L('savedMsg')}</span> : null}
        {err && phase !== 'saved' ? <span className="pe-err">{L('saveFailed')} {err}</span> : null}
        <a className="pe-view" href={`/${locale}/emekdas/${p.slug}`}>{L('viewPublic')}</a>
      </div>
    </div>
  );
}
