// F5.49 — «Suallar» cavabı: düz mətn + «[mətn](/ünvan)» keçidi. Cavab sahəsi
// admində düz mətndir (markdown redaktoru yoxdur); keçid yazmaq üçün yalnız bu
// qısa forma tanınır, qalan hər şey HTML-dən qorunur. Sətir sonu — <br>.
// İşlədilir: SectionPage (səhifənin «Suallar»-ı), FaqPage, auditoriya səhifəsi.
import type { Locale } from './i18n';
import { isExternalHref, localHref } from './md-links';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function faqAnswerHtml(answer: string, locale: Locale): string {
  const out: string[] = [];
  const re = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(answer))) {
    out.push(esc(answer.slice(last, m.index)));
    const href = localHref(m[2], locale);
    const safe = /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(href);
    if (safe) {
      const blank = isExternalHref(href) && !/^mailto:|^tel:/i.test(href);
      out.push(`<a href="${esc(href)}"${blank ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(m[1])}</a>`);
    } else {
      out.push(esc(m[0]));
    }
    last = m.index + m[0].length;
  }
  out.push(esc(answer.slice(last)));
  return out.join('').replace(/\r?\n/g, '<br>');
}

/** Axtarış və JSON-LD üçün: keçid sintaksisi olmadan düz mətn. */
export const faqAnswerText = (answer: string): string => answer.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, '$1');
