/**
 * F5.53 — footer-in hüquqi keçidləri: «Məxfilik siyasəti», «İstifadə şərtləri»,
 * «Korporativ stil» (köhnə saytdan gələn «Korporativ üslub» səhifəsi yenidən
 * qurulur). Hamısı layout=akademiya (SectionPage: bölmələr + mündəricat).
 *
 * MƏZMUN saytın həqiqi iş qaydasından yazılıb (kod, 15.10.2026): formalar
 * (müraciət, qeydiyyat, düzəliş), e-poçtla kimlik (keçid 15 dəq., sessiya 30 gün —
 * IDENTITY_MAGIC_TTL_MIN / IDENTITY_SESSION_TTL_DAYS defoltları), brauzer
 * bildirişləri, kopilot (Gemini), kuki `adda_id`, brauzer yaddaşı `adda-a11y`,
 * `adda_session_id`; xidmətlər Vercel, Render, Neon, Cloudinary, Resend, Google.
 * İş qaydası dəyişəndə (yeni forma, analitika, yeni xidmət) mətn də dəyişməlidir.
 * Qanunlar: «Fərdi məlumatlar haqqında» (11.05.2010), «Vətəndaşların müraciətləri
 * haqqında» (30.09.2015, № 1308-IVQ), «Müəlliflik hüququ və əlaqəli hüquqlar
 * haqqında» (05.06.1996, № 115-IQ). Hüquq şöbəsi yoxlamalıdır.
 *
 * Korporativ üslub: mətndə `{{logo}}`, `{{presentation}}` (önizləmə şəkilləri),
 * `{{png}}`, `{{pdf}}`, `{{cdr}}`, `{{pptx}}` (rəsmi fayllar) — legal-pages.ts
 * faylları tapır/köçürür və ünvanları yerinə qoyur (CORP_FILES).
 */
import type { LinkSeed, QebulPageSeed } from './qebul-pages-content';
import { ACADEMY_PHONE_AZ, ACADEMY_PHONE_INTL } from './phone-fix';

export const PRIVACY_SLUG = 'mexfilik-siyaseti';
export const TERMS_SLUG = 'istifade-sertleri';
export const CORP_SLUG = 'korporativ-uslub';

const ASK = '/vetendaslarin-muracieti';
const UPDATED = '15.10.2026';

const CONTACT_AZ =
  `**E-poçt:** info@adda.edu.az\n\n**Telefon:** ${ACADEMY_PHONE_AZ}\n\n**Ünvan:** AZ1000, Bakı, Zərifə Əliyeva küçəsi 18\n\n` +
  `Sorğunu [onlayn göndərin](${ASK}).`;
const CONTACT_EN =
  `**E-mail:** info@adda.edu.az\n\n**Phone:** ${ACADEMY_PHONE_INTL}\n\n**Address:** 18 Zarifa Aliyeva Street, Baku AZ1000\n\n` +
  `[Send your request online](${ASK}).`;
const CONTACT_RU =
  `**E-mail:** info@adda.edu.az\n\n**Телефон:** ${ACADEMY_PHONE_INTL}\n\n**Адрес:** AZ1000, Баку, ул. Зарифы Алиевой, 18\n\n` +
  `[Отправьте запрос онлайн](${ASK}).`;

const LINK = {
  privacy: { az: 'Məxfilik siyasəti', en: 'Privacy policy', ru: 'Политика конфиденциальности' },
  terms: { az: 'İstifadə şərtləri', en: 'Terms of use', ru: 'Условия использования' },
  corp: { az: 'Korporativ üslub', en: 'Corporate identity', ru: 'Фирменный стиль' },
  ask: { az: 'Onlayn müraciət', en: 'Online enquiry', ru: 'Онлайн-обращение' },
  contact: { az: 'Əlaqə', en: 'Contact', ru: 'Контакты' },
  certs: { az: 'Akkreditasiya və sertifikatlar', en: 'Accreditation and certificates', ru: 'Аккредитация и сертификаты' },
};
type L = 'az' | 'en' | 'ru';
const links = (l: L, keys: (keyof typeof LINK)[]): LinkSeed[] =>
  keys.map((k) => ({
    label: LINK[k][l],
    url: { privacy: `/sehife/${PRIVACY_SLUG}`, terms: `/sehife/${TERMS_SLUG}`, corp: `/sehife/${CORP_SLUG}`, ask: ASK, contact: '/elaqe', certs: '/sertifikatlar' }[k],
  }));

