import type { Schema, Struct } from '@strapi/strapi';

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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'nav.category': NavCategory;
      'nav.footercol': NavFootercol;
      'nav.group': NavGroup;
      'nav.link': NavLink;
      'nav.portal': NavPortal;
      'nav.portalcard': NavPortalcard;
      'nav.quicklink': NavQuicklink;
    }
  }
}
