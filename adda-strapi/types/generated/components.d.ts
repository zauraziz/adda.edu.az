import type { Schema, Struct } from '@strapi/strapi';

export interface EventSpeaker extends Struct.ComponentSchema {
  collectionName: 'components_event_speakers';
  info: {
    displayName: 'M\u0259ruz\u0259\u00E7i';
    icon: 'user';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    org: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images'>;
    role: Schema.Attribute.String;
  };
}

export interface FacilityInventory extends Struct.ComponentSchema {
  collectionName: 'components_facility_inventories';
  info: {
    description: 'Auditoriya/laboratoriyan\u0131n avadanl\u0131q siyah\u0131s\u0131nda bir s\u0259tir (F5.34).';
    displayName: 'Inventar';
    icon: 'archive';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    note: Schema.Attribute.String;
    quantity: Schema.Attribute.Integer;
  };
}

export interface HeroHonor extends Struct.ComponentSchema {
  collectionName: 'components_hero_honors';
  info: {
    description: 'Q\u0259hr\u0259man\u0131n ald\u0131\u011F\u0131 f\u0259xri ad/m\u00FCkafat (F5.21a).';
    displayName: 'T\u0259ltif';
    icon: 'medal';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavCategory extends Struct.ComponentSchema {
  collectionName: 'components_nav_categorys';
  info: {
    displayName: '\u018Fsas menyu kateqoriyas\u0131';
    icon: 'apps';
  };
  attributes: {
    groups: Schema.Attribute.Component<'nav.group', true>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    url: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#'>;
  };
}

export interface NavFootercol extends Struct.ComponentSchema {
  collectionName: 'components_nav_footercols';
  info: {
    displayName: 'Footer s\u00FCtunu';
    icon: 'layoutColumns';
  };
  attributes: {
    links: Schema.Attribute.Component<'nav.link', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavGroup extends Struct.ComponentSchema {
  collectionName: 'components_nav_groups';
  info: {
    displayName: 'Qrup';
    icon: 'bulletList';
  };
  attributes: {
    links: Schema.Attribute.Component<'nav.link', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavLink extends Struct.ComponentSchema {
  collectionName: 'components_nav_links';
  info: {
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#'>;
  };
}

export interface NavPortal extends Struct.ComponentSchema {
  collectionName: 'components_nav_portals';
  info: {
    displayName: 'E-Akademiya paneli';
    icon: 'dashboard';
  };
  attributes: {
    cards: Schema.Attribute.Component<'nav.portalcard', true>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface NavPortalcard extends Struct.ComponentSchema {
  collectionName: 'components_nav_portalcards';
  info: {
    displayName: 'Panel kart\u0131';
    icon: 'layoutGrid';
  };
  attributes: {
    description: Schema.Attribute.String;
    icon: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#'>;
  };
}

export interface NavQuicklink extends Struct.ComponentSchema {
  collectionName: 'components_nav_quicklinks';
  info: {
    displayName: 'S\u00FCr\u0259tli ke\u00E7id';
    icon: 'bolt';
  };
  attributes: {
    icon: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#'>;
  };
}

export interface PageFact extends Struct.ComponentSchema {
  collectionName: 'components_page_facts';
  info: {
    description: 'F5.45 \u2014 s\u0259hif\u0259nin ba\u015Fl\u0131\u011F\u0131 alt\u0131ndak\u0131 fakt zola\u011F\u0131: etiket + d\u0259y\u0259r (m\u0259s. \u00ABT\u0259hsil m\u00FCdd\u0259ti\u00BB \u2014 \u00AB4 il\u00BB).';
    displayName: 'Fakt';
    icon: 'star';
  };
  attributes: {
    icon: Schema.Attribute.Enumeration<
      [
        'tarix',
        'muddet',
        'yer',
        'haqq',
        'bal',
        'dil',
        'forma',
        'sened',
        'imtahan',
        'diplom',
        'unvan',
        'telefon',
        'qrup',
        'bina',
        'qoruma',
        'diger',
      ]
    > &
      Schema.Attribute.DefaultTo<'diger'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageStep extends Struct.ComponentSchema {
  collectionName: 'components_page_steps';
  info: {
    description: 'F5.45 \u2014 q\u0259bul trayektoriyas\u0131n\u0131n bir add\u0131m\u0131: n\u0259, n\u0259 vaxt, harada. \u00ABTrayektoriya\u00BB doldurulsa add\u0131mlar qruplara b\u00F6l\u00FCn\u00FCr (m\u0259s. \u00AB9 illik baza\u00BB).';
    displayName: 'Trayektoriya add\u0131m\u0131';
    icon: 'bulletList';
  };
  attributes: {
    body: Schema.Attribute.Text;
    linkLabel: Schema.Attribute.String;
    linkUrl: Schema.Attribute.String;
    period: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    track: Schema.Attribute.String;
    who: Schema.Attribute.String;
  };
}

export interface ProgramAdmissionScore extends Struct.ComponentSchema {
  collectionName: 'components_program_admission_scores';
  info: {
    description: 'Bir il \u00FC\u00E7\u00FCn q\u0259bul bal\u0131 - \u00F6d\u0259ni\u015Fli/\u00F6d\u0259ni\u015Fsiz (F5.18b).';
    displayName: 'Q\u0259bul bal\u0131';
    icon: 'chart-bar';
  };
  attributes: {
    minScoreFree: Schema.Attribute.Decimal;
    minScorePaid: Schema.Attribute.Decimal;
    year: Schema.Attribute.Integer & Schema.Attribute.Required;
  };
}

export interface ProgramAdmissionSeats extends Struct.ComponentSchema {
  collectionName: 'components_program_admission_seats';
  info: {
    description: 'Bir t\u0259dris ili \u00FC\u00E7\u00FCn q\u0259bul yeri say\u0131 (F5.24a). `admissionScores`-dan (bal tarix\u00E7\u0259si, t\u0259krarlanan) F\u018FRQL\u0130 m\u0259qs\u0259d \u2014 burada YALNIZ CAR\u0130 ilin yer b\u00F6lg\u00FCs\u00FC var, t\u0259krarlanm\u0131r.';
    displayName: 'Q\u0259bul yerl\u0259ri';
    icon: 'users';
  };
  attributes: {
    azFullTime: Schema.Attribute.Integer;
    azPartTime: Schema.Attribute.Integer;
    enFullTime: Schema.Attribute.Integer;
    paid: Schema.Attribute.Integer;
    ruFullTime: Schema.Attribute.Integer;
    stateFunded: Schema.Attribute.Integer;
    total: Schema.Attribute.Integer;
    year: Schema.Attribute.Integer;
  };
}

export interface ProgramCourse extends Struct.ComponentSchema {
  collectionName: 'components_program_courses';
  info: {
    description: 'T\u0259dris plan\u0131 s\u0259tri \u2014 bir f\u0259nn (F5.1).';
    displayName: 'F\u0259nn';
    icon: 'book';
  };
  attributes: {
    auditHours: Schema.Attribute.Integer;
    code: Schema.Attribute.String;
    corequisite: Schema.Attribute.String;
    credits: Schema.Attribute.Integer;
    groupCode: Schema.Attribute.String;
    isPractice: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    prerequisite: Schema.Attribute.String;
    selfStudyHours: Schema.Attribute.Integer;
    semester: Schema.Attribute.String;
    totalHours: Schema.Attribute.Integer;
    weeklyLoad: Schema.Attribute.String;
  };
}

export interface ProgramHighlight extends Struct.ComponentSchema {
  collectionName: 'components_program_highlights';
  info: {
    description: '\u0130xtisas s\u0259hif\u0259sinin fakt zola\u011F\u0131na \u0259lav\u0259 olunan q\u0131sa d\u0259y\u0259r+etiket c\u00FCt\u00FC (F5.26a) \u2014 m\u0259s. value:"STCW-78", label:"Beyn\u0259lxalq standart".';
    displayName: 'Se\u00E7ilmi\u015F fakt';
    icon: 'star';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProgramLanguage extends Struct.ComponentSchema {
  collectionName: 'components_program_languages';
  info: {
    description: 'Proqram\u0131n t\u0259dris dili (F5.18b).';
    displayName: 'T\u0259dris dili';
    icon: 'globe';
  };
  attributes: {
    code: Schema.Attribute.Enumeration<['az', 'ru', 'en']> &
      Schema.Attribute.Required;
  };
}

export interface StaffEducation extends Struct.ComponentSchema {
  collectionName: 'components_staff_educations';
  info: {
    displayName: 'T\u0259hsil';
    icon: 'manyToOne';
  };
  attributes: {
    institution: Schema.Attribute.String & Schema.Attribute.Required;
    period: Schema.Attribute.String & Schema.Attribute.Required;
    qualification: Schema.Attribute.String;
    sortYear: Schema.Attribute.Integer;
  };
}

export interface StaffExperience extends Struct.ComponentSchema {
  collectionName: 'components_staff_experiences';
  info: {
    displayName: '\u0130\u015F t\u0259cr\u00FCb\u0259si';
    icon: 'briefcase';
  };
  attributes: {
    organization: Schema.Attribute.String & Schema.Attribute.Required;
    period: Schema.Attribute.String & Schema.Attribute.Required;
    position: Schema.Attribute.String;
    sortYear: Schema.Attribute.Integer;
  };
}

export interface StaffLanguage extends Struct.ComponentSchema {
  collectionName: 'components_staff_languages';
  info: {
    displayName: 'Dil bilikl\u0259ri';
    icon: 'earth';
  };
  attributes: {
    lang: Schema.Attribute.Enumeration<['az', 'tr', 'en', 'ru', 'diger']> &
      Schema.Attribute.Required;
    level: Schema.Attribute.String;
  };
}

export interface StaffPublication extends Struct.ComponentSchema {
  collectionName: 'components_staff_publications';
  info: {
    displayName: 'N\u0259\u015Fr';
    icon: 'book';
  };
  attributes: {
    source: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
    year: Schema.Attribute.Integer;
  };
}

export interface StaffRole extends Struct.ComponentSchema {
  collectionName: 'components_staff_roles';
  info: {
    description: 'Bir \u015F\u0259xsin bir v\u0259zif\u0259si. Bir adam\u0131n bird\u0259n \u00E7ox v\u0259zif\u0259si ola bil\u0259r (m\u0259s. dekan + professor).';
    displayName: 'V\u0259zif\u0259';
    icon: 'briefcase';
  };
  attributes: {
    position: Schema.Attribute.String & Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    staffType: Schema.Attribute.Enumeration<
      ['akademik', 'telimci_texniki', 'inzibati', 'rehberlik', 'diger']
    > &
      Schema.Attribute.Required;
    unitName: Schema.Attribute.String;
  };
}

export interface StaffScholar extends Struct.ComponentSchema {
  collectionName: 'components_staff_scholars';
  info: {
    displayName: 'Elmi identifikatorlar';
    icon: 'link';
  };
  attributes: {
    googleScholar: Schema.Attribute.String;
    orcid: Schema.Attribute.String;
    researcherId: Schema.Attribute.String;
    scopusAuthorId: Schema.Attribute.String;
    spin: Schema.Attribute.String;
  };
}

export interface StaffTag extends Struct.ComponentSchema {
  collectionName: 'components_staff_tags';
  info: {
    description: '\u0130xtisas v\u0259 t\u0259dqiqat sah\u0259si';
    displayName: 'Etiket';
    icon: 'priceTag';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface StaffVacancy extends Struct.ComponentSchema {
  collectionName: 'components_staff_vacancies';
  info: {
    description: '\u015Etatda m\u00F6vcud, haz\u0131rda tutulmam\u0131\u015F v\u0259zif\u0259.';
    displayName: 'Vakansiya';
    icon: 'userMinus';
  };
  attributes: {
    note: Schema.Attribute.String;
    position: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface UnitBlockSetting extends Struct.ComponentSchema {
  collectionName: 'components_unit_block_settings';
  info: {
    description: 'B\u00F6lm\u0259 s\u0259hif\u0259sind\u0259 standart blokun ba\u015Fl\u0131\u011F\u0131n\u0131 d\u0259yi\u015Fm\u0259k v\u0259 ya bloku gizl\u0259tm\u0259k (F5.43).';
    displayName: 'Blok ba\u015Fl\u0131\u011F\u0131';
    icon: 'pencil';
  };
  attributes: {
    block: Schema.Attribute.Enumeration<
      [
        'missiya',
        'haqqinda',
        'fealiyyet_sahesi',
        'xidmetler',
        'ixtisaslar',
        'gorulmus_isler',
        'strateji_hedefler',
        'foto_qalereya',
        'faydali_linkler',
        'vakansiyalar',
        'suallar',
        'xeberler',
        'alt_bolmeler',
        'heyet',
      ]
    > &
      Schema.Attribute.Required;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

export interface UnitExtraBlock extends Struct.ComponentSchema {
  collectionName: 'components_unit_extra_blocks';
  info: {
    description: 'Standart bloklara uy\u011Fun g\u0259lm\u0259y\u0259n m\u0259lumat: \u00F6z ba\u015Fl\u0131\u011F\u0131 v\u0259 m\u0259tni il\u0259 (F5.43).';
    displayName: '\u018Flav\u0259 blok';
    icon: 'plus';
  };
  attributes: {
    after: Schema.Attribute.Enumeration<
      [
        'basda',
        'missiya',
        'haqqinda',
        'fealiyyet_sahesi',
        'xidmetler',
        'ixtisaslar',
        'gorulmus_isler',
        'strateji_hedefler',
        'foto_qalereya',
        'faydali_linkler',
        'vakansiyalar',
        'suallar',
        'sonda',
      ]
    > &
      Schema.Attribute.DefaultTo<'sonda'>;
    body: Schema.Attribute.RichText;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

export interface UnitFaq extends Struct.ComponentSchema {
  collectionName: 'components_unit_faqs';
  info: {
    description: 'B\u00F6lm\u0259 s\u0259hif\u0259sind\u0259 tez-tez veril\u0259n sual + cavab.';
    displayName: 'FAQ';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface UnitReceptionSlot extends Struct.ComponentSchema {
  collectionName: 'components_unit_reception_slots';
  info: {
    description: 'Bir g\u00FCnl\u00FCk q\u0259bul vaxt aral\u0131\u011F\u0131 (F4.11).';
    displayName: 'Q\u0259bul saat\u0131';
    icon: 'clock';
  };
  attributes: {
    day: Schema.Attribute.Enumeration<
      [
        'bazar_ertesi',
        'cer\u015Fenbe_axsami',
        'cer\u015Fenbe',
        'cume_axsami',
        'cume',
        'senbe',
      ]
    > &
      Schema.Attribute.Required;
    note: Schema.Attribute.String;
    timeFrom: Schema.Attribute.Time;
    timeTo: Schema.Attribute.Time;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'event.speaker': EventSpeaker;
      'facility.inventory': FacilityInventory;
      'hero.honor': HeroHonor;
      'nav.category': NavCategory;
      'nav.footercol': NavFootercol;
      'nav.group': NavGroup;
      'nav.link': NavLink;
      'nav.portal': NavPortal;
      'nav.portalcard': NavPortalcard;
      'nav.quicklink': NavQuicklink;
      'page.fact': PageFact;
      'page.step': PageStep;
      'program.admission-score': ProgramAdmissionScore;
      'program.admission-seats': ProgramAdmissionSeats;
      'program.course': ProgramCourse;
      'program.highlight': ProgramHighlight;
      'program.language': ProgramLanguage;
      'staff.education': StaffEducation;
      'staff.experience': StaffExperience;
      'staff.language': StaffLanguage;
      'staff.publication': StaffPublication;
      'staff.role': StaffRole;
      'staff.scholar': StaffScholar;
      'staff.tag': StaffTag;
      'staff.vacancy': StaffVacancy;
      'unit.block-setting': UnitBlockSetting;
      'unit.extra-block': UnitExtraBlock;
      'unit.faq': UnitFaq;
      'unit.reception-slot': UnitReceptionSlot;
    }
  }
}