// ── 1. Məxfilik siyasəti ─────────────────────────────────────────────────────
const PRIVACY_AZ_BODY = `Bu siyasət «Azərbaycan Dövlət Dəniz Akademiyası» publik hüquqi şəxsinin (bundan sonra «Akademiya») rəsmi internet portalına (adda.edu.az, bundan sonra «Portal») aiddir. Portaldan istifadə edərkən məlumatlarınız Azərbaycan Respublikasının «Fərdi məlumatlar haqqında» 11 may 2010-cu il tarixli Qanununa və «Vətəndaşların müraciətləri haqqında» 30 sentyabr 2015-ci il tarixli, 1308-IVQ nömrəli Qanununa uyğun işlənir.

## Ümumi müddəalar

- Fərdi məlumatların sahibi və operatoru Akademiyadır: AZ1000, Bakı, Zərifə Əliyeva küçəsi 18.
- Portala baxmaq üçün qeydiyyat tələb olunmur. Fərdi məlumat yalnız formanı özünüz doldurduqda, kimliyinizi e-poçtla təsdiqlədikdə və ya bildirişlərə razılıq verdikdə toplanır.
- Portalda reklam və izləmə (analitika) kukiləri yoxdur; məlumatlarınız satılmır və profilləşdirmə üçün istifadə olunmur.

## Hansı məlumatlar toplanır

- **Vətəndaş müraciəti:** ad, soyad, ata adı, e-poçt, telefon, ünvan, mövzu, müraciətin mətni və əlavə etdiyiniz fayl. Müraciətə izləmə kodu verilir, təsdiq məktubu e-poçtunuza göndərilir.
- **Kimliyin e-poçtla təsdiqi:** e-poçt ünvanınız və adınız. Tədbirə qeydiyyat, məzmuna düzəliş təklifi və əməkdaşın öz profilini redaktə etməsi üçün istifadə olunur. Birdəfəlik giriş keçidi 15 dəqiqə etibarlıdır, giriş sessiyası 30 gün davam edir.
- **Tədbirə qeydiyyat:** tədbir, adınız, e-poçtunuz, qonaq sayı və qeydiniz.
- **Məzmuna düzəliş təklifi:** səhifə, cari və təklif olunan mətn, səbəb, adınız və e-poçtunuz.
- **Əməkdaş profili:** yalnız korporativ e-poçt ünvanı ilə; əməkdaşın özünün yazdığı profil məlumatları və foto Portalda dərc olunur.
- **Brauzer bildirişləri:** yalnız razılıq verdikdə: brauzerinizin bildiriş ünvanı və açarları, dil və seçdiyiniz mövzular.
- **Xəbərlərə abunə:** e-poçt ünvanınız.
- **AI köməkçi (kopilot):** yazdığınız sual. Suala fərdi məlumat yazmayın.
- **Texniki məlumatlar:** IP ünvanı, brauzer, açılan səhifə və vaxt. Portalın işləməsi, təhlükəsizliyi və sorğuların sayının məhdudlaşdırılması üçün server jurnallarında qısa müddət saxlanılır.

## Kukilər və brauzer yaddaşı

| Ad | Nə üçün | Müddət |
|---|---|---|
| adda_id (kuki) | E-poçtla təsdiq olunmuş giriş sessiyası | 30 gün və ya çıxışa qədər |
| adda-a11y (brauzer yaddaşı) | Şrift ölçüsü və yüksək kontrast seçimi | Silinənə qədər |
| adda_session_id (brauzer yaddaşı) | Reaksiyaların təkrarlanmaması üçün təsadüfi identifikator | Silinənə qədər |

Brauzer yaddaşındakı məlumatlar yalnız sizin cihazınızda qalır və brauzerin ayarlarından silinə bilər. Bu identifikator şəxsiyyətinizi müəyyən etmir.

## Məlumatlar nə üçün işlənir

- müraciətlərə qanunla müəyyən edilmiş qaydada baxmaq və cavab vermək;
- tədbirlərə qeydiyyatı təşkil etmək, məzmun düzəlişlərinə baxmaq;
- istədiyiniz bildirişləri və abunə materiallarını göndərmək;
- sualınıza Portalın məzmunu əsasında cavab hazırlamaq;
- Portalın təhlükəsizliyini və fasiləsiz işini təmin etmək.

## Kimlərlə paylaşılır

Məlumatlarınıza Akademiyanın aidiyyəti struktur bölməsinin məsul əməkdaşları baxır. Portalın işləməsi üçün aşağıdakı xidmətlərdən istifadə olunur; onlar məlumatı yalnız Akademiyanın tapşırığı ilə və öz xidmətini göstərmək üçün işləyir:

- Vercel: Portalın hostinqi;
- Render: məzmun idarəetmə sistemi;
- Neon: verilənlər bazası;
- Cloudinary: şəkil və fayllar;
- Resend: e-poçt göndərilməsi;
- Google (Gemini): AI köməkçinin cavabları;
- brauzerinizin bildiriş xidməti: bildirişlərin çatdırılması.

Bu xidmətlərin serverləri Azərbaycandan kənarda yerləşə bilər. Qanunla nəzərdə tutulmuş hallarda məlumat səlahiyyətli dövlət orqanlarına verilə bilər. Akademiya fərdi məlumatları satmır və reklam məqsədilə ötürmür.

## Üçüncü tərəf məzmunu

- Videolar yalnız siz oynatma düyməsinə basdıqdan sonra YouTube-dan (youtube-nocookie.com) yüklənir; bundan sonra Google-un öz qaydaları tətbiq olunur.
- Bəzi şəkil və ikonlar Cloudinary, Unsplash və jsDelivr serverlərindən yüklənir; bu xidmətlər IP ünvanınızı adi şəbəkə sorğusunun bir hissəsi kimi görür.
- Sosial şəbəkələrdə paylaşım düymələri adi keçiddir: onlara basmasanız heç bir məlumat ötürülmür.

## Saxlama müddəti

- Müraciətlər və onlara verilən cavablar qanunvericiliklə müəyyən edilmiş müddətdə saxlanılır.
- Birdəfəlik giriş keçidləri 15 dəqiqə, giriş sessiyaları 30 gün etibarlıdır; vaxtı keçmiş keçidlər avtomatik silinir.
- Tədbir qeydiyyatı və düzəliş təklifləri məqsədə çatmaq üçün lazım olan müddətdə saxlanılır.
- Bildiriş abunəliyi siz onu ləğv edənə və ya brauzer onu etibarsız sayana qədər qalır.

## Məlumatların qorunması

Portal yalnız şifrələnmiş bağlantı (HTTPS) ilə işləyir. Məlumatlara giriş məsul əməkdaşlarla məhdudlaşdırılıb, formalar avtomatlaşdırılmış göndərişlərdən qorunur.

## Hüquqlarınız

Qanunvericiliyə uyğun olaraq siz:

- barənizdə hansı məlumatların işləndiyini öyrənmək və onlarla tanış olmaq;
- yanlış məlumatın düzəldilməsini, bloklanmasını və ya məhv edilməsini tələb etmək;
- razılığınızı geri götürmək (məsələn, bildirişləri söndürmək, abunəlikdən çıxmaq);
- hüquqlarınızın pozulduğunu hesab etdikdə səlahiyyətli dövlət orqanına və ya məhkəməyə müraciət etmək hüququna maliksiniz.

Sorğunu [onlayn müraciət forması](${ASK}) ilə və ya info@adda.edu.az ünvanına göndərin.

## Siyasətdəki dəyişikliklər

Siyasət dəyişdikdə yeni mətn bu səhifədə dərc olunur və «Son yenilənmə» tarixi dəyişir.`;

