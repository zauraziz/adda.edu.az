export function generateIcs({
  title,
  startAt,
  endAt,
  location,
  description,
  uid
}: {
  title: string;
  startAt: string;
  endAt?: string;
  location?: string;
  description?: string;
  uid: string;
}): string {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const start = formatDate(startAt);
  const end = endAt ? formatDate(endAt) : start;
  const dtStamp = formatDate(new Date().toISOString());
  
  if (!start) return '';

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ADDA//NONSGML Events//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`
  ];

  if (location) ics.push(`LOCATION:${location}`);
  if (description) {
    const cleanDesc = description.replace(/\n/g, '\\n').replace(/\r/g, '');
    ics.push(`DESCRIPTION:${cleanDesc}`);
  }
  
  ics.push('END:VEVENT', 'END:VCALENDAR');
  return ics.join('\r\n');
}
