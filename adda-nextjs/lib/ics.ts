// F2.6b / .ics təqvim generatoru (RFC 5545 sadələşdirilmiş).
// Client-side "Təqvimə əlavə et" yükləməsi üçün. Xüsusi simvollar escape olunur.

interface IcsInput {
  title: string;
  startAt: string;
  endAt?: string;
  location?: string;
  description?: string;
  uid: string;
}

// ISO → YYYYMMDDTHHMMSSZ (UTC)
function toIcsDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// RFC 5545: tərs-slash, nöqtəli vergül, vergül və yeni sətir escape olunmalıdır
function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function generateIcs(input: IcsInput): string {
  const start = toIcsDate(input.startAt);
  if (!start) return '';
  const end = input.endAt ? toIcsDate(input.endAt) : start;
  const stamp = toIcsDate(new Date().toISOString());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ADDA//Tedbirler//AZ',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:' + input.uid,
    'DTSTAMP:' + stamp,
    'DTSTART:' + start,
    'DTEND:' + end,
    'SUMMARY:' + escapeIcs(input.title),
  ];
  if (input.location) lines.push('LOCATION:' + escapeIcs(input.location));
  if (input.description) lines.push('DESCRIPTION:' + escapeIcs(input.description));
  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
}