const PRIVACY_EN_BODY = `This policy applies to the official web portal (adda.edu.az, the “Portal”) of the Azerbaijan State Marine Academy public legal entity (the “Academy”). When you use the Portal, your data is processed in accordance with the Law of the Republic of Azerbaijan “On Personal Data” of 11 May 2010 and the Law “On Citizens’ Appeals” No. 1308-IVQ of 30 September 2015.

## General provisions

- The owner and operator of the personal data is the Academy: 18 Zarifa Aliyeva Street, Baku AZ1000.
- You do not need to register to browse the Portal. Personal data is collected only when you fill in a form yourself, confirm your identity by e-mail or agree to receive notifications.
- The Portal uses no advertising or tracking (analytics) cookies; your data is not sold or used for profiling.

## What data is collected

- **Citizen appeals:** first name, surname, patronymic, e-mail, phone, address, subject, the text of the appeal and any file you attach. The appeal receives a tracking code and a confirmation is sent to your e-mail.
- **Identity confirmation by e-mail:** your e-mail address and name. Used for event registration, suggesting content corrections and for staff editing their own profiles. The one-time sign-in link is valid for 15 minutes; the session lasts 30 days.
- **Event registration:** the event, your name, e-mail, number of guests and your note.
- **Content correction suggestions:** the page, the current and the suggested text, the reason, your name and e-mail.
- **Staff profiles:** only with a corporate e-mail address; the profile details and photo entered by the employee are published on the Portal.
- **Browser notifications:** only with your consent: your browser’s notification address and keys, the language and the topics you choose.
- **News subscription:** your e-mail address.
- **AI assistant (copilot):** the question you type. Do not include personal data in your question.
- **Technical data:** IP address, browser, the page requested and the time. Kept briefly in server logs for the Portal’s operation and security and to limit the number of requests.

## Cookies and browser storage

| Name | Purpose | Duration |
|---|---|---|
| adda_id (cookie) | Sign-in session confirmed by e-mail | 30 days or until you sign out |
| adda-a11y (browser storage) | Font size and high contrast settings | Until deleted |
| adda_session_id (browser storage) | Random identifier that prevents duplicate reactions | Until deleted |

Data in browser storage stays on your device and can be deleted in your browser settings. This identifier does not identify you.

## Why the data is processed

- to consider and answer appeals in the manner established by law;
- to organise event registration and review content corrections;
- to send the notifications and subscription materials you requested;
- to prepare an answer to your question based on the Portal’s content;
- to keep the Portal secure and running.

## Who the data is shared with

Your data is reviewed by the responsible staff of the relevant Academy unit. The following services are used to run the Portal; they process data only on the Academy’s instructions and only to provide their service:

- Vercel: Portal hosting;
- Render: content management system;
- Neon: database;
- Cloudinary: images and files;
- Resend: sending e-mail;
- Google (Gemini): AI assistant answers;
- your browser’s push service: delivering notifications.

The servers of these services may be located outside Azerbaijan. Data may be provided to competent state authorities where required by law. The Academy does not sell personal data or pass it on for advertising.

## Third-party content

- Videos are loaded from YouTube (youtube-nocookie.com) only after you press the play button; Google’s own terms then apply.
- Some images and icons are loaded from Cloudinary, Unsplash and jsDelivr servers; these services see your IP address as part of an ordinary network request.
- Social media share buttons are plain links: no data is sent unless you click them.

## Retention

- Appeals and the answers to them are kept for the period established by law.
- One-time sign-in links are valid for 15 minutes and sessions for 30 days; expired links are deleted automatically.
- Event registrations and correction suggestions are kept for as long as their purpose requires.
- A notification subscription remains until you cancel it or your browser invalidates it.

## Data protection

The Portal works only over an encrypted connection (HTTPS). Access to data is limited to responsible staff, and forms are protected against automated submissions.

## Your rights

In accordance with the law you have the right to:

- find out what data about you is processed and access it;
- request that inaccurate data be corrected, blocked or destroyed;
- withdraw your consent (for example, turn off notifications or unsubscribe);
- apply to the competent state authority or a court if you believe your rights have been violated.

Send your request through the [online enquiry form](${ASK}) or to info@adda.edu.az.

## Changes to this policy

When the policy changes, the new text is published on this page and the “Last updated” date changes.`;

