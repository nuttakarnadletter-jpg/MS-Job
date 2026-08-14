import { useEffect, useMemo, useState } from "react";
import { CONTENT_TYPES } from "../data/content";
import {
  availableFilters,
  listingQueryString,
  matchesPriceRange,
  matchesSearch,
  searchHintFor,
} from "../data/search";
import type {
  BarStyle,
  ContentItem,
  ContentTypeConfig,
  ContentTypeId,
  DevicePreview,
  DisplaySettings,
  EmptyImageBehavior,
  FilterKey,
  ListingView,
  MetaIconSetting,
  MetaSource,
  MobileSettings,
  PreviewMode,
} from "../types";

const PAGE_SIZE = 3;

const DEFAULT_MOBILE: MobileSettings = {
  hideHomeBar: false,
  hideExtraFilters: false,
  hideThumbnail: false,
  hideDescription: false,
  hideCategory: false,
  hideLocation: false,
  hidePrice: false,
  hideStatus: false,
  hideCta: false,
};

function shownOn(
  desktopOn: boolean,
  hideOnMobile: boolean | undefined,
  isMobile: boolean,
) {
  return desktopOn && !(isMobile && hideOnMobile);
}

type PreviewSurface = "home" | "listing";

type FilterValues = {
  query: string;
  category: string;
  location: string;
  priceRangeId: string;
  status: string;
};

function formatPublishedAt(value?: string) {
  if (!value) return "";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    calendar: "gregory",
  }).format(date);
}

function metaValue(item: ContentItem, source: MetaSource): string {
  switch (source) {
    case "salary":
    case "price":
      return item.priceLabel;
    case "fileSize":
      return item.fileSize || item.priceLabel;
    case "date":
      return formatPublishedAt(item.publishedAt);
    case "department":
    case "category":
    case "brand":
      return item.category;
    case "location":
    case "author":
      return item.location;
    case "sku":
      return item.sku ?? item.id.toUpperCase();
    default:
      return item.category;
  }
}

function safeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function MetaGlyph({
  setting,
  fallback,
}: {
  setting?: MetaIconSetting;
  fallback: string;
}) {
  const mode = setting?.mode ?? "default";
  if (mode === "none") return null;
  if (mode === "upload") {
    if (!setting?.src) return null;
    return <img className="meta-icon-img" src={setting.src} alt="" />;
  }
  return <span className="meta-icon-fallback">{fallback}</span>;
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 4v11m0 0l-4-4m4 4l4-4M5 18h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CtaGlyph({
  setting,
  contentType,
  iconOnly,
}: {
  setting?: MetaIconSetting;
  contentType: ContentTypeId;
  iconOnly: boolean;
}) {
  const mode = setting?.mode ?? "default";
  if (mode === "upload") {
    if (!setting?.src) {
      return iconOnly ? (
        contentType === "download" ? (
          <DownloadIcon />
        ) : (
          <ChevronIcon />
        )
      ) : null;
    }
    return <img className="cta-icon-img" src={setting.src} alt="" />;
  }
  if (mode === "none" && !iconOnly) return null;
  if (mode === "default" && !iconOnly && contentType !== "download") return null;
  return contentType === "download" ? <DownloadIcon /> : <ChevronIcon />;
}

function mediaStyle(item: ContentItem) {
  if (item.coverImage) {
    return {
      backgroundImage: `url(${item.coverImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { background: item.imageColor };
}

const DEFAULT_COVER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="#EEF2F6"/>
      <rect x="340" y="208" width="120" height="84" rx="10" fill="none" stroke="#CBD5E1" stroke-width="6"/>
      <circle cx="376" cy="238" r="10" fill="#CBD5E1"/>
      <path d="M356 276l22-20 16 14 20-26 30 32H356z" fill="#CBD5E1"/>
    </svg>`,
  );

function resolveMedia(
  item: ContentItem,
  showSlot: boolean,
  emptyImage: EmptyImageBehavior | undefined,
): { style: { background?: string; backgroundImage?: string; backgroundSize?: string; backgroundPosition?: string }; icon?: string } | null {
  if (!showSlot) return null;
  if (item.coverImage) return { style: mediaStyle(item) };
  const empty = emptyImage ?? "placeholder";
  if (empty === "hide") return null;
  if (empty === "default") {
    return {
      style: {
        backgroundImage: `url("${DEFAULT_COVER}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
    };
  }
  return { style: { background: item.imageColor }, icon: item.icon };
}

function ItemCard({
  item,
  settings,
  config,
  onOpen,
  isMobile,
}: {
  item: ContentItem;
  settings: DisplaySettings;
  config: ContentTypeConfig;
  onOpen: () => void;
  isMobile: boolean;
}) {
  const { card } = settings;
  const mobile = settings.mobile ?? DEFAULT_MOBILE;
  const media = resolveMedia(
    item,
    shownOn(
      card.showThumbnail && card.layout !== "none",
      mobile.hideThumbnail,
      isMobile,
    ),
    card.emptyImage,
  );
  const showCategory = shownOn(card.showCategory, mobile.hideCategory, isMobile);
  const showLocation = shownOn(card.showLocation, mobile.hideLocation, isMobile);
  const showPrice = shownOn(card.showPrice, mobile.hidePrice, isMobile);
  const showDescription = shownOn(
    card.showDescription,
    mobile.hideDescription,
    isMobile,
  );
  const showStatus = shownOn(card.showStatus, mobile.hideStatus, isMobile);
  const showCta = shownOn(card.showCta, mobile.hideCta, isMobile);
  const ctaIconOnly = (card.ctaStyle ?? "link") === "icon";
  const ctaLabel = card.ctaLabel || config.ctaLabel;
  const ctaUploaded =
    card.ctaIcon?.mode === "upload" && Boolean(card.ctaIcon.src);
  const ctaGlyph = (
    <CtaGlyph
      setting={card.ctaIcon}
      contentType={settings.contentType}
      iconOnly={ctaIconOnly}
    />
  );

  const showMeta = showCategory || showLocation || showPrice;

  return (
    <article
      className={`item-card${media ? "" : " no-media"}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {media ? (
        <div className="thumb" style={media.style}>
          {media.icon ?? null}
        </div>
      ) : null}
      <div className="card-body">
        {card.showTitle ? <h3>{item.title}</h3> : null}
        {showMeta ? (
          <div className="meta">
            {showCategory ? (
              <span>
                <MetaGlyph setting={card.categoryIcon} fallback="▣" />
                {card.meta2.label}: {metaValue(item, card.meta2.source)}
              </span>
            ) : null}
            {showLocation ? (
              <span>
                <MetaGlyph setting={card.locationIcon} fallback="⌖" />
                {item.location}
              </span>
            ) : null}
            {showPrice ? (
              <span>
                <MetaGlyph setting={card.priceIcon} fallback="▱" />
                {card.meta1.label}: {metaValue(item, card.meta1.source)}
              </span>
            ) : null}
          </div>
        ) : null}
        {showDescription ? <div className="desc">{item.description}</div> : null}
        {showStatus ? <span className="badge">{item.status}</span> : null}
        {showCta ? (
          <button
            type="button"
            className={`cta cta-${card.ctaStyle ?? "link"}`}
            aria-label={card.ctaLabel || config.ctaLabel}
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
          >
            {ctaIconOnly ? (
              ctaGlyph
            ) : ctaUploaded ? (
              <>
                {ctaLabel}
                {ctaGlyph}
              </>
            ) : (
              <>
                {ctaGlyph}
                {ctaLabel}
              </>
            )}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function DetailCta({
  item,
  label,
  className,
}: {
  item: ContentItem;
  label: string;
  className?: string;
}) {
  const classes = className ? `detail-cta ${className}` : "detail-cta";
  if (item.fileUrl) {
    return (
      <a
        className={classes}
        href={item.fileUrl}
        download={item.fileName || item.title}
      >
        {label}
      </a>
    );
  }
  return (
    <button type="button" className={classes}>
      {label}
    </button>
  );
}

function DetailView({
  item,
  settings,
  config,
  onBack,
}: {
  item: ContentItem;
  settings: DisplaySettings;
  config: ContentTypeConfig;
  onBack: () => void;
}) {
  const { detail, card } = settings;
  const media = resolveMedia(
    item,
    card.showThumbnail && card.layout !== "none",
    card.emptyImage,
  );
  const ctaLabel = detail.primaryAction || config.detailCta;
  const ctaTopRight =
    settings.contentType === "job" &&
    (detail.ctaPosition ?? "bottom") === "topRight";
  const statusBadge = detail.showStatus ? (
    <span className="badge">{item.status}</span>
  ) : null;
  const hasMeta =
    detail.showCategory ||
    detail.showLocation ||
    detail.showPrice ||
    (!ctaTopRight && detail.showStatus);
  const meta = hasMeta ? (
    <div className="detail-meta">
      {detail.showCategory ? (
        <span>
          <MetaGlyph setting={card.categoryIcon} fallback="▣" />
          {item.category}
        </span>
      ) : null}
      {detail.showLocation ? (
        <span>
          <MetaGlyph setting={card.locationIcon} fallback="⌖" />
          {item.location}
        </span>
      ) : null}
      {detail.showPrice ? (
        <span>
          <MetaGlyph setting={card.priceIcon} fallback="▱" />
          {metaValue(item, card.meta1.source)}
        </span>
      ) : null}
      {ctaTopRight ? null : statusBadge}
    </div>
  ) : null;

  return (
    <div className="detail-page">
      <button type="button" className="detail-back" onClick={onBack}>
        ← กลับไปหน้า Listing
      </button>
      {media ? (
        <div className="detail-hero-media" style={media.style}>
          {media.icon ?? null}
        </div>
      ) : null}
      {ctaTopRight ? (
        <>
          <div className="detail-header">
            <div className="detail-header-copy">
              <div className="detail-title-row">
                <h1>{item.title}</h1>
                {statusBadge}
              </div>
              {meta}
            </div>
            <DetailCta item={item} label={ctaLabel} />
          </div>
          <hr className="detail-header-rule" />
        </>
      ) : (
        <>
          <h1>{item.title}</h1>
          {meta}
        </>
      )}
      <p style={{ color: "#667085", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
        {item.description}
      </p>

      {detail.showResponsibilities && item.detailSections.responsibilities ? (
        <div className="detail-section">
          <h3>Responsibilities</h3>
          <ul>
            {item.detailSections.responsibilities.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {detail.showQualifications && item.detailSections.qualifications ? (
        <div className="detail-section">
          <h3>Qualifications</h3>
          <ul>
            {item.detailSections.qualifications.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {detail.showBenefits && item.detailSections.benefits ? (
        <div className="detail-section">
          <h3>Benefits</h3>
          <ul>
            {item.detailSections.benefits.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {detail.showBody && item.detailSections.body ? (
        <div className="detail-section">
          <h3>รายละเอียด</h3>
          <div
            className="article-body"
            dangerouslySetInnerHTML={{
              __html: safeHtml(item.detailSections.body),
            }}
          />
        </div>
      ) : null}

      {ctaTopRight ? null : <DetailCta item={item} label={ctaLabel} />}
    </div>
  );
}

function FileDownloadView({
  item,
  onBack,
}: {
  item: ContentItem;
  onBack: () => void;
}) {
  return (
    <div className="detail-page outbound-page">
      <button type="button" className="detail-back" onClick={onBack}>
        ← กลับไปหน้า Listing
      </button>
      <div className="outbound-card file-card">
        <div className="home-kicker">ดาวน์โหลดไฟล์</div>
        <h1>{item.fileName || item.title}</h1>
        <p>
          {item.fileSize ? `${item.fileSize} · ` : ""}
          ไฟล์ที่แนบในรายการนี้ ไม่ใช่ลิงก์ออกไปเว็บอื่น
        </p>
        {item.fileUrl ? (
          <a href={item.fileUrl} download={item.fileName || item.title}>
            บันทึกไฟล์
          </a>
        ) : (
          <p className="file-missing">อัปโหลดไฟล์ใน Item แล้วปุ่มบันทึกจะโหลดไฟล์จริงได้</p>
        )}
      </div>
    </div>
  );
}

function OutboundView({ url, onBack }: { url: string; onBack: () => void }) {
  return (
    <div className="detail-page outbound-page">
      <button type="button" className="detail-back" onClick={onBack}>
        ← กลับไปหน้า Listing
      </button>
      <div className="outbound-card">
        <div className="home-kicker">ลิงก์ภายนอก</div>
        <h1>รายการนี้เปิดออกไปที่อื่น</h1>
        <p>ไม่ได้เข้าหน้ารายละเอียดในโมดูลนี้ ปลายทางคือลิงก์ที่ตั้งไว้ใน Item</p>
        <a href={url} target="_blank" rel="noreferrer">
          {url}
        </a>
      </div>
    </div>
  );
}

function filterLabel(
  key: FilterKey,
  filters: { id: FilterKey; label: string }[],
): string {
  return filters.find((filter) => filter.id === key)?.label ?? key;
}

function FinderSelect({
  filterKey,
  config,
  values,
  categories,
  locations,
  statuses,
  onChange,
}: {
  filterKey: FilterKey;
  config: ContentTypeConfig;
  values: FilterValues;
  categories: string[];
  locations: string[];
  statuses: string[];
  onChange: (partial: Partial<FilterValues>) => void;
}) {
  if (filterKey === "category") {
    return (
      <select
        value={values.category}
        onChange={(event) => onChange({ category: event.target.value })}
      >
        <option value="">{config.filterCategory}</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    );
  }
  if (filterKey === "location") {
    return (
      <select
        value={values.location}
        onChange={(event) => onChange({ location: event.target.value })}
      >
        <option value="">{config.filterLocation}</option>
        {locations.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>
    );
  }
  if (filterKey === "priceRange" && config.priceRangeFilter) {
    return (
      <select
        value={values.priceRangeId}
        onChange={(event) => onChange({ priceRangeId: event.target.value })}
      >
        {config.priceRangeFilter.options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  if (filterKey === "status") {
    return (
      <select
        value={values.status}
        onChange={(event) => onChange({ status: event.target.value })}
      >
        <option value="">สถานะทั้งหมด</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    );
  }
  return null;
}

function FinderBar({
  barStyle,
  onDark,
  listing,
  config,
  values,
  categories,
  locations,
  statuses,
  onChange,
  onSubmit,
}: {
  barStyle: BarStyle;
  onDark?: boolean;
  listing: DisplaySettings["listing"];
  config: ContentTypeConfig;
  values: FilterValues;
  categories: string[];
  locations: string[];
  statuses: string[];
  onChange: (partial: Partial<FilterValues>) => void;
  onSubmit: () => void;
}) {
  const filters = availableFilters(config);
  const hasBar = listing.showSearch || listing.primaryFilters.length > 0;

  if (!hasBar) {
    return (
      <div className="empty-results">
        ยังไม่ได้เปิดช่องค้นหาหรือตัวกรองบนบาร์หลัก
      </div>
    );
  }

  return (
    <form
      className={`finder-bar style-${barStyle}${onDark ? " on-dark" : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {listing.showSearch ? (
        <label className="finder-field finder-search">
          <span>ค้นหา</span>
          <input
            value={values.query}
            placeholder={listing.searchPlaceholder}
            onChange={(event) => onChange({ query: event.target.value })}
          />
        </label>
      ) : null}
      {listing.primaryFilters.map((key) => (
        <label className="finder-field" key={key}>
          <span>{filterLabel(key, filters)}</span>
          <FinderSelect
            filterKey={key}
            config={config}
            values={values}
            categories={categories}
            locations={locations}
            statuses={statuses}
            onChange={onChange}
          />
        </label>
      ))}
      <button type="submit" className="finder-submit">
        {listing.barButtonLabel || "ค้นหา"}
      </button>
    </form>
  );
}

export function LivePreview({
  settings,
  items,
  device,
  mode,
  selectedId,
  toolbarLabel,
  heroTitle,
  heroSubtitle,
  onDeviceChange,
  onModeChange,
  onSelect,
}: {
  settings: DisplaySettings;
  items: ContentItem[];
  device: DevicePreview;
  mode: PreviewMode;
  selectedId: string | null;
  toolbarLabel?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  onDeviceChange: (device: DevicePreview) => void;
  onModeChange: (mode: PreviewMode) => void;
  onSelect: (id: string | null) => void;
}) {
  const config = CONTENT_TYPES[settings.contentType];
  const selected = items.find((i) => i.id === selectedId) ?? items[0];
  const listing = settings.listing;
  const [surface, setSurface] = useState<PreviewSurface>("listing");
  const [extraOpen, setExtraOpen] = useState(false);
  const [outboundUrl, setOutboundUrl] = useState<string | null>(null);
  const [downloadItem, setDownloadItem] = useState<ContentItem | null>(null);
  const [visitorView, setVisitorView] = useState<ListingView>(
    listing.defaultView ?? "grid",
  );
  const [page, setPage] = useState(1);
  const [values, setValues] = useState<FilterValues>({
    query: "",
    category: "",
    location: "",
    priceRangeId: "all",
    status: "",
  });

  const patchValues = (partial: Partial<FilterValues>) =>
    setValues((current) => ({ ...current, ...partial }));

  useEffect(() => {
    setValues({
      query: "",
      category: "",
      location: "",
      priceRangeId: "all",
      status: "",
    });
    setExtraOpen(false);
    setOutboundUrl(null);
    setDownloadItem(null);
    setPage(1);
  }, [settings.contentType]);

  useEffect(() => {
    setVisitorView(listing.defaultView ?? "grid");
  }, [settings.contentType, listing.defaultView]);

  useEffect(() => {
    if (mode === "detail") {
      setOutboundUrl(null);
      setDownloadItem(null);
    }
  }, [mode]);

  useEffect(() => {
    setSurface(listing.enableHomeBar ? "home" : "listing");
  }, [listing.enableHomeBar]);

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))],
    [items],
  );
  const locations = useMemo(
    () => [...new Set(items.map((item) => item.location))],
    [items],
  );
  const statuses = useMemo(
    () => [...new Set(items.map((item) => item.status))],
    [items],
  );
  const activeFilterKeys = new Set([
    ...listing.primaryFilters,
    ...listing.extraFilters,
  ]);
  const priceRange = config.priceRangeFilter?.options.find(
    (option) => option.id === values.priceRangeId,
  );
  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (!matchesSearch(item, values.query, listing.searchFields)) return false;
        if (
          activeFilterKeys.has("category") &&
          values.category &&
          item.category !== values.category
        ) {
          return false;
        }
        if (
          activeFilterKeys.has("location") &&
          values.location &&
          item.location !== values.location
        ) {
          return false;
        }
        if (
          activeFilterKeys.has("status") &&
          values.status &&
          item.status !== values.status
        ) {
          return false;
        }
        if (
          activeFilterKeys.has("priceRange") &&
          priceRange &&
          priceRange.id !== "all" &&
          !matchesPriceRange(item, priceRange.min, priceRange.max)
        ) {
          return false;
        }
        return true;
      }),
    [
      items,
      values,
      listing.searchFields,
      listing.primaryFilters,
      listing.extraFilters,
      priceRange,
    ],
  );
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE));
  const pagedItems =
    listing.pagination === "none"
      ? visibleItems
      : listing.pagination === "loadmore"
        ? visibleItems.slice(0, page * PAGE_SIZE)
        : visibleItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasMore =
    listing.pagination === "loadmore" && pagedItems.length < visibleItems.length;

  useEffect(() => {
    setPage(1);
  }, [
    values.query,
    values.category,
    values.location,
    values.priceRangeId,
    values.status,
    listing.pagination,
  ]);

  useEffect(() => {
    if (listing.pagination === "pagination") {
      setPage((current) => Math.min(current, totalPages));
    }
  }, [listing.pagination, totalPages]);

  const searchHint = searchHintFor(config, listing.searchFields);
  const extraFilters = availableFilters(config).filter((filter) =>
    listing.extraFilters.includes(filter.id),
  );
  const isMobile = device === "mobile";
  const useListView =
    !isMobile &&
    Boolean(listing.allowViewToggle) &&
    visitorView === "list";
  const colsClass = isMobile || useListView ? "cols-1" : `cols-${listing.columns}`;
  const useHorizontal = useListView
    ? settings.card.showThumbnail && settings.card.layout !== "none"
    : settings.card.layout === "horizontal";
  const mobile = settings.mobile ?? DEFAULT_MOBILE;
  const showHomeBar = shownOn(
    listing.enableHomeBar,
    mobile.hideHomeBar,
    isMobile,
  );
  const showExtraFilterBar =
    extraFilters.length > 0 && !(isMobile && mobile.hideExtraFilters);
  const queryString = listingQueryString({
    q: values.query,
    category: activeFilterKeys.has("category") ? values.category : "",
    location: activeFilterKeys.has("location") ? values.location : "",
    priceRange: activeFilterKeys.has("priceRange") ? values.priceRangeId : "all",
    status: activeFilterKeys.has("status") ? values.status : "",
  });
  const previewUrl = outboundUrl
    ? outboundUrl.replace(/^https?:\/\//, "")
    : downloadItem
      ? `readyplanet.com/download/${downloadItem.fileName || downloadItem.id}`
      : mode === "detail" && selected
      ? `readyplanet.com${settings.seo.slug}/${selected.id}`
      : surface === "home" && mode === "listing"
        ? "readyplanet.com/"
        : `readyplanet.com${settings.seo.slug}${queryString}`;
  const surfaceLabel = outboundUrl
    ? "พรีวิวลิงก์ภายนอก — รายการนี้ไม่เข้าหน้ารายละเอียด"
    : downloadItem
      ? "พรีวิวดาวน์โหลดไฟล์ — ไม่ใช่ลิงก์ออกเว็บ"
      : mode === "detail"
      ? (toolbarLabel ?? "พรีวิวหน้ารายละเอียด")
      : surface === "home"
        ? "พรีวิวบาร์บนหน้าแรก · ฝังได้แค่บาร์นี้ กดค้นหาแล้วไปหน้าเต็ม"
        : (toolbarLabel ?? "พรีวิวหน้ารายการ");
  const clearOverlays = () => {
    setOutboundUrl(null);
    setDownloadItem(null);
  };
  const goToListing = () => {
    setSurface("listing");
    setExtraOpen(false);
    clearOverlays();
    onModeChange("listing");
  };
  const openItem = (item: ContentItem) => {
    if (item.clickAction === "external" && item.externalUrl) {
      setDownloadItem(null);
      setOutboundUrl(item.externalUrl);
      return;
    }
    if (item.clickAction === "file" && (item.fileName || item.fileUrl)) {
      setOutboundUrl(null);
      setDownloadItem(item);
      return;
    }
    clearOverlays();
    onSelect(item.id);
    onModeChange("detail");
  };

  return (
    <main className="preview-wrap">
      <div className="preview-toolbar">
        <div className="label">{surfaceLabel}</div>
        <div className="preview-controls">
          {mode === "listing" && listing.enableHomeBar ? (
            <div className="mode-toggle">
              <button
                type="button"
                className={surface === "home" ? "active" : ""}
                onClick={() => {
                  clearOverlays();
                  setSurface("home");
                }}
              >
                บาร์หน้าแรก
              </button>
              <button
                type="button"
                className={surface === "listing" ? "active" : ""}
                onClick={() => setSurface("listing")}
              >
                หน้าเต็ม
              </button>
            </div>
          ) : null}
          <div className="device-toggle">
            <button
              type="button"
              className={device === "desktop" ? "active" : ""}
              onClick={() => onDeviceChange("desktop")}
            >
              Desktop
            </button>
            <button
              type="button"
              className={device === "mobile" ? "active" : ""}
              onClick={() => onDeviceChange("mobile")}
            >
              Mobile
            </button>
          </div>
        </div>
      </div>

      <div className={`browser${device === "mobile" ? " mobile" : ""}`}>
        <div className="browser-head">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
          <div className="browser-url">{previewUrl}</div>
        </div>

        <div className="front">
          <div className="site-header">
            <div className="logo">readyplanet</div>
            <div className="navlinks">
              <span>About</span>
              <span>Services</span>
              <span>Careers</span>
              <span>Contact</span>
            </div>
          </div>

          {!settings.seo.published ? (
            <div className="unpublished-note">
              Draft — หน้านี้ยังไม่เผยแพร่บนเว็บจริง (ผู้เยี่ยมชมทั่วไปมองไม่เห็น)
            </div>
          ) : null}

          {outboundUrl && mode === "listing" ? (
            <OutboundView
              url={outboundUrl}
              onBack={clearOverlays}
            />
          ) : null}

          {downloadItem && mode === "listing" ? (
            <FileDownloadView
              item={downloadItem}
              onBack={clearOverlays}
            />
          ) : null}

          {mode === "listing" && surface === "home" && listing.enableHomeBar && !outboundUrl && !downloadItem ? (
            <section className="hero home-hero">
              <div className="home-kicker">หน้าแรก</div>
              <h2>{heroTitle || config.heroTitle}</h2>
              <p>{heroSubtitle || config.heroSubtitle}</p>
              {showHomeBar ? (
                <>
                  <FinderBar
                    barStyle={listing.homeBarStyle ?? "dark"}
                    onDark
                    listing={listing}
                    config={config}
                    values={values}
                    categories={categories}
                    locations={locations}
                    statuses={statuses}
                    onChange={patchValues}
                    onSubmit={goToListing}
                  />
                  <div className="home-bar-note">
                    ฝังได้เฉพาะบาร์นี้บนหน้าแรก · กดค้นหาแล้วเปิดหน้ารายการพร้อมค่าที่เลือก
                  </div>
                </>
              ) : (
                <div className="home-bar-note">
                  บนมือถือซ่อนบาร์ค้นหาหน้าแรกไว้
                </div>
              )}
            </section>
          ) : null}

          {mode === "listing" && surface === "listing" && !outboundUrl && !downloadItem ? (
            <>
              <section className="hero">
                <h2>{heroTitle || config.heroTitle}</h2>
                <p>{heroSubtitle || config.heroSubtitle}</p>
                <FinderBar
                  barStyle={listing.listingBarStyle ?? "card"}
                  listing={listing}
                  config={config}
                  values={values}
                  categories={categories}
                  locations={locations}
                  statuses={statuses}
                  onChange={patchValues}
                  onSubmit={goToListing}
                />
                {searchHint && listing.showSearch ? (
                  <div className="search-hint">{searchHint}</div>
                ) : null}
              </section>

              <section className="content">
                {showExtraFilterBar ? (
                  <div className="extra-filters">
                    <button
                      type="button"
                      className="extra-filters-toggle"
                      onClick={() => setExtraOpen((open) => !open)}
                    >
                      ตัวกรองเพิ่มเติม {extraOpen ? "▴" : "▾"}
                    </button>
                    {extraOpen ? (
                      <div className="extra-filters-row">
                        {listing.extraFilters.map((key) => (
                          <label className="finder-field extra" key={key}>
                            <span>
                              {filterLabel(key, extraFilters)}
                            </span>
                            <FinderSelect
                              filterKey={key}
                              config={config}
                              values={values}
                              categories={categories}
                              locations={locations}
                              statuses={statuses}
                              onChange={patchValues}
                            />
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="front-toolbar">
                  {listing.showResultCount ? (
                    <div className="result-count">
                      {config.resultLabel(visibleItems.length)}
                    </div>
                  ) : (
                    <div />
                  )}
                  {listing.allowViewToggle && !isMobile ? (
                    <div className="view-toggle" role="group" aria-label="มุมมองรายการ">
                      <button
                        type="button"
                        className={visitorView === "grid" ? "active" : ""}
                        aria-pressed={visitorView === "grid"}
                        onClick={() => setVisitorView("grid")}
                      >
                        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                          <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
                          <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
                          <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
                          <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
                        </svg>
                        ตาราง
                      </button>
                      <button
                        type="button"
                        className={visitorView === "list" ? "active" : ""}
                        aria-pressed={visitorView === "list"}
                        onClick={() => setVisitorView("list")}
                      >
                        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                          <rect x="1" y="2" width="14" height="3" rx="1" fill="currentColor" />
                          <rect x="1" y="6.5" width="14" height="3" rx="1" fill="currentColor" />
                          <rect x="1" y="11" width="14" height="3" rx="1" fill="currentColor" />
                        </svg>
                        รายการ
                      </button>
                    </div>
                  ) : null}
                </div>

                {visibleItems.length > 0 ? (
                  <div
                    className={`cards ${colsClass}${useHorizontal ? " horizontal" : ""}`}
                  >
                    {pagedItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        settings={settings}
                        config={config}
                        onOpen={() => openItem(item)}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-results">
                    ไม่พบรายการที่ตรงกับคำค้นหรือตัวกรอง
                  </div>
                )}

                {listing.pagination === "pagination" &&
                visibleItems.length > 0 &&
                totalPages > 1 ? (
                  <div className="pagination">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                      (number) => (
                        <button
                          key={number}
                          type="button"
                          className={number === page ? "active" : ""}
                          onClick={() => setPage(number)}
                        >
                          {number}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                    >
                      ›
                    </button>
                  </div>
                ) : null}
                {hasMore ? (
                  <div className="pagination">
                    <button
                      type="button"
                      className="load-more"
                      onClick={() => setPage((current) => current + 1)}
                    >
                      โหลดเพิ่มเติม
                    </button>
                  </div>
                ) : null}
              </section>

              <div className="seo-preview-card">
                <div className="seo-label">ตัวอย่างในผลการค้นหา</div>
                <div className="seo-title">{settings.seo.pageTitle}</div>
                <div className="seo-url">
                  readyplanet.com{settings.seo.slug}
                  {queryString}
                  {!settings.seo.indexable ? "  ·  noindex" : ""}
                </div>
                <div className="seo-desc">{settings.seo.metaDescription}</div>
              </div>
            </>
          ) : null}

          {mode === "detail" ? (
            <DetailView
              item={selected}
              settings={settings}
              config={config}
              onBack={() => {
                setSurface("listing");
                onModeChange("listing");
                onSelect(null);
              }}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
