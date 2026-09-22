// F5.30b/F5.32a/F5.36 — /[locale]/vetendaslarin-muracieti: vətəndaşların
// müraciətinə baxılması qaydası + elektron müraciət forması.
//
// F5.36 — portal.adda.edu.az «Onlayn qeydiyyat forması» üslubu:
//   - hero-dan sonra mərkəzləşdirilmiş bölmə başlığı (eyebrow + Fraunces
//     başlıq + izah), ağ fonda — köhnə forma başlığı (`<header class=
//     "ap-header">`) 02-header.css-in QLOBAL `header{}` seçicisindən navy
//     gradient alırdı, üstündə tünd və boz mətn oxunmurdu;
//   - iki sütun: SOLDA qayda (əvvəlki 8 akkordeonun mətni, sözbəsöz,
//     tərcümələri ilə birgə), SAĞDA forma kartı. Akkordeonlar ÇIXARILIB.
//
// Məzmun STATİKDİR (CMS-dən çəkilmir), ona görə admin redaktə qapısı yoxdur.
//
// DİQQƏT — «Baxılma müddətləri» bəndi GÖSTƏRİLMİR: ümumi baxılma müddəti
// (15/30 gün) TƏSDİQLƏNMƏYİB, ADDA-nın hüquq məsləhətçisi dəqiqləşdirənədək
// rəqəm yazılmır. Əvvəl «boş saxlanılır» qeydi ilə görünürdü; DİZAYN
// QAYDALARI («boş sahə render olunmur») ilə F5.36-da çıxarılıb. Təsdiq
// gələndə APPEAL_FACTS siyahısına bir sətir kimi əlavə olunur.
// Digər bəndlərdəki konkret müddətlər (5/20/10 iş günü) tapşırıqda AÇIQ
// verilib, ona görə yazılıb.
import '../../_styles/01-base.css';
import '../../_styles/02-header.css';
import '../../_styles/03-hero.css';
import '../../_styles/04-quicknav.css';
import '../../_styles/05-legacy.css';
import '../../_styles/06-spotlight.css';
import '../../_styles/07-stats.css';
import '../../_styles/08-news.css';
import '../../_styles/09-campus.css';
import '../../_styles/10-intl.css';
import '../../_styles/11-social.css';
import '../../_styles/12-vquote.css';
import '../../_styles/13-legacy2.css';
import '../../_styles/14-footer.css';
import '../../_styles/15-responsive.css';
import '../../_styles/16-footer-ftx.css';
import '../../_styles/17-header-mega.css';
import '../../_styles/18-search.css';
import '../../_styles/19-news-page.css';
import '../../_styles/36-unit.css';
import '../../_styles/40-appeal.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import AppealIsland, { type AppealDirection } from '../../_components/AppealIsland';
import { getMenu, getUnits, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

/**
 * F5.36b — «Aidiyyəti bölmə»: 28 bölməlik açılan siyahı əvəzinə 4 əsas
 * müraciət istiqaməti. Hər istiqamət MÖVCUD bir struktur bölməsinə bağlanır:
 * müraciətin bildirişi həmin bölmənin e-poçtuna gedir (adda-strapi
 * utils/appeal-mail.ts; bölmədə e-poçt yoxdursa ümumi ünvana).
 *
 * TƏK SEÇİM: `appeal.targetUnit` manyToOne əlaqədir — müraciət bir bölməyə
 * ünvanlanır. Çoxlu seçim sxem dəyişikliyi (manyToMany) tələb edər.
 *
 * `key` footer-dəki «Rektorla əlaqə» keçidinin `?istiqamet=` parametridir
 * (Footer.tsx) — dəyişdiriləndə orada da dəyişdirilməlidir.
 *
 * «Qəbul» üçün ayrıca struktur bölməsi YOXDUR (bax /elaqe, ROUTING_TABLE) —
 * tədrisin təşkili üzrə prorektorluğa bağlanıb. Zaur müəllim dəqiqləşdirə
 * bilər: yalnız `unitSlug` dəyişir.
 */
const APPEAL_DIRECTIONS: { key: string; unitSlug: string; label: string; hint: string }[] = [
  { key: 'rektor', unitSlug: 'rektor', label: 'Rektora müraciət', hint: 'Rəhbərliyə ünvanlanan məsələlər' },
  {
    key: 'qebul',
    unitSlug: 'tedrisin-teskili-ve-idareedilmesi-uzre-prorektorluq',
    label: 'Qəbul məsələləri',
    hint: 'Abituriyentlər və qəbul qaydaları',
  },
  {
    key: 'tedris',
    unitSlug: 'tedris-proseslerinin-teskili-sobesi',
    label: 'Tədris prosesi və sənədlər',
    hint: 'Dərslər, imtahanlar, arayışlar',
  },
  { key: 'telim', unitSlug: 'telim-tedris-merkezi', label: 'Dənizçi sertifikatları və kurslar', hint: 'STCW təlimləri və sertifikatlar' },
];

/**
 * F5.36a — sol blok: əvvəlki 8 akkordeonun mətni (F5.30b), SÖZBƏSÖZ.
 * Başlıqlar və mətnlər i18n.ts-də artıq tərcümə olunub (F5.30b bölməsi).
 * `parts` — bir bəndin bir neçə cümləsi/siyahısı (ayrı sətirlər).
 */
const APPEAL_FACTS: { label: string; parts: (string | string[])[] }[] = [
  {
    label: 'Hüquqi əsas',
    parts: [
      'Bu qayda Azərbaycan Respublikası Konstitusiyasının 57-ci maddəsinə və «Vətəndaşların müraciətlərinə baxılması qaydası haqqında» Azərbaycan Respublikasının Qanununa əsaslanır.',
    ],
  },
  {
    label: 'Müraciət növləri',
    parts: ['Qanunun 3-cü maddəsinə əsasən müraciətlər üç növə bölünür: təklif, ərizə və şikayət.'],
  },
  { label: 'Müraciət yolları', parts: [['Yazılı', 'Elektron', 'Şəxsən', 'Telefonla']] },
  {
    label: 'Müraciətdə nə göstərilməlidir',
    parts: [['Ad', 'Ata adı', 'Soyad', 'Ünvan və ya iş yeri', 'İmza'], 'Bunlar göstərilmədikdə müraciət anonim sayılır.'],
  },
  {
    label: 'Cavab',
    parts: [
      'Müraciətə yazılı cavab verilir. Müraciət təmin edilmədikdə səbəb göstərilir və şikayət vermək qaydası izah olunur.',
    ],
  },
  {
    label: 'Təkrar müraciətlər',
    parts: [
      'Eyni məsələ üzrə bir il ərzində 3 dəfə əsaslandırılmış cavab verilibsə və yeni məlumat yoxdursa, növbəti müraciət baxılmamış saxlanıla bilər. Bu barədə müraciət edənə 5 iş günü ərzində məlumat verilir.',
    ],
  },
  {
    label: 'Korrupsiya ilə bağlı müraciətlər',
    parts: [
      'Korrupsiya ilə bağlı müraciətlərə 20 iş günü ərzində baxılır. Əlavə məlumat tələb olunduqda müddət daha 10 iş günü uzadıla bilər.',
    ],
  },
];

export function generateStaticParams() {
  return [{ locale: 'az' }, { locale: 'ru' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    title: tr('Vətəndaşların müraciəti', locale),
    description: tr(
      'Rəsmi ərizə, təklif və şikayət vermək qaydası Azərbaycan Respublikasının qanunvericiliyinə əsasən.',
      locale,
    ),
  };
}

export default async function CitizenAppealsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  // F5.36b — istiqamət → bölmə documentId. documentId dildən asılı deyil,
  // ona görə həmişə defolt (`az`) siyahıdan həll olunur.
  const [menu, units] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getUnits('az').catch(() => []),
  ]);
  const unitIdBySlug = new Map(units.map((u) => [u.slug, u.documentId]));
  // Bölməsi tapılmayan istiqamət GÖSTƏRİLMİR (seçim itməsin deyə) — köhnə
  // açılan siyahı da bölmələr yüklənməyəndə tam gizlənirdi.
  const directions: AppealDirection[] = APPEAL_DIRECTIONS.flatMap((d) => {
    const documentId = unitIdBySlug.get(d.unitSlug);
    return documentId ? [{ key: d.key, documentId, label: tr(d.label, locale), hint: tr(d.hint, locale) }] : [];
  });

  // F5.31c — CorrectionIsland ilə EYNİ qayda: tərcümə klient bundle-ına
  // (55 kB-lıq tam T lüğəti) düşməsin deyə hazır string-lər PROP kimi ötürülür.
  const appealLabels: Record<string, string> = {
    title: tr('Onlayn müraciət forması', locale),
    sec1Title: tr('Müraciət növü', locale),
    sec1Sub: tr('Müraciətinizin məqsədinə uyğun növü seçin.', locale),
    sec2Title: tr('Şəxsi məlumatlar', locale),
    sec2Sub: tr('Cavab bu məlumatlar əsasında göndəriləcək.', locale),
    sec3Title: tr('Müraciətin məzmunu', locale),
    sec3Sub: tr('Müraciətinizi aydın və ətraflı yazın.', locale),
    sec4Title: tr('Təsdiq və göndərmə', locale),
    sec4Sub: tr('Məlumatları yoxlayın və müraciəti göndərin.', locale),
    type_sual: tr('Sual', locale),
    type_teklif: tr('Təklif', locale),
    type_erize: tr('Ərizə', locale),
    type_sikayet: tr('Şikayət', locale),
    informalNote: tr(
      'Bu, rəsmi müraciət deyil. Rəsmi cavab üçün Təklif/Ərizə/Şikayət seçin.',
      locale,
    ),
    deadlineNote: tr(
      'Bu, rəsmi müraciətdir. Müraciətə qanunvericiliyə uyğun olaraq yazılı cavab verilir.',
      locale,
    ),
    firstNameLabel: tr('Ad', locale),
    lastNameLabel: tr('Soyad', locale),
    patronymicLabel: tr('Ata adı', locale),
    emailLabel: tr('E-poçt', locale),
    phoneLabel: tr('Telefon', locale),
    addressLabel: tr('Ünvan (istəyə bağlı)', locale),
    unitLabel: tr('Aidiyyəti bölmə (istəyə bağlı)', locale),
    unitHint: tr('Birini seçin və ya boş buraxın — müraciət ümumi ünvana göndəriləcək.', locale),
    subjectLabel: tr('Mövzu', locale),
    messageLabel: tr('Mətn', locale),
    consentLabel: tr(
      'Fərdi məlumatlarımın müraciətimin cavablandırılması məqsədilə işlənməsinə razılıq verirəm',
      locale,
    ),
    consentErr: tr('Davam etmək üçün razılıq qutusunu işarələyin.', locale),
    attachmentLabel: tr('Fayl əlavəsi (istəyə bağlı)', locale),
    attachmentHint: tr('PDF, DOC, DOCX, JPG, PNG — maksimum 4 MB', locale),
    attachmentTooLarge: tr('Fayl 4 MB-dan böyükdür.', locale),
    attachmentUploadFailed: tr('Fayl yüklənmədi. Müraciəti faylsız göndərin və ya bir az sonra yenidən cəhd edin.', locale),
    attachmentBadType: tr('Bu fayl növünə icazə verilmir. PDF, DOC, DOCX, JPG və ya PNG seçin.', locale),
    requiredMark: tr('məcburi sahə', locale),
    submit: tr('Göndər', locale),
    sending: tr('Göndərilir', locale),
    successMsg: tr('Müraciətiniz qəbul edildi.', locale),
    successSub: tr('Cavab yuxarıda göstərdiyiniz e-poçt ünvanına göndəriləcək.', locale),
    trackingLabel: tr('İzləmə kodu', locale),
    formalStatus: tr('Bu, rəsmi müraciətdir', locale),
    informalStatus: tr('Bu, qeyri-rəsmi sorğudur', locale),
    newAppeal: tr('Yeni müraciət göndər', locale),
    requiredErr: tr('Zəhmət olmasa məcburi sahələri doldurun.', locale),
    tooMany: tr('Çox sayda cəhd. Bir az sonra yenidən yoxlayın.', locale),
    error: tr('Müraciət göndərilə bilmədi. Bir az sonra yenidən cəhd edin.', locale),
  };

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Kommunikasiya', locale)}</div>
            <h1 className="np-h1">{tr('Vətəndaşların müraciəti', locale)}</h1>
            <p className="np-lead">
              {tr('Sual, təklif, ərizə və ya şikayətinizi bu səhifədən göndərə bilərsiniz.', locale)}
            </p>
          </div>
        </section>

        <section className="ap-page">
          <div className="container">
            {/* F5.36 — portal «section-head»: ağ fonda, mərkəzdə. */}
            <div className="ap-head">
              <span className="ap-eyebrow">
                <span className="ap-eyebrow-dot" aria-hidden="true" />
                {tr('Elektron müraciət', locale)}
              </span>
              <h2 className="ap-title">{tr('Onlayn müraciət forması', locale)}</h2>
              <p className="ap-intro">
                {tr('Formanı doldurub göndərin — müraciətiniz qeydə alınacaq və sizə izləmə kodu veriləcək.', locale)}{' '}
                <span className="ap-req" aria-hidden="true">*</span>{' '}
                {tr('ilə işarələnmiş sahələr məcburidir.', locale)}
              </p>
            </div>

            <div className="ap-layout">
              {/* F5.36a — SOL blok: qayda (əvvəlki akkordeonlar). Mobildə
                  formadan SONRA gəlir (bax 40-appeal.css, `order`). */}
              <aside className="ap-aside" aria-labelledby="ap-aside-title">
                <h3 className="ap-aside-title" id="ap-aside-title">
                  {tr('Müraciət haqqında bilməli olduqlarınız', locale)}
                </h3>
                <ol className="ap-facts">
                  {APPEAL_FACTS.map((f) => (
                    <li key={f.label}>
                      <small>{tr(f.label, locale)}</small>
                      {f.parts.map((p, i) =>
                        Array.isArray(p) ? (
                          <ul key={i} className="ap-fact-tags">
                            {p.map((w) => (
                              <li key={w}>{tr(w, locale)}</li>
                            ))}
                          </ul>
                        ) : (
                          <p key={i}>{tr(p, locale)}</p>
                        ),
                      )}
                    </li>
                  ))}
                </ol>
              </aside>

              <AppealIsland directions={directions} labels={appealLabels} />
            </div>

            <div className="un-links ap-back">
              <Link href={`/${locale}/elaqe`} className="un-link-btn">
                <i className="ti ti-arrow-left" aria-hidden="true" />
                {tr('Əlaqə', locale)}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
