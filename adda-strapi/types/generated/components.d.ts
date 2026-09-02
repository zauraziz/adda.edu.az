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
      'nav.category': NavCategory;
      'nav.footercol': NavFootercol;
      'nav.group': NavGroup;
      'nav.link': NavLink;
      'nav.portal': NavPortal;
      'nav.portalcard': NavPortalcard;
      'nav.quicklink': NavQuicklink;
      'program.course': ProgramCourse;
      'staff.education': StaffEducation;
      'staff.experience': StaffExperience;
      'staff.language': StaffLanguage;
      'staff.publication': StaffPublication;
      'staff.role': StaffRole;
      'staff.scholar': StaffScholar;
      'staff.tag': StaffTag;
      'staff.vacancy': StaffVacancy;
      'unit.faq': UnitFaq;
      'unit.reception-slot': UnitReceptionSlot;
    }
  }
}
