// K30 — «Bunlar üçün» auditoriya səhifələri.
//
// NƏ ÜÇÜNDÜR. Header-dəki `infofor-menu` altı auditoriya bəndi göstərirdi,
// hamısı `/hazirlanir/...`-a gedirdi. Bu modul onların hər birinə real
// səhifə verir: saytın həmin auditoriya üçün kəsilmiş versiyası.
//
// NİYƏ STRAPI-DƏ DEYİL. Bu, məzmun deyil — NAVİQASİYA KURATORLUĞUDUR.
// Hər link mövcud marşruta işarə etməlidir; hansı səhifənin hazır olduğunu
// isə repo bilir, redaktor yox. Menyunun 204 hədəfindən 105-i hələ
// `/hazirlanir`-dədir — admin paneldən link seçmək ölü linklər yaradardı.
// Yeni səhifə hazır olanda onsuz da repoya toxunulur; həmin an bura da
// əlavə edilir. (Strapi-yə köçürmək lazım olsa `rector` sxemi nümunədir.)
//
// ETİKETLƏR `tr()`-dən keçir — burada yalnız Azərbaycan dilində yazılır.
// `npm run check:audiences` hər etiketin lüğətdə olduğunu yoxlayır.
import type { Locale } from './i18n';

export interface AudLink {
  /** i18n lüğətindəki açar (az). */
  label: string;
  href: string;
}
export interface AudStep extends AudLink {
  /** Kartın altındakı bir sətirlik izah. */
  note: string;
}
export interface AudGroup {
  title: string;
  links: AudLink[];
}
export interface Audience {
  slug: string;
  /** Menyudakı etiket — i18n-də artıq var. */
  label: string;
  icon: string;
  lead: string;
  steps: AudStep[];
  groups: AudGroup[];
}