const PRIVACY_RU_BODY = `Настоящая политика относится к официальному интернет-порталу (adda.edu.az, далее «Портал») публичного юридического лица «Азербайджанская государственная морская академия» (далее «Академия»). При использовании Портала ваши данные обрабатываются в соответствии с Законом Азербайджанской Республики «О персональных данных» от 11 мая 2010 года и Законом «Об обращениях граждан» от 30 сентября 2015 года № 1308-IVQ.

## Общие положения

- Собственником и оператором персональных данных является Академия: AZ1000, Баку, ул. Зарифы Алиевой, 18.
- Для просмотра Портала регистрация не требуется. Персональные данные собираются, только если вы сами заполняете форму, подтверждаете личность по e-mail или соглашаетесь получать уведомления.
- На Портале нет рекламных и отслеживающих (аналитических) cookie; ваши данные не продаются и не используются для профилирования.

## Какие данные собираются

- **Обращения граждан:** имя, фамилия, отчество, e-mail, телефон, адрес, тема, текст обращения и прикреплённый вами файл. Обращению присваивается код отслеживания, подтверждение отправляется на ваш e-mail.
- **Подтверждение личности по e-mail:** адрес e-mail и ваше имя. Используется для регистрации на мероприятия, предложения исправлений к материалам и редактирования сотрудником собственного профиля. Одноразовая ссылка для входа действует 15 минут, сессия длится 30 дней.
- **Регистрация на мероприятие:** мероприятие, ваше имя, e-mail, число гостей и примечание.
- **Предложение исправления:** страница, текущий и предлагаемый текст, причина, ваше имя и e-mail.
- **Профиль сотрудника:** только с корпоративным адресом e-mail; данные профиля и фото, внесённые самим сотрудником, публикуются на Портале.
- **Уведомления в браузере:** только с вашего согласия: адрес и ключи уведомлений вашего браузера, язык и выбранные темы.
- **Подписка на новости:** адрес e-mail.
- **ИИ-помощник (копилот):** заданный вами вопрос. Не указывайте в вопросе персональные данные.
- **Технические данные:** IP-адрес, браузер, открытая страница и время. Недолго хранятся в журналах сервера для работы и безопасности Портала и ограничения числа запросов.

## Cookie и хранилище браузера

| Название | Назначение | Срок |
|---|---|---|
| adda_id (cookie) | Сессия входа, подтверждённая по e-mail | 30 дней или до выхода |
| adda-a11y (хранилище браузера) | Размер шрифта и высокий контраст | До удаления |
| adda_session_id (хранилище браузера) | Случайный идентификатор, исключающий повторные реакции | До удаления |

Данные в хранилище браузера остаются только на вашем устройстве и удаляются в настройках браузера. Этот идентификатор не позволяет установить вашу личность.

## Цели обработки

- рассмотрение обращений и ответы на них в установленном законом порядке;
- организация регистрации на мероприятия и рассмотрение исправлений;
- отправка запрошенных вами уведомлений и материалов подписки;
- подготовка ответа на ваш вопрос на основе материалов Портала;
- обеспечение безопасности и бесперебойной работы Портала.

## Кому передаются данные

С вашими данными работают ответственные сотрудники соответствующего подразделения Академии. Для работы Портала используются следующие сервисы; они обрабатывают данные только по поручению Академии и только для оказания своей услуги:

- Vercel: хостинг Портала;
- Render: система управления содержимым;
- Neon: база данных;
- Cloudinary: изображения и файлы;
- Resend: отправка e-mail;
- Google (Gemini): ответы ИИ-помощника;
- служба уведомлений вашего браузера: доставка уведомлений.

Серверы этих сервисов могут находиться за пределами Азербайджана. В предусмотренных законом случаях данные могут быть предоставлены уполномоченным государственным органам. Академия не продаёт персональные данные и не передаёт их в рекламных целях.

## Материалы третьих лиц

- Видео загружается с YouTube (youtube-nocookie.com) только после нажатия кнопки воспроизведения; далее действуют правила Google.
- Некоторые изображения и значки загружаются с серверов Cloudinary, Unsplash и jsDelivr; эти сервисы видят ваш IP-адрес как часть обычного сетевого запроса.
- Кнопки «Поделиться» в социальных сетях являются обычными ссылками: пока вы на них не нажмёте, данные не передаются.

## Сроки хранения

- Обращения и ответы на них хранятся в течение срока, установленного законодательством.
- Одноразовые ссылки для входа действуют 15 минут, сессии 30 дней; просроченные ссылки удаляются автоматически.
- Регистрации на мероприятия и предложения исправлений хранятся столько, сколько нужно для достижения цели.
- Подписка на уведомления действует, пока вы её не отмените или браузер не признает её недействительной.

## Защита данных

Портал работает только по защищённому соединению (HTTPS). Доступ к данным ограничен ответственными сотрудниками, формы защищены от автоматических отправок.

## Ваши права

В соответствии с законодательством вы вправе:

- узнать, какие данные о вас обрабатываются, и ознакомиться с ними;
- потребовать исправления, блокирования или уничтожения неточных данных;
- отозвать согласие (например, отключить уведомления или отписаться от рассылки);
- обратиться в уполномоченный государственный орган или суд, если считаете, что ваши права нарушены.

Запрос можно отправить через [форму онлайн-обращения](${ASK}) или на info@adda.edu.az.

## Изменения политики

При изменении политики новый текст публикуется на этой странице, а дата «Последнее обновление» меняется.`;

