import { CONTENT_TYPES } from "../data/content";
import type {
  ContentItem,
  ContentTypeConfig,
  DevicePreview,
  DisplaySettings,
  MetaSource,
  PreviewMode,
} from "../types";

function metaValue(item: ContentItem, source: MetaSource): string {
  switch (source) {
    case "salary":
    case "price":
    case "fileSize":
    case "date":
      return item.priceLabel;
    case "department":
    case "category":
    case "brand":
      return item.category;
    case "location":
    case "author":
      return item.location;
    case "sku":
      return item.id.toUpperCase();
    default:
      return item.category;
  }
}

function metaIcon(source: MetaSource): string {
  switch (source) {
    case "salary":
    case "price":
      return "▱";
    case "location":
      return "⌖";
    case "department":
    case "category":
    case "brand":
      return "▣";
    case "author":
      return "✎";
    case "fileSize":
      return "▤";
    case "date":
      return "◷";
    case "sku":
      return "#";
    default:
      return "•";
  }
}

function ItemCard({
  item,
  settings,
  config,
  onOpen,
}: {
  item: ContentItem;
  settings: DisplaySettings;
  config: ContentTypeConfig;
  onOpen: () => void;
}) {
  const { card } = settings;
  const showMedia = card.showThumbnail && card.layout !== "none";

  return (
    <article className="item-card">
      {showMedia ? (
        <div className="thumb" style={{ background: item.imageColor }}>
          {item.icon}
        </div>
      ) : null}
      <div className="card-body">
        {card.showTitle ? <h3>{item.title}</h3> : null}
        <div className="meta">
          {card.showCategory ? (
            <span>
              {metaIcon(card.meta2.source)} {card.meta2.label}:{" "}
              {metaValue(item, card.meta2.source)}
            </span>
          ) : null}
          {card.showLocation ? (
            <span>
              ⌖ {item.location}
            </span>
          ) : null}
          {card.showPrice ? (
            <span>
              {metaIcon(card.meta1.source)} {card.meta1.label}:{" "}
              {metaValue(item, card.meta1.source)}
            </span>
          ) : null}
        </div>
        {card.showDescription ? <div className="desc">{item.description}</div> : null}
        {card.showStatus ? <span className="badge">{item.status}</span> : null}
        {card.showCta ? (
          <button type="button" className="cta" onClick={onOpen}>
            {card.ctaLabel || config.ctaLabel}
          </button>
        ) : (
          <button
            type="button"
            className="cta"
            style={{ opacity: 0.35 }}
            onClick={onOpen}
          >
            เปิดดู Detail (ทดสอบ)
          </button>
        )}
      </div>
    </article>
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
  const showMedia = card.showThumbnail && card.layout !== "none";

  return (
    <div className="detail-page">
      <button type="button" className="detail-back" onClick={onBack}>
        ← กลับไปหน้า Listing
      </button>
      {showMedia ? (
        <div
          className="detail-hero-media"
          style={{ background: item.imageColor }}
        >
          {item.icon}
        </div>
      ) : null}
      <h1>{item.title}</h1>
      <div className="detail-meta">
        {detail.showCategory ? <span>▣ {item.category}</span> : null}
        {detail.showLocation ? <span>⌖ {item.location}</span> : null}
        {detail.showPrice ? <span>▱ {item.priceLabel}</span> : null}
        {detail.showStatus ? <span className="badge">{item.status}</span> : null}
      </div>
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
          {item.detailSections.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}

      <button type="button" className="detail-cta">
        {detail.primaryAction || config.detailCta}
      </button>
    </div>
  );
}

export function LivePreview({
  settings,
  items,
  device,
  mode,
  selectedId,
  onDeviceChange,
  onModeChange,
  onSelect,
}: {
  settings: DisplaySettings;
  items: ContentItem[];
  device: DevicePreview;
  mode: PreviewMode;
  selectedId: string | null;
  onDeviceChange: (device: DevicePreview) => void;
  onModeChange: (mode: PreviewMode) => void;
  onSelect: (id: string | null) => void;
}) {
  const config = CONTENT_TYPES[settings.contentType];
  const selected = items.find((i) => i.id === selectedId) ?? items[0];
  const listing = settings.listing;
  const colsClass =
    device === "mobile" ? "cols-1" : `cols-${listing.columns}`;

  return (
    <main className="preview-wrap">
      <div className="preview-toolbar">
        <div className="label">Live Front-end Preview — เห็นผลทันทีเมื่อปรับ Settings</div>
        <div className="preview-controls">
          <div className="mode-toggle">
            <button
              type="button"
              className={mode === "listing" ? "active" : ""}
              onClick={() => {
                onModeChange("listing");
                onSelect(null);
              }}
            >
              Listing
            </button>
            <button
              type="button"
              className={mode === "detail" ? "active" : ""}
              onClick={() => {
                onModeChange("detail");
                if (!selectedId) onSelect(items[0]?.id ?? null);
              }}
            >
              Detail
            </button>
          </div>
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
          <div className="browser-url">
            readyplanet.com{settings.seo.slug}
            {mode === "detail" && selected ? `/${selected.id}` : ""}
          </div>
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

          {mode === "listing" ? (
            <>
              <section className="hero">
                <h2>{config.heroTitle}</h2>
                <p>{config.heroSubtitle}</p>
                {listing.showSearch ? (
                  <div className="front-search">
                    <input
                      readOnly
                      placeholder={listing.searchPlaceholder}
                      value=""
                    />
                    <button type="button">ค้นหา</button>
                  </div>
                ) : null}
              </section>

              <section className="content">
                <div className="front-toolbar">
                  {listing.showResultCount ? (
                    <div className="result-count">
                      {config.resultLabel(items.length)}
                    </div>
                  ) : (
                    <div />
                  )}
                  {listing.showFilters ? (
                    <div className="front-filter">
                      <select defaultValue="">
                        <option>{config.filterCategory}</option>
                      </select>
                      <select defaultValue="">
                        <option>{config.filterLocation}</option>
                      </select>
                      <select defaultValue="">
                        <option>ล่าสุด</option>
                      </select>
                    </div>
                  ) : null}
                </div>

                <div
                  className={`cards ${colsClass}${
                    settings.card.layout === "horizontal" ? " horizontal" : ""
                  }`}
                >
                  {items.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      settings={settings}
                      config={config}
                      onOpen={() => {
                        onSelect(item.id);
                        onModeChange("detail");
                      }}
                    />
                  ))}
                </div>

                {listing.pagination === "pagination" ? (
                  <div className="pagination">
                    <span>‹</span>
                    <span className="active">1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>›</span>
                  </div>
                ) : null}
                {listing.pagination === "loadmore" ? (
                  <div className="pagination">
                    <button type="button" className="load-more">
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
                  {!settings.seo.indexable ? "  ·  noindex" : ""}
                </div>
                <div className="seo-desc">{settings.seo.metaDescription}</div>
              </div>
            </>
          ) : (
            <DetailView
              item={selected}
              settings={settings}
              config={config}
              onBack={() => {
                onModeChange("listing");
                onSelect(null);
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
