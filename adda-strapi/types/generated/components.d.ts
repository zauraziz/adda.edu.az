import type { Schema, Struct } from '@strapi/strapi';

export interface NavGroup extends Struct.ComponentSchema {
  collectionName: 'components_nav_groups';
  info: {
    displayName: 'Group';
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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'nav.group': NavGroup;
      'nav.link': NavLink;
    }
  }
}