const PRIVACY_PAGE: QebulPageSeed = {
  slug: PRIVACY_SLUG,
  dataBlock: 'yox',
  az: {
    title: 'Məxfilik siyasəti',
    lead: 'Akademiyanın rəsmi internet portalında hansı məlumatların toplandığı, nə üçün işləndiyi, kimlərlə paylaşıldığı və hüquqlarınızdan necə istifadə edə biləcəyiniz.',
    body: PRIVACY_AZ_BODY,
    seoDescription: 'ADDA portalının məxfilik siyasəti: hansı fərdi məlumatlar toplanır, necə qorunur, kimlərlə paylaşılır və hüquqlarınız.',
    facts: [
      { label: 'Son yenilənmə', value: UPDATED, icon: 'tarix' },
      { label: 'Hüquqi əsas', value: '«Fərdi məlumatlar haqqında» Qanun', icon: 'qoruma' },
    ],
    sideLinks: links('az', ['terms', 'ask', 'contact']),
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Privacy policy',
    lead: 'What information the official portal of the Academy collects, why it is processed, who it is shared with and how you can exercise your rights.',
    body: PRIVACY_EN_BODY,
    seoDescription: 'ADDA portal privacy policy: what personal data is collected, how it is protected, who it is shared with and your rights.',
    facts: [
      { label: 'Last updated', value: UPDATED, icon: 'tarix' },
      { label: 'Legal basis', value: 'Law “On Personal Data”', icon: 'qoruma' },
    ],
    sideLinks: links('en', ['terms', 'ask', 'contact']),
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Политика конфиденциальности',
    lead: 'Какие данные собирает официальный портал Академии, зачем они обрабатываются, кому передаются и как вы можете воспользоваться своими правами.',
    body: PRIVACY_RU_BODY,
    seoDescription: 'Политика конфиденциальности портала ADDA: какие персональные данные собираются, как они защищаются, кому передаются и ваши права.',
    facts: [
      { label: 'Последнее обновление', value: UPDATED, icon: 'tarix' },
      { label: 'Правовая основа', value: 'Закон «О персональных данных»', icon: 'qoruma' },
    ],
    sideLinks: links('ru', ['terms', 'ask', 'contact']),
    contact: CONTACT_RU,
  },
};

// ── 2. İstifadə şərtləri ─────────────────────────────────────────────────────
const TERMS_AZ_BODY = `Bu şərtlər «Azərbaycan Dövlət Dəniz Akademiyası» publik hüquqi şəxsinin (bundan sonra «Akademiya») rəsmi internet portalından (adda.edu.az, bundan sonra «Portal») istifadəni tənzimləyir. Portaldan istifadə etməklə bu şərtləri qəbul etmiş olursunuz.

## Portalın təyinatı

- Portal Akademiyanın fəaliyyəti, təhsil proqramları, qəbul, elm, tələbə həyatı və beynəlxalq əlaqələri barədə rəsmi məlumat mənbəyidir.
- Məlumatın dəqiq və aktual olmasına çalışırıq. Qəbul qaydaları, ödənişlər və tarixlər kimi məsələlərdə Akademiyanın əmr və qərarları, eləcə də aidiyyəti dövlət qurumlarının rəsmi sənədləri əsas götürülür.
- Səhv görsəniz, səhifədəki «Düzəliş təklif et» düyməsi ilə bildirin.

## Materiallardan istifadə

- Portaldakı mətnlər, fotolar, videolar, loqotip və dizayn elementləri Akademiyaya və ya digər hüquq sahiblərinə məxsusdur və Azərbaycan Respublikasının «Müəlliflik hüququ və əlaqəli hüquqlar haqqında» 5 iyun 1996-cı il tarixli, 115-IQ nömrəli Qanunu ilə qorunur.
- Xəbər və elanlardan mənasını dəyişmədən, mənbəyə istinad etməklə («Azərbaycan Dövlət Dəniz Akademiyası, adda.edu.az») və aktiv keçid verməklə istifadə etmək olar.
- Materialların kommersiya məqsədilə istifadəsi, dəyişdirilərək yayılması, loqotip və korporativ üslub elementlərindən Akademiyanın razılığı olmadan istifadə qadağandır. Rəsmi fayllar [Korporativ üslub](/sehife/${CORP_SLUG}) səhifəsindədir.
- Tərəfdaş qurumların loqoları və digər üçüncü tərəf materialları öz sahiblərinə məxsusdur.

## Formalar və müraciətlər

- Formalarda düzgün və tam məlumat yazın; başqasının adından müraciət etməyin.
- Qanuna zidd, təhqiramiz, reklam xarakterli mətn və zərərli fayl göndərmək qadağandır.
- Müraciətlərə «Vətəndaşların müraciətləri haqqında» Qanunla müəyyən edilmiş qaydada və müddətdə baxılır.
- Məlumatlarınızın necə işləndiyi [Məxfilik siyasəti](/sehife/${PRIVACY_SLUG}) səhifəsində yazılıb.

## AI köməkçi (kopilot)

- Kopilotun cavabları süni intellekt tərəfindən Portalın məzmunu əsasında hazırlanır və mənbə səhifələrə keçidlə verilir.
- Cavablarda səhv ola bilər: qərar verməzdən əvvəl mənbə səhifəni yoxlayın. Cavab Akademiyanın rəsmi mövqeyi və ya qərarı deyil.
- Suala fərdi məlumat yazmayın.

## Xarici keçidlər

Portalda digər saytlara keçidlər var (dövlət qurumları, tərəfdaşlar, sosial şəbəkələr). Akademiya həmin saytların məzmununa və məxfilik qaydalarına görə məsuliyyət daşımır.

## Təhlükəsizlik

Portalın işini pozmaq, təhlükəsizlik tədbirlərindən yan keçmək, başqasının hesabından istifadə etmək və avtomatlaşdırılmış vasitələrlə Portala həddindən artıq sorğu göndərmək qadağandır.

## Məsuliyyətin məhdudlaşdırılması

Portal «olduğu kimi» təqdim olunur. Texniki işlər və ya kənar səbəblərlə fasilələr ola bilər. Akademiya Portaldakı məlumatın istifadəsi nəticəsində yaranan dolayı zərərə görə məsuliyyət daşımır; rəsmi qərar üçün aidiyyəti struktur bölməyə müraciət edin.

## Tətbiq olunan hüquq və dəyişikliklər

- Bu şərtlər Azərbaycan Respublikasının qanunvericiliyi ilə tənzimlənir.
- Şərtlər dəyişdikdə yeni mətn bu səhifədə dərc olunur və «Son yenilənmə» tarixi dəyişir.`;

