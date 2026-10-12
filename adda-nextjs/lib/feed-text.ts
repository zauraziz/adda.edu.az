// Başlıq üzrə lentlərin (lib/strapi.ts → TITLE_FEEDS) blok başlığı və mətnləri —
// az dilində, tr() ilə tərcümə olunur. F5.48-də SectionPage-in içində idi;
// F5.49-dan «Bunlar üçün» auditoriya səhifələri də işlədir.
import type { FeedText } from '@/app/_components/AdmissionData';
import type { TitleFeed } from './strapi';

export const FEED_TEXT: Record<TitleFeed, { title: string } & FeedText> = {
  aciq_qapi: {
    title: 'Növbəti açıq qapı günü',
    empty: 'Hazırda planlaşdırılmış açıq qapı günü yoxdur. Tarix elan olunanda burada görünəcək.',
    past: 'Ötən açıq qapı günləri',
    action: 'Qeydiyyatdan keç',
    hash: '#qeydiyyat',
  },
  konfrans: {
    title: 'Növbəti elmi tədbirlər',
    empty: 'Hazırda elan olunmuş elmi tədbir yoxdur. Konfrans elan olunanda burada görünəcək.',
    past: 'Ötən konfranslar və xəbərlər',
    action: 'Ətraflı',
    hash: '',
  },
  tedbirler: {
    title: 'Növbəti tədbirlər',
    empty: 'Hazırda elan olunmuş tədbir yoxdur. Yeni tədbir elan olunanda burada görünəcək.',
    past: 'Tələbə həyatından xəbərlər',
    action: 'Ətraflı',
    hash: '',
    pastEvents: 0,
  },
  idman: { title: 'İdman yarışları', empty: null, past: 'Son yarışlar və nəticələr', action: 'Ətraflı', hash: '' },
  medeniyyet: { title: 'Mədəni tədbirlər', empty: null, past: 'Son tədbirlər', action: 'Ətraflı', hash: '' },
  beynelxalq: { title: 'Beynəlxalq əməkdaşlıq xəbərləri', empty: null, past: 'Son xəbərlər', action: 'Ətraflı', hash: '' },
  // F5.49
  asco: { title: 'ASCO ilə əməkdaşlıq xəbərləri', empty: null, past: 'Son xəbərlər', action: 'Ətraflı', hash: '' },
  abituriyent: { title: 'Abituriyentlər üçün tədbirlər', empty: null, past: 'Qəbul və tanışlıq xəbərləri', action: 'Ətraflı', hash: '' },
  mezunlar: { title: 'Məzunlar barədə', empty: null, past: 'Son xəbərlər', action: 'Ətraflı', hash: '', pastEvents: 0 },
  emekdaslar: { title: 'Akademiyanın həyatından', empty: null, past: 'Son xəbərlər', action: 'Ətraflı', hash: '' },
  terefdaslar: { title: 'Əməkdaşlıq xəbərləri', empty: null, past: 'Son xəbərlər', action: 'Ətraflı', hash: '' },
};
