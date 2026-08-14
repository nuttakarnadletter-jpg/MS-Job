import type { ContentItem, ContentTypeConfig, FilterKey } from "../types";

export function searchPlaceholderFor(
  config: ContentTypeConfig,
  fieldIds: string[],
): string {
  const labels = fieldIds
    .map((id) => config.searchFields.find((field) => field.id === id)?.label)
    .filter((label): label is string => Boolean(label));
  if (labels.length === 0) return config.searchPlaceholder;
  return `ค้นหา${labels.join(", ")}...`;
}

function fieldValue(item: ContentItem, fieldId: string): string {
  switch (fieldId) {
    case "title":
      return item.title;
    case "description":
      return item.description;
    case "category":
      return item.category;
    case "location":
      return item.location;
    case "status":
      return item.status;
    case "sku":
      return item.sku ?? item.id;
    case "price":
      return item.priceLabel;
    default:
      return "";
  }
}

export function matchesSearch(
  item: ContentItem,
  query: string,
  fieldIds: string[],
): boolean {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return true;
  const fields = fieldIds.length > 0 ? fieldIds : ["title"];
  return fields.some((id) => fieldValue(item, id).toLowerCase().includes(keyword));
}

export function priceBounds(label: string): [number, number] | null {
  const nums = [...label.matchAll(/\d[\d,]*/g)]
    .map((match) => Number(match[0].replace(/,/g, "")))
    .filter((value) => value >= 1000);
  if (nums.length === 0) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

export function matchesPriceRange(
  item: ContentItem,
  min?: number,
  max?: number,
): boolean {
  if (min == null && max == null) return true;
  const bounds = priceBounds(item.priceLabel);
  if (!bounds) return false;
  const [low, high] = bounds;
  const floor = min ?? 0;
  const ceiling = max ?? Number.POSITIVE_INFINITY;
  return low <= ceiling && high >= floor;
}

export function publishedYear(value?: string): string {
  if (!value) return "";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) {
    return value.match(/^(\d{4})/)?.[1] ?? "";
  }
  return String(date.getFullYear());
}

export function matchesYear(item: ContentItem, year: string): boolean {
  if (!year) return true;
  return publishedYear(item.publishedAt) === year;
}

export const MAX_PRIMARY_FILTERS = 3;

function searchFieldLabel(
  config: ContentTypeConfig,
  id: string,
  fallback: string,
): string {
  return config.searchFields.find((field) => field.id === id)?.label ?? fallback;
}

export function availableFilters(
  config: ContentTypeConfig,
): { id: FilterKey; label: string }[] {
  const filters: { id: FilterKey; label: string }[] = [
    { id: "category", label: searchFieldLabel(config, "category", "หมวด") },
    { id: "location", label: searchFieldLabel(config, "location", "สถานที่") },
  ];
  if (config.priceRangeFilter) {
    filters.push({ id: "priceRange", label: config.priceRangeFilter.label });
  }
  filters.push({
    id: "status",
    label: searchFieldLabel(config, "status", "สถานะ"),
  });
  filters.push({ id: "year", label: "ปี" });
  return filters;
}

export function defaultPrimaryFilters(): FilterKey[] {
  return ["category", "location"];
}

export function defaultExtraFilters(config: ContentTypeConfig): FilterKey[] {
  return config.priceRangeFilter ? ["priceRange"] : [];
}

export function sanitizeFilterKeys(
  keys: FilterKey[] | undefined,
  config: ContentTypeConfig,
): FilterKey[] {
  const allowed = new Set(availableFilters(config).map((filter) => filter.id));
  return (keys ?? []).filter((key) => allowed.has(key));
}

export function listingQueryString(values: {
  q?: string;
  category?: string;
  location?: string;
  priceRange?: string;
  status?: string;
  year?: string;
}): string {
  const params = new URLSearchParams();
  if (values.q?.trim()) params.set("q", values.q.trim());
  if (values.category) params.set("category", values.category);
  if (values.location) params.set("location", values.location);
  if (values.priceRange && values.priceRange !== "all") {
    params.set("price", values.priceRange);
  }
  if (values.status) params.set("status", values.status);
  if (values.year) params.set("year", values.year);
  const query = params.toString();
  return query ? `?${query}` : "";
}
