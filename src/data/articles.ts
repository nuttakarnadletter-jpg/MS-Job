import { SAMPLE_ITEMS } from "./content";
import type {
  ArticleBoxRecord,
  ArticleBoxSettings,
  ArticleLocale,
  ContentItem,
  LocalizedText,
} from "../types";

export function nowStamp() {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function t(copy: LocalizedText, locale: ArticleLocale) {
  return copy[locale] || copy.th || copy.en;
}

export const ARTICLE_ITEMS = SAMPLE_ITEMS.blog;

export const ARTICLE_CATEGORIES = [
  ...new Set(ARTICLE_ITEMS.map((item) => item.category).filter(Boolean)),
];

export function createDefaultArticleBoxSettings(
  name = "กล่องบทความใหม่",
): ArticleBoxSettings {
  return {
    name,
    sourceCategories: [],
    sort: "latest",
    showFilterTabs: false,
    showAllTab: true,
    filterCategories: [],
    layout: "grid",
    columns: 3,
    maxItems: 6,
    displayMode: "pagination",
    showCategoryBadge: true,
    showPublishedAt: true,
    showExcerpt: true,
    showCta: true,
    ctaStyle: "link",
    ctaLabel: { th: "อ่านต่อ", en: "Read more" },
    showHeader: true,
    headerTitle: { th: "บทความล่าสุด", en: "Latest articles" },
    headerDescription: {
      th: "อัปเดตข่าวสารและบทความที่น่าสนใจ",
      en: "Fresh updates, stories, and useful reads",
    },
    headerAlign: "left",
    showViewAll: true,
    viewAllLabel: { th: "ดูทั้งหมด", en: "View all" },
    viewAllLink: "",
    viewAllPosition: "headerRight",
  };
}

export const SAMPLE_ARTICLE_BOXES: ArticleBoxRecord[] = [
  {
    id: "ab-1",
    name: "บทความล่าสุด",
    createdAt: "2026-08-12 10:20",
    updatedAt: "2026-08-26 14:55",
    settings: createDefaultArticleBoxSettings("บทความล่าสุด"),
  },
  {
    id: "ab-2",
    name: "ข่าวสารหน้าแรก",
    createdAt: "2026-08-08 09:10",
    updatedAt: "2026-08-25 16:40",
    settings: {
      ...createDefaultArticleBoxSettings("ข่าวสารหน้าแรก"),
      showFilterTabs: true,
      columns: 3,
      maxItems: 6,
      displayMode: "pagination",
      showCategoryBadge: true,
      showExcerpt: true,
      headerTitle: { th: "ข่าวสารและบทความ", en: "News & articles" },
      headerDescription: {
        th: "อัปเดตความรู้และเรื่องราวจากทีมงาน",
        en: "Ideas and stories from the team",
      },
      headerAlign: "left",
      viewAllPosition: "headerRight",
    },
  },
  {
    id: "ab-3",
    name: "มุม SEO",
    createdAt: "2026-07-29 11:05",
    updatedAt: "2026-08-20 13:18",
    settings: {
      ...createDefaultArticleBoxSettings("มุม SEO"),
      sourceCategories: ["SEO"],
      layout: "list",
      columns: 3,
      maxItems: 4,
      displayMode: "pagination",
      showCategoryBadge: true,
      showExcerpt: true,
      ctaStyle: "button",
      headerTitle: { th: "อ่านเรื่อง SEO", en: "SEO notes" },
      headerAlign: "left",
      showViewAll: false,
    },
  },
];

function publishedTime(item: ContentItem) {
  return item.publishedAt ? Date.parse(item.publishedAt.replace(" ", "T")) : 0;
}

export function articlesForBox(
  settings: ArticleBoxSettings,
  items: ContentItem[] = ARTICLE_ITEMS,
) {
  const sourced = settings.sourceCategories.length > 0
    ? items.filter((item) => settings.sourceCategories.includes(item.category))
    : items.slice();

  sourced.sort((a, b) => {
    if (settings.sort === "title") return a.title.localeCompare(b.title, "th");
    const delta = publishedTime(b) - publishedTime(a);
    return settings.sort === "oldest" ? -delta : delta;
  });

  return sourced.slice(0, Math.max(1, settings.maxItems));
}

export function filterTabsForBox(
  settings: ArticleBoxSettings,
  items: ContentItem[],
) {
  if (settings.filterCategories.length > 0) return settings.filterCategories;
  return [...new Set(items.map((item) => item.category).filter(Boolean))];
}

export function formatArticleDate(value: string | undefined, locale: ArticleLocale) {
  if (!value) return "";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function displayLayoutLabel(settings: ArticleBoxSettings) {
  if (settings.layout === "list") return "รายการแนวนอน";
  if (settings.layout === "featured") return "เด่น + กริด";
  return `ตาราง ${settings.columns} คอลัมน์`;
}
