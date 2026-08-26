import { useEffect, useMemo, useState } from "react";
import { DesktopOutlined, LeftOutlined, MobileOutlined, RightOutlined } from "@ant-design/icons";
import { Segmented } from "antd";
import {
  articlesForBox,
  filterTabsForBox,
  formatArticleDate,
  t,
} from "../data/articles";
import type {
  ArticleBoxSettings,
  ArticleLocale,
  ContentItem,
  DevicePreview,
} from "../types";

function visibleCount(settings: ArticleBoxSettings, device: DevicePreview) {
  if (device === "mobile") return 1;
  if (settings.layout === "list") return 3;
  if (settings.layout === "grid") return settings.columns;
  return 3;
}

export function ArticleBoxPreview({
  settings,
  items,
  locale,
  device,
  onDeviceChange,
}: {
  settings: ArticleBoxSettings;
  items: ContentItem[];
  locale: ArticleLocale;
  device: DevicePreview;
  onDeviceChange: (device: DevicePreview) => void;
}) {
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(0);

  const pool = useMemo(() => articlesForBox(settings, items), [settings, items]);
  const tabs = useMemo(
    () => (settings.showFilterTabs ? filterTabsForBox(settings, pool) : []),
    [settings, pool],
  );
  const filtered =
    tab === "all" || !settings.showFilterTabs
      ? pool
      : pool.filter((item) => item.category === tab);
  const perPage = visibleCount(settings, device);
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * perPage, safePage * perPage + perPage);
  const featured = settings.layout === "featured" && device === "desktop" ? visible[0] : null;
  const rest = featured ? visible.slice(1) : visible;
  const canSlide = settings.displayMode === "carousel" && pageCount > 1;
  const showDots = pageCount > 1;
  const viewAllInHeader =
    settings.showViewAll &&
    settings.showHeader &&
    settings.viewAllPosition === "headerRight";
  const viewAllBelow =
    settings.showViewAll && (!settings.showHeader || settings.viewAllPosition === "bottomCenter");
  const title = t(settings.headerTitle, locale);
  const description = t(settings.headerDescription, locale);
  const viewAll = t(settings.viewAllLabel, locale) || (locale === "th" ? "ดูทั้งหมด" : "View all");
  const allLabel = locale === "th" ? "ทั้งหมด" : "All";

  useEffect(() => {
    setTab("all");
    setPage(0);
  }, [
    settings.sourceCategories,
    settings.sort,
    settings.maxItems,
    settings.layout,
    settings.columns,
    settings.displayMode,
    settings.showFilterTabs,
    locale,
    device,
  ]);

  useEffect(() => {
    setPage(0);
  }, [tab]);

  return (
    <div className="preview-wrap abox-preview-wrap">
      <div className="preview-toolbar">
        <div className="label">ผลที่ผู้เข้าชมเห็นบนหน้าเว็บ</div>
        <div className="preview-controls">
          <Segmented
            value={device}
            onChange={(value) => onDeviceChange(value as DevicePreview)}
            options={[
              { value: "desktop", icon: <DesktopOutlined />, label: "Desktop" },
              { value: "mobile", icon: <MobileOutlined />, label: "Mobile" },
            ]}
          />
        </div>
      </div>

      <div className={`browser ${device}`}>
        <div className="browser-head">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
          <div className="browser-url">company.com</div>
        </div>
        <div className="front abox-site">
          <header className="site-header">
            <div className="logo">Company</div>
            <nav className="nav">
              <span>Home</span>
              <span>About</span>
              <span className="on">Articles</span>
            </nav>
          </header>
          <div className="abox-page">
            <div className="abox-page-ghost" aria-hidden />
            <section className="abox-section">
              {settings.showHeader ? (
                <div className={`abox-head ${settings.headerAlign}`}>
                  {viewAllInHeader ? (
                    <div className="abox-head-row">
                      <div>
                        {title ? <h2>{title}</h2> : null}
                        {description ? <p>{description}</p> : null}
                      </div>
                      <button type="button" className="abox-viewall">
                        {viewAll} →
                      </button>
                    </div>
                  ) : (
                    <>
                      {title ? <h2>{title}</h2> : null}
                      {description ? <p>{description}</p> : null}
                    </>
                  )}
                </div>
              ) : null}

              {settings.showFilterTabs && tabs.length > 0 ? (
                <div className="abox-filters">
                  {settings.showAllTab ? (
                    <button
                      type="button"
                      className={`abox-filter${tab === "all" ? " active" : ""}`}
                      onClick={() => setTab("all")}
                    >
                      {allLabel}
                    </button>
                  ) : null}
                  {tabs.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={`abox-filter${tab === name ? " active" : ""}`}
                      onClick={() => setTab(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ) : null}

              {visible.length === 0 ? (
                <div className="abox-empty">ยังไม่มีบทความตามเงื่อนไขที่เลือก</div>
              ) : (
                <div className="abox-stage">
                  {canSlide ? (
                    <>
                      <button
                        type="button"
                        className="abox-nav prev"
                        aria-label="ก่อนหน้า"
                        disabled={safePage === 0}
                        onClick={() => setPage((value) => Math.max(0, value - 1))}
                      >
                        <LeftOutlined />
                      </button>
                      <button
                        type="button"
                        className="abox-nav next"
                        aria-label="ถัดไป"
                        disabled={safePage >= pageCount - 1}
                        onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                      >
                        <RightOutlined />
                      </button>
                    </>
                  ) : null}

                  <div
                    className={`abox-grid ${
                      settings.layout === "featured" && device === "desktop"
                        ? "featured"
                        : settings.layout === "list" || device === "mobile"
                          ? "cols-1"
                          : `cols-${settings.columns}`
                    }`}
                  >
                    {featured ? (
                      <ArticleCard
                        item={featured}
                        settings={settings}
                        locale={locale}
                        variant="featured"
                      />
                    ) : null}
                    {rest.map((item) => (
                      <ArticleCard
                        key={item.id}
                        item={item}
                        settings={settings}
                        locale={locale}
                        variant={settings.layout === "list" ? "list" : "grid"}
                      />
                    ))}
                  </div>
                </div>
              )}

              {showDots && settings.displayMode === "pagination" ? (
                <div className="abox-dots">
                  {Array.from({ length: pageCount }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`abox-dot${index === safePage ? " active" : ""}`}
                      aria-label={`หน้า ${index + 1}`}
                      onClick={() => setPage(index)}
                    />
                  ))}
                </div>
              ) : null}

              {viewAllBelow ? (
                <button type="button" className="abox-viewall bottom">
                  {viewAll} →
                </button>
              ) : null}
            </section>
            <div className="abox-page-foot" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({
  item,
  settings,
  locale,
  variant,
}: {
  item: ContentItem;
  settings: ArticleBoxSettings;
  locale: ArticleLocale;
  variant: "grid" | "list" | "featured";
}) {
  const cta = t(settings.ctaLabel, locale) || (locale === "th" ? "อ่านต่อ" : "Read more");
  return (
    <article className={`abox-card ${variant}`}>
      <div
        className="abox-thumb"
        style={{
          backgroundImage: item.coverImage ? `url(${item.coverImage})` : undefined,
          backgroundColor: "#eef3f9",
        }}
      >
        {settings.showCategoryBadge ? <span className="abox-badge">{item.category}</span> : null}
      </div>
      <div className="abox-body">
        {settings.showPublishedAt ? (
          <div className="abox-date">{formatArticleDate(item.publishedAt, locale)}</div>
        ) : null}
        <h3>{item.title}</h3>
        {settings.showExcerpt ? <p className="abox-excerpt">{item.description}</p> : null}
        {settings.showCta ? (
          <button type="button" className={`abox-cta ${settings.ctaStyle}`}>
            {cta}
          </button>
        ) : null}
      </div>
    </article>
  );
}
