export type ContentTypeId = "job" | "blog" | "news" | "product" | "download";

export type CardLayout = "top" | "horizontal" | "none";
export type PaginationType = "pagination" | "loadmore" | "none";
export type EmptyImageBehavior = "placeholder" | "hide" | "default";
export type DevicePreview = "desktop" | "mobile";
export type SettingsTab = "listing" | "card" | "detail" | "seo";
export type PreviewMode = "listing" | "detail";

export type MetaSource =
  | "salary"
  | "price"
  | "sku"
  | "location"
  | "department"
  | "category"
  | "brand"
  | "author"
  | "fileSize"
  | "date";

export interface ContentItem {
  id: string;
  title: string;
  category: string;
  location: string;
  priceLabel: string;
  description: string;
  status: string;
  icon: string;
  imageColor: string;
  detailSections: {
    responsibilities?: string[];
    qualifications?: string[];
    benefits?: string[];
    body?: string[];
  };
}

export interface ContentTypeConfig {
  id: ContentTypeId;
  label: string;
  pageName: string;
  heroTitle: string;
  heroSubtitle: string;
  crumb: string;
  searchPlaceholder: string;
  resultLabel: (n: number) => string;
  ctaLabel: string;
  detailCta: string;
  categoryLabel: string;
  locationLabel: string;
  priceLabel: string;
  statusLabel: string;
  filterCategory: string;
  filterLocation: string;
  searchFields: { id: string; label: string; defaultOn: boolean }[];
  detailFields: { id: string; label: string; impact: string }[];
  primaryActions: string[];
  metaDefaults: { source: MetaSource; label: string }[];
}

export interface DisplaySettings {
  contentType: ContentTypeId;
  listing: {
    showSearch: boolean;
    searchPlaceholder: string;
    searchFields: string[];
    showFilters: boolean;
    showResultCount: boolean;
    columns: 1 | 2 | 3;
    pagination: PaginationType;
  };
  card: {
    layout: CardLayout;
    showThumbnail: boolean;
    emptyImage: EmptyImageBehavior;
    showTitle: boolean;
    showDescription: boolean;
    showCategory: boolean;
    showLocation: boolean;
    showPrice: boolean;
    showStatus: boolean;
    showCta: boolean;
    ctaLabel: string;
    meta1: { source: MetaSource; label: string };
    meta2: { source: MetaSource; label: string };
  };
  detail: {
    showPrice: boolean;
    showLocation: boolean;
    showCategory: boolean;
    showStatus: boolean;
    showResponsibilities: boolean;
    showQualifications: boolean;
    showBenefits: boolean;
    showBody: boolean;
    primaryAction: string;
  };
  seo: {
    pageTitle: string;
    slug: string;
    metaDescription: string;
    indexable: boolean;
    published: boolean;
  };
}