const TERMS_EN_BODY = `These terms govern the use of the official web portal (adda.edu.az, the “Portal”) of the Azerbaijan State Marine Academy public legal entity (the “Academy”). By using the Portal you accept these terms.

## Purpose of the Portal

- The Portal is the official source of information about the Academy’s activities, study programmes, admission, research, student life and international relations.
- We strive to keep the information accurate and up to date. On matters such as admission rules, fees and dates, the Academy’s orders and decisions and the official documents of the competent state bodies prevail.
- If you notice an error, report it with the “Suggest a correction” button on the page.

## Use of materials

- The texts, photos, videos, logo and design elements of the Portal belong to the Academy or to other right holders and are protected by the Law of the Republic of Azerbaijan “On Copyright and Related Rights” No. 115-IQ of 5 June 1996.
- News and announcements may be used without distortion, with attribution (“Azerbaijan State Marine Academy, adda.edu.az”) and an active link to the source.
- Commercial use, distribution of altered materials and use of the logo and corporate identity elements without the Academy’s consent are prohibited. The official files are on the [Corporate identity](/sehife/${CORP_SLUG}) page.
- Partner logos and other third-party materials belong to their owners.

## Forms and appeals

- Provide correct and complete information in forms; do not submit appeals on behalf of another person.
- Submitting unlawful, offensive or advertising content or malicious files is prohibited.
- Appeals are considered in the manner and within the time limits established by the Law “On Citizens’ Appeals”.
- How your data is processed is described in the [Privacy policy](/sehife/${PRIVACY_SLUG}).

## AI assistant (copilot)

- The copilot’s answers are generated by artificial intelligence from the Portal’s content and come with links to the source pages.
- Answers may contain errors: check the source page before making a decision. An answer is not an official position or decision of the Academy.
- Do not include personal data in your question.

## External links

The Portal contains links to other websites (state bodies, partners, social networks). The Academy is not responsible for the content or privacy practices of those websites.

## Security

It is prohibited to disrupt the Portal, circumvent its security measures, use another person’s account or send excessive requests to the Portal by automated means.

## Limitation of liability

The Portal is provided “as is”. Interruptions may occur because of maintenance or external causes. The Academy is not liable for indirect damage resulting from the use of information on the Portal; for an official decision, contact the relevant unit.

## Applicable law and changes

- These terms are governed by the legislation of the Republic of Azerbaijan.
- When the terms change, the new text is published on this page and the “Last updated” date changes.`;

const TERMS_RU_BODY = `Настоящие условия регулируют использование официального интернет-портала (adda.edu.az, далее «Портал») публичного юридического лица «Азербайджанская государственная морская академия» (далее «Академия»). Используя Портал, вы принимаете эти условия.

## Назначение Портала

- Портал является официальным источником информации о деятельности Академии, образовательных программах, приёме, науке, студенческой жизни и международных связях.
- Мы стремимся, чтобы информация была точной и актуальной. По вопросам правил приёма, оплаты и сроков приоритет имеют приказы и решения Академии и официальные документы уполномоченных государственных органов.
- Если вы заметили ошибку, сообщите о ней кнопкой «Предложить исправление» на странице.

## Использование материалов

- Тексты, фотографии, видео, логотип и элементы дизайна Портала принадлежат Академии или другим правообладателям и охраняются Законом Азербайджанской Республики «Об авторском праве и смежных правах» от 5 июня 1996 года № 115-IQ.
- Новости и объявления можно использовать без искажения смысла, со ссылкой на источник («Азербайджанская государственная морская академия, adda.edu.az») и активной ссылкой.
- Запрещаются коммерческое использование материалов, распространение изменённых материалов, а также использование логотипа и элементов фирменного стиля без согласия Академии. Официальные файлы размещены на странице [Фирменный стиль](/sehife/${CORP_SLUG}).
- Логотипы партнёров и другие материалы третьих лиц принадлежат их владельцам.

## Формы и обращения

- Указывайте в формах верные и полные сведения; не подавайте обращения от имени другого лица.
- Запрещается отправлять противоправные, оскорбительные и рекламные материалы, а также вредоносные файлы.
- Обращения рассматриваются в порядке и в сроки, установленные Законом «Об обращениях граждан».
- Как обрабатываются ваши данные, описано в [Политике конфиденциальности](/sehife/${PRIVACY_SLUG}).

## ИИ-помощник (копилот)

- Ответы копилота формируются искусственным интеллектом на основе материалов Портала и сопровождаются ссылками на исходные страницы.
- Ответы могут содержать ошибки: перед принятием решения проверьте исходную страницу. Ответ не является официальной позицией или решением Академии.
- Не указывайте в вопросе персональные данные.

## Внешние ссылки

На Портале есть ссылки на другие сайты (государственные органы, партнёры, социальные сети). Академия не отвечает за содержание этих сайтов и их правила конфиденциальности.

## Безопасность

Запрещается нарушать работу Портала, обходить меры защиты, использовать чужую учётную запись и направлять на Портал чрезмерное число запросов автоматическими средствами.

## Ограничение ответственности

Портал предоставляется «как есть». Возможны перерывы из-за технических работ или внешних причин. Академия не несёт ответственности за косвенный ущерб в результате использования информации Портала; за официальным решением обращайтесь в соответствующее подразделение.

## Применимое право и изменения

- Настоящие условия регулируются законодательством Азербайджанской Республики.
- При изменении условий новый текст публикуется на этой странице, а дата «Последнее обновление» меняется.`;