export const AUDIENCES: Audience[] = [
  {
    slug: 'abituriyentler',
    label: 'Abituriyentlər',
    icon: 'ti-school',
    lead: 'Qəbul, ixtisaslar və akademiyada təhsilin necə qurulduğu — bir səhifədə.',
    steps: [
      { label: 'Bakalavriat', href: '/sehife/bakalavriat', note: 'Qəbul şərtləri və təhsil müddəti' },
      { label: 'İxtisaslar', href: '/ixtisaslar', note: 'Dörd mühəndislik ixtisası' },
      { label: 'Fakültələr', href: '/fakulteler', note: 'Hansı fakültə hansı ixtisası aparır' },
    ],
    groups: [
      {
        title: 'Təhsil pillələri',
        links: [
          { label: 'Bakalavriat', href: '/sehife/bakalavriat' },
          { label: 'Magistratura', href: '/sehife/magistratura' },
          { label: 'Doktorantura', href: '/sehife/doktorantura' },
        ],
      },
      {
        title: 'İxtisaslar',
        links: [
          { label: 'Dəniz naviqasiyası mühəndisliyi', href: '/ixtisaslar/deniz-naviqasiyasi-muhendisliyi' },
          { label: 'Gəmi energetik qurğularının istismarı mühəndisliyi', href: '/ixtisaslar/gemi-energetik-qurgularinin-istismari-muhendisliyi' },
          { label: 'Gəmiqayırma və gəmi təmiri mühəndisliyi', href: '/ixtisaslar/gemiqayirma-ve-gemi-temiri-muhendisliyi' },
          { label: 'Elektrik və elektronika mühəndisliyi (su nəqliyyatı üzrə)', href: '/ixtisaslar/elektrik-ve-elektronika-muhendisliyi-su-neqliyyati-uzre' },
        ],
      },
      {
        title: 'Akademiya haqqında',
        links: [
          { label: 'Akademiyanın tarixi', href: '/tarix' },
          { label: 'ADDA dünən və bu gün', href: '/sehife/adda-dunen-ve-bugun' },
          { label: 'Struktur', href: '/struktur' },
          { label: 'Muzey', href: '/sehife/muzey' },
        ],
      },
      {
        title: 'Tələbə həyatı',
        links: [
          { label: 'Yataqxana', href: '/sehife/yataqxana' },
          { label: 'İdman', href: '/sehife/idman' },
          { label: 'Tələbə Gənclər Təşkilatı', href: '/sehife/telebe-gencler-teskilati' },
        ],
      },
    ],
  },
  {
    slug: 'telebeler',
    label: 'Tələbələr',
    icon: 'ti-book',
    lead: 'Tədris, resurslar, təşkilatlar və kampus — gündəlik lazım olanlar.',
    steps: [
      { label: 'Elektron kitabxana', href: '/sehife/elektron-kitabxana', note: 'Onlayn kitab və jurnal bazası' },
      { label: 'Təcrübə haqqında', href: '/sehife/tecrube-haqqinda', note: 'Gəmi təcrübəsi və hesabat qaydaları' },
      { label: 'İnformasiya Resurs Mərkəzi', href: '/struktur/informasiya-resurs-merkezi', note: 'Kitabxana və oxu zalları' },
    ],
    groups: [
      {
        title: 'Tədris',
        links: [
          { label: 'Fakültələr', href: '/fakulteler' },
          { label: 'İxtisaslar', href: '/ixtisaslar' },
          { label: 'Təcrübə haqqında', href: '/sehife/tecrube-haqqinda' },
          { label: 'Tədris proseslərinin təşkili şöbəsi', href: '/struktur/tedris-proseslerinin-teskili-sobesi' },
        ],
      },
      {
        title: 'Resurslar',
        links: [
          { label: 'Elektron kitabxana', href: '/sehife/elektron-kitabxana' },
          { label: 'İnformasiya Resurs Mərkəzi', href: '/struktur/informasiya-resurs-merkezi' },
          { label: 'Faydalı linklər', href: '/sehife/faydali-linkler' },
        ],
      },
      {
        title: 'Tələbə təşkilatları',
        links: [
          { label: 'Tələbə Gənclər Təşkilatı', href: '/sehife/telebe-gencler-teskilati' },
          { label: 'Tələbə Elmi Cəmiyyəti', href: '/sehife/telebe-elmi-cemiyyeti' },
          { label: 'Tələbə Həmkarlar İttifaqı Komitəsi', href: '/sehife/telebe-hemkarlar-ittifaqi-komitesi' },
        ],
      },
      {
        title: 'Kampus',
        links: [
          { label: 'Yataqxana', href: '/sehife/yataqxana' },
          { label: 'İdman', href: '/sehife/idman' },
          { label: 'Muzey', href: '/sehife/muzey' },
        ],
      },
      {
        title: 'Elmi fəaliyyət',
        links: [
          { label: 'Elmi jurnal', href: '/sehife/elmi-jurnal' },
          { label: 'Elmi konfranslar', href: '/sehife/elmi-konfranslar' },
          { label: 'Gənc Alimlər Şurası', href: '/sehife/genc-alimler-surasi' },
        ],
      },
    ],
  },
  {
    slug: 'mezunlar',
    label: 'Məzunlar',
    icon: 'ti-award',
    lead: 'Akademiyanın bu günü, elmi nəşrləri və məzunları birləşdirən xatirə.',
    steps: [
      { label: 'ADDA dünən və bu gün', href: '/sehife/adda-dunen-ve-bugun', note: 'Akademiya indi necə görünür' },
      { label: 'Sabiq rektorlarımız', href: '/sabiq-rektorlar', note: 'Rəhbərlik ənənəsi 1997-ci ildən' },
      { label: 'Qəhrəmanlarımız', href: '/sehife/qehremanlarimiz', note: 'Vətən uğrunda şəhid olan məzunlar' },
    ],
    groups: [
      {
        title: 'Akademiya',
        links: [
          { label: 'Akademiyanın tarixi', href: '/tarix' },
          { label: 'ADDA dünən və bu gün', href: '/sehife/adda-dunen-ve-bugun' },
          { label: 'Sabiq rektorlarımız', href: '/sabiq-rektorlar' },
          { label: 'Struktur', href: '/struktur' },
        ],
      },
      {
        title: 'Elm və nəşrlər',
        links: [
          { label: 'Elmi jurnal', href: '/sehife/elmi-jurnal' },
          { label: 'Elmi jurnalımız onlayn versiyada', href: '/sehife/elmi-jurnalimiz-onlayn-versiyada' },
          { label: 'Elmi konfranslar', href: '/sehife/elmi-konfranslar' },
        ],
      },
      {
        title: 'Xatirə və kimlik',
        links: [
          { label: 'Qəhrəmanlarımız', href: '/sehife/qehremanlarimiz' },
          { label: 'Muzey', href: '/sehife/muzey' },
          { label: 'Korporativ üslub', href: '/sehife/korporativ-uslub' },
        ],
      },
      {
        title: 'Əlaqə',
        links: [
          { label: 'Xəbərlər', href: '/xeberler' },
          { label: 'Əlaqə', href: '/sehife/elaqe' },
        ],
      },
    ],
  },
  {
    slug: 'emekdaslar',
    label: 'Əməkdaşlar',
    icon: 'ti-id-badge-2',
    lead: 'Heyət, struktur bölmələri, elmi fəaliyyət və şəxsi profil idarəetməsi.',
    steps: [
      { label: 'Profilim', href: '/profil', note: 'Öz məlumatlarını özün yenilə' },
      { label: 'Professor-müəllim heyəti', href: '/heyet/professor-muellim', note: 'Bütün kafedralar üzrə siyahı' },
      { label: 'Elmi Şura', href: '/sehife/elmi-sura', note: 'Tərkib və iclas qaydaları' },
    ],
    groups: [
      {
        title: 'Heyət',
        links: [
          { label: 'Professor-müəllim heyəti', href: '/heyet/professor-muellim' },
          { label: 'İnzibati heyət', href: '/heyet/inzibati' },
          { label: 'Təlimçi-texniki heyət', href: '/heyet/telimci-texniki' },
        ],
      },
      {
        title: 'Struktur bölmələri',
        links: [
          { label: 'Struktur', href: '/struktur' },
          { label: 'Personalın idarə edilməsi, əmək haqqı şöbəsi və kargüzarlıq şöbəsi', href: '/struktur/personalin-idare-edilmesi-emek-haqqi-sobesi-ve-karguzarliq-sobesi' },
          { label: 'Mühasibat uçotu və hesabat şöbəsi', href: '/struktur/muhasibat-ucotu-ve-hesabat-sobesi' },
          { label: 'Tədris proseslərinin təşkili şöbəsi', href: '/struktur/tedris-proseslerinin-teskili-sobesi' },
        ],
      },
      {
        title: 'Elmi fəaliyyət',
        links: [
          { label: 'Elmi Şura', href: '/sehife/elmi-sura' },
          { label: 'Elmi-tədqiqat fəaliyyəti', href: '/sehife/elmi-tedqiqat-fealiyyeti' },
          { label: 'Elmi-tədqiqat laboratoriyaları', href: '/sehife/elmi-tedqiqat-laboratoriyalari' },
          { label: 'Elmi jurnal', href: '/sehife/elmi-jurnal' },
          { label: 'Elmi katib', href: '/sehife/elmi-katib' },
        ],
      },
      {
        title: 'Beynəlxalq',
        links: [
          { label: 'Beynəlxalq əməkdaşlıq', href: '/sehife/beynelxalq-emekdasliq' },
          { label: 'Xaricdə təhsil və ixtisasartırma', href: '/sehife/xaricde-tehsil-ve-ixtisasartirma' },
        ],
      },
    ],
  },
  {
    slug: 'beynelxalq-telebeler',
    label: 'Beynəlxalq tələbələr',
    icon: 'ti-world',
    lead: 'Əcnəbi vətəndaşlar üçün qəbul qaydaları, təhsil şəraiti və yaşayış.',
    steps: [
      { label: 'Əcnəbi tələbələrin qəbulu qaydaları', href: '/sehife/ecnebi-telebelerin-qebulu-qaydalari', note: 'Sənədlər və müraciət ardıcıllığı' },
      { label: 'Əcnəbi tələbələrin təhsili', href: '/sehife/ecnebi-telebelerin-tehsili', note: 'Tədris dili və proqramlar' },
      { label: 'Yataqxana', href: '/sehife/yataqxana', note: 'Yaşayış şəraiti' },
    ],
    groups: [
      {
        title: 'Qəbul',
        links: [
          { label: 'Əcnəbi tələbələrin qəbulu qaydaları', href: '/sehife/ecnebi-telebelerin-qebulu-qaydalari' },
          { label: 'Əcnəbi tələbələrin təhsili', href: '/sehife/ecnebi-telebelerin-tehsili' },
          { label: 'Bakalavriat', href: '/sehife/bakalavriat' },
          { label: 'Magistratura', href: '/sehife/magistratura' },
        ],
      },
      {
        title: 'Beynəlxalq əlaqələr',
        links: [
          { label: 'Beynəlxalq əlaqələr qrupu', href: '/sehife/beynelxalq-elaqeler-qrupu' },
          { label: 'Beynəlxalq əməkdaşlıq', href: '/sehife/beynelxalq-emekdasliq' },
          { label: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi', href: '/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi' },
        ],
      },
      {
        title: 'Təhsil',
        links: [
          { label: 'Fakültələr', href: '/fakulteler' },
          { label: 'İxtisaslar', href: '/ixtisaslar' },
          { label: 'Akademiyanın tarixi', href: '/tarix' },
        ],
      },
      {
        title: 'Yaşayış',
        links: [
          { label: 'Yataqxana', href: '/sehife/yataqxana' },
          { label: 'İdman', href: '/sehife/idman' },
          { label: 'Əlaqə', href: '/sehife/elaqe' },
        ],
      },
    ],
  },
  {
    slug: 'valideynler',
    label: 'Valideynlər',
    icon: 'ti-users',
    lead: 'Akademiya nədir, övladınız hansı ixtisasa yiyələnir və hansı şəraitdə oxuyur.',
    steps: [
      { label: 'ADDA dünən və bu gün', href: '/sehife/adda-dunen-ve-bugun', note: 'Akademiya haqqında qısa təsəvvür' },
      { label: 'İxtisaslar', href: '/ixtisaslar', note: 'Məzun hansı peşəni alır' },
      { label: 'Yataqxana', href: '/sehife/yataqxana', note: 'Yaşayış və qayğı şəraiti' },
    ],
    groups: [
      {
        title: 'Akademiya haqqında',
        links: [
          { label: 'Akademiyanın tarixi', href: '/tarix' },
          { label: 'ADDA dünən və bu gün', href: '/sehife/adda-dunen-ve-bugun' },
          { label: 'Struktur', href: '/struktur' },
          { label: 'Sabiq rektorlarımız', href: '/sabiq-rektorlar' },
        ],
      },
      {
        title: 'Təhsil',
        links: [
          { label: 'Bakalavriat', href: '/sehife/bakalavriat' },
          { label: 'İxtisaslar', href: '/ixtisaslar' },
          { label: 'Fakültələr', href: '/fakulteler' },
        ],
      },
      {
        title: 'Şərait və qayğı',
        links: [
          { label: 'Yataqxana', href: '/sehife/yataqxana' },
          { label: 'İdman', href: '/sehife/idman' },
          { label: 'Qəhrəmanlarımız', href: '/sehife/qehremanlarimiz' },
        ],
      },
      {
        title: 'Əlaqə',
        links: [
          { label: 'Xəbərlər', href: '/xeberler' },
          { label: 'Əlaqə', href: '/sehife/elaqe' },
        ],
      },
    ],
  },
];

export function audienceBySlug(slug: string): Audience | undefined {
  return AUDIENCES.find((a) => a.slug === slug);
}

export function audienceHref(slug: string, locale: Locale): string {
  return `/${locale}/bunlar-ucun/${slug}`;
}
