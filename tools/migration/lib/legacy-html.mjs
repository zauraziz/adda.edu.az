// F5.61 — köhnə saytın xəbər HTML-i → Markdown, tarix → ISO.
//
// Turndown parametrləri extract.mjs-dəkilərlə EYNİDİR (bir dəyişəndə o biri də).
// Əlavə təmizlik (extract.mjs-də yoxdur, F5.61 xəbərlərində rast gəlindi):
//   - abzasın əvvəlindəki &nbsp; yığını («&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; “Ortaq…») —
//     Markdown-da 4+ boşluqla başlayan sətir KOD BLOKU olur;
//   - söz arasında &nbsp; ilə qoşa boşluq («Həziyev&nbsp; də») → bir boşluq;
//   - ardıcıl <br><br> → yeni abzas (tək <br> sətir sonu olaraq qalır).
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});
turndown.addRule('dropEmptyAnchors', {
  filter: (node) => node.nodeName === 'A' && !node.textContent.trim() && !node.querySelector('img'),
  replacement: () => '',
});

const LIST_LINE = /^\s*([-*+]|\d+\.)\s/;

export function htmlToMarkdown(html) {
  const pre = String(html || '').replace(/(?:<br\s*\/?>\s*){2,}/gi, '</p><p>');
  return turndown
    .turndown(pre)
    .replace(/ /g, ' ')
    .split('\n')
    .map((line) => {
      let l = LIST_LINE.test(line) ? line : line.replace(/^[ \t]+/, '');
      const hardBreak = / {2,}$/.test(l);
      l = l.replace(/[ \t]+$/, '').replace(/(\S)[ \t]{2,}(?=\S)/g, '$1 ');
      return hardBreak && l ? l + '  ' : l;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** `2026.07.15 14:53` -> `2026-07-15T14:53:00+04:00` (Bakı, extract.mjs → parseDate ilə eyni). */
export function parseLegacyDate(raw) {
  const m = String(raw || '')
    .replace(/ /g, ' ')
    .trim()
    .match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h = '00', mi = '00'] = m;
  const pad = (v) => String(v).padStart(2, '0');
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:00+04:00`;
}