const TERMS_PAGE: QebulPageSeed = {
  slug: TERMS_SLUG,
  dataBlock: 'yox',
  az: {
    title: 'İstifadə şərtləri',
    lead: 'Portaldakı məlumatdan, materiallardan və onlayn xidmətlərdən istifadə qaydaları.',
    body: TERMS_AZ_BODY,
    seoDescription: 'ADDA portalının istifadə şərtləri: materiallardan, formalardan və AI köməkçidən istifadə, keçidlər, məsuliyyət və tətbiq olunan hüquq.',
    facts: [{ label: 'Son yenilənmə', value: UPDATED, icon: 'tarix' }],
    sideLinks: links('az', ['privacy', 'corp', 'ask']),
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Terms of use',
    lead: 'Rules for using the information, materials and online services of the Portal.',
    body: TERMS_EN_BODY,
    seoDescription: 'Terms of use of the ADDA portal: use of materials, forms and the AI assistant, links, liability and applicable law.',
    facts: [{ label: 'Last updated', value: UPDATED, icon: 'tarix' }],
    sideLinks: links('en', ['privacy', 'corp', 'ask']),
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Условия использования',
    lead: 'Правила использования информации, материалов и онлайн-сервисов Портала.',
    body: TERMS_RU_BODY,
    seoDescription: 'Условия использования портала ADDA: использование материалов, форм и ИИ-помощника, ссылки, ответственность и применимое право.',
    facts: [{ label: 'Последнее обновление', value: UPDATED, icon: 'tarix' }],
    sideLinks: links('ru', ['privacy', 'corp', 'ask']),
    contact: CONTACT_RU,
  },
};

export const LEGAL_PAGES: QebulPageSeed[] = [PRIVACY_PAGE, TERMS_PAGE];

// ── 3. Korporativ üslub ──────────────────────────────────────────────────────
/** Rəsmi fayllar (köhnə saytın «Korporativ üslub» səhifəsindən, adda.edu.az/az/content/32). */
export interface CorpFile {
  key: 'logo' | 'presentation' | 'png' | 'pdf' | 'cdr' | 'pptx';
  /** Köhnə saytdakı yol. */
  path: string;
  /** Media kitabxanasında ad (uzantısız). */
  name: string;
  alt: string;
  /** PPTX/CDR (legacy-files `documents`). */
  document?: boolean;
  /** Köhnə səhifədə artıq media kitabxanasında olan fayl — yenidən endirilmir
   * («img:N» — mətndəki N-ci şəkil, başqa dəyər — keçidin mətni). */
  reuse?: string;
  /** Köhnə saytdan alınmasa köhnə səhifədəki bu fayl işlədilir. */
  fallback?: string;
}

export const CORP_FILES: CorpFile[] = [
  { key: 'logo', path: '/uploads/korperativstil/New/logopng_new.png', name: 'adda-loqotip-onizleme', alt: 'Azərbaycan Dövlət Dəniz Akademiyasının loqotipi', reuse: 'img:2' },
  { key: 'presentation', path: '/uploads/korperativstil/presentation.jpg', name: 'adda-teqdimat-sablonu-onizleme', alt: 'Korporativ təqdimat şablonu', reuse: 'img:1' },
  { key: 'png', path: '/uploads/korperativstil/New/ADDA_New_Logo.png', name: 'adda-loqotip', alt: 'ADDA loqotipi (PNG)' },
  { key: 'pdf', path: '/uploads/korperativstil/New/ADDA_New_Logo.pdf', name: 'adda-loqotip-vektor', alt: 'ADDA loqotipi (PDF)', fallback: '.PDF' },
  { key: 'cdr', path: '/uploads/korperativstil/New/ADDA_New_Logo.cdr', name: 'adda-loqotip-coreldraw', alt: 'ADDA loqotipi (CDR)', document: true },
  { key: 'pptx', path: '/uploads/korperativstil/ADDA_PF.pptx', name: 'adda-teqdimat-sablonu', alt: 'ADDA korporativ təqdimat şablonu', document: true, reuse: 'Yüklə' },
];

