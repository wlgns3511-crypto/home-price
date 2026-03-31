export interface SiteConfig {
  name: string;
  domain: string;
  description: string;
  colors: { primary: string; accent: string };
  lang: string;
  locale: string;
  entity: {
    slug: string;
    label: string;
    labelSingular: string;
    dbPath: string;
    tableName: string;
    slugColumn: string;
    nameColumn: string;
    categoryColumn: string | null;
  };
  gaId: string;
  adsenseId: string;
  sameAs: string[];
  dataSource: {
    name: string;
    url: string;
    year: number;
  };
}

export interface Entity {
  slug: string;
  name: string;
  category: string | null;
  [key: string]: unknown;
}
