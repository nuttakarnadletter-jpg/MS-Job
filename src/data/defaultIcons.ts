import departmentIcon from "../assets/icon-department.png";
import categoryIcon from "../assets/icon-category.png";
import salaryIcon from "../assets/icon-salary.png";
import locationIcon from "../assets/icon-location.png";
import dateIcon from "../assets/icon-date.png";
import languageIcon from "../assets/icon-language.png";
import fileSizeIcon from "../assets/icon-file-size.png";
import type { ContentTypeId, MetaSource } from "../types";

export const DEFAULT_META_ICONS = {
  department: departmentIcon,
  category: categoryIcon,
  salary: salaryIcon,
  location: locationIcon,
  date: dateIcon,
  language: languageIcon,
  fileSize: fileSizeIcon,
};

export function defaultCategoryIconSrc(contentType: ContentTypeId): string | undefined {
  if (contentType === "job") return DEFAULT_META_ICONS.department;
  return DEFAULT_META_ICONS.category;
}

export function defaultLocationIconSrc(contentType: ContentTypeId): string | undefined {
  if (contentType === "job") return DEFAULT_META_ICONS.location;
  if (contentType === "download") return DEFAULT_META_ICONS.language;
  return undefined;
}

export function defaultPriceIconSrc(source: MetaSource): string | undefined {
  if (source === "salary" || source === "price") return DEFAULT_META_ICONS.salary;
  if (source === "date") return DEFAULT_META_ICONS.date;
  if (source === "fileSize") return DEFAULT_META_ICONS.fileSize;
  return undefined;
}
