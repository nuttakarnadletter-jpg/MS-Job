export type ContentTypeId = "job" | "blog" | "product" | "download";

export type CardLayout = "top" | "horizontal" | "none";
export type PaginationType = "pagination" | "loadmore" | "none";
export type ListingView = "grid" | "list";
export type EmptyImageBehavior = "hide" | "default";
export type DevicePreview = "desktop" | "mobile";
export type SettingsTab = "listing" | "card" | "detail" | "seo";
export type PreviewMode = "listing" | "detail";
export type FilterKey = "category" | "location" | "priceRange" | "status" | "year";
export type BarStyle = "dark" | "card" | "ghost";
export type CtaStyle = "link" | "button" | "icon";
export type PricePlacement = "top" | "belowTitle";
export type ListMetaLayout = "inline" | "stack";
export type DetailCtaPosition = "bottom" | "topRight";
export type ClickAction = "detail" | "external" | "file";
export type MetaIconMode = "default" | "none" | "upload";

export interface MetaIconSetting {
  mode: MetaIconMode;
  src?: string;
}

export interface MobileSettings {
  hideHomeBar: boolean;
  hideExtraFilters: boolean;
  hideThumbnail: boolean;
  hideDescription: boolean;
  hideCategory: boolean;
  hideLocation: boolean;
  hidePrice: boolean;
  hideStatus: boolean;
  hideCta: boolean;
}

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
  coverImage?: string;
  sku?: string;
  publishedAt?: string;
  clickAction?: ClickAction;
  externalUrl?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  detailSections: {
    responsibilities?: string[];
    qualifications?: string[];
    benefits?: string[];
    body?: string;
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
  priceRangeFilter?: {
    label: string;
    options: { id: string; label: string; min?: number; max?: number }[];
  };
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
    primaryFilters: FilterKey[];
    extraFilters: FilterKey[];
    barButtonLabel: string;
    enableHomeBar: boolean;
    homeBarStyle: BarStyle;
    listingBarStyle: BarStyle;
    showResultCount: boolean;
    columns: 1 | 2 | 3;
    pagination: PaginationType;
    allowViewToggle: boolean;
    defaultView: ListingView;
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
    ctaStyle: CtaStyle;
    ctaLabel: string;
    ctaIcon: MetaIconSetting;
    categoryIcon: MetaIconSetting;
    locationIcon: MetaIconSetting;
    priceIcon: MetaIconSetting;
    pricePlacement: PricePlacement;
    listMetaLayout: ListMetaLayout;
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
    ctaPosition: DetailCtaPosition;
  };
  seo: {
    pageTitle: string;
    slug: string;
    metaDescription: string;
    indexable: boolean;
    published: boolean;
  };
  mobile: MobileSettings;
}