const CORP_AZ_BODY = `Akademiyanı təmsil edən sənəd, təqdimat, poster və rəqəmsal materiallarda yalnız bu səhifədəki rəsmi fayllardan istifadə edin.

## Loqotip

![Azərbaycan Dövlət Dəniz Akademiyasının loqotipi]({{logo}})

- [Loqotip: PNG]({{png}}) (sənəd, təqdimat və veb üçün)
- [Loqotip: PDF]({{pdf}}) (vektor, çap üçün)
- [Loqotip: CDR]({{cdr}}) (CorelDRAW mənbə faylı)

**İstifadə qaydaları**

- Loqotipi yalnız rəsmi fayllardan götürün: ekran görüntüsündən kəsməyin və yenidən çəkməyin.
- Nisbətlərini dəyişməyin (dartmayın, sıxmayın), döndərməyin, rəngini, kölgəsini və effektlərini dəyişməyin.
- Ətrafında boş sahə saxlayın; loqotipi mətnin, fotonun qarışıq hissəsinin və ya başqa loqoların üstünə qoymayın.
- Çap üçün vektor fayllarından (PDF və ya CDR) istifadə edin.

## Təqdimat şablonu

![Korporativ təqdimat şablonu]({{presentation}})

[Korporativ təqdimat şablonu: PPTX]({{pptx}})

Akademiya adından çıxışlarda, konfrans və tədbirlərdə bu şablondan istifadə edin.`;

const CORP_EN_BODY = `Use only the official files on this page in documents, presentations, posters and digital materials representing the Academy.

## Logo

![Logo of the Azerbaijan State Marine Academy]({{logo}})

- [Logo: PNG]({{png}}) (for documents, presentations and the web)
- [Logo: PDF]({{pdf}}) (vector, for print)
- [Logo: CDR]({{cdr}}) (CorelDRAW source file)

**Usage rules**

- Take the logo only from the official files: do not crop it from screenshots or redraw it.
- Do not change its proportions (stretch or squeeze), rotate it, or change its colours, shadow or effects.
- Keep clear space around it; do not place the logo over text, busy parts of photos or other logos.
- For print, use the vector files (PDF or CDR).

## Presentation template

![Corporate presentation template]({{presentation}})

[Corporate presentation template: PPTX]({{pptx}})

Use this template for presentations on behalf of the Academy, at conferences and events.`;

const CORP_RU_BODY = `В документах, презентациях, плакатах и цифровых материалах, представляющих Академию, используйте только официальные файлы с этой страницы.

## Логотип

![Логотип Азербайджанской государственной морской академии]({{logo}})

- [Логотип: PNG]({{png}}) (для документов, презентаций и веба)
- [Логотип: PDF]({{pdf}}) (вектор, для печати)
- [Логотип: CDR]({{cdr}}) (исходный файл CorelDRAW)

**Правила использования**

- Берите логотип только из официальных файлов: не вырезайте его из снимков экрана и не перерисовывайте.
- Не меняйте пропорции (не растягивайте и не сжимайте), не поворачивайте, не меняйте цвета, тень и эффекты.
- Оставляйте вокруг логотипа свободное поле; не размещайте его поверх текста, пёстрых участков фото и других логотипов.
- Для печати используйте векторные файлы (PDF или CDR).

## Шаблон презентации

![Корпоративный шаблон презентации]({{presentation}})

[Корпоративный шаблон презентации: PPTX]({{pptx}})

Используйте этот шаблон в выступлениях от имени Академии, на конференциях и мероприятиях.`;

/** Şablon: `{{açar}}` → fayl ünvanı (legal-pages.ts → withCorpFiles). */
export const CORP_PAGE_TEMPLATE: QebulPageSeed = {
  slug: CORP_SLUG,
  dataBlock: 'korporativ',
  az: {
    title: 'Korporativ üslub',
    lead: 'Akademiyanın loqotipi, təqdimat şablonu, rəngləri və şriftləri: rəsmi sənəd, təqdimat və rəqəmsal materiallarda vahid görünüş üçün.',
    body: CORP_AZ_BODY,
    seoDescription: 'ADDA korporativ üslubu: rəsmi loqotip faylları (PNG, PDF, CDR), təqdimat şablonu, rənglər və şriftlər.',
    sideLinks: links('az', ['certs', 'terms', 'contact']),
    contact: `**Telefon:** ${ACADEMY_PHONE_AZ}, daxili 103\n\n**E-poçt:** info@adda.edu.az`,
  },
  en: {
    title: 'Corporate identity',
    lead: 'The Academy’s logo, presentation template, colours and typefaces: for a consistent look in official documents, presentations and digital materials.',
    body: CORP_EN_BODY,
    seoDescription: 'ADDA corporate identity: official logo files (PNG, PDF, CDR), presentation template, colours and typefaces.',
    sideLinks: links('en', ['certs', 'terms', 'contact']),
    contact: `**Phone:** ${ACADEMY_PHONE_INTL}, ext. 103\n\n**E-mail:** info@adda.edu.az`,
  },
  ru: {
    title: 'Фирменный стиль',
    lead: 'Логотип, шаблон презентации, цвета и шрифты Академии: для единого облика официальных документов, презентаций и цифровых материалов.',
    body: CORP_RU_BODY,
    seoDescription: 'Фирменный стиль ADDA: официальные файлы логотипа (PNG, PDF, CDR), шаблон презентации, цвета и шрифты.',
    sideLinks: links('ru', ['certs', 'terms', 'contact']),
    contact: `**Телефон:** ${ACADEMY_PHONE_INTL}, доб. 103\n\n**E-mail:** info@adda.edu.az`,
  },
};
