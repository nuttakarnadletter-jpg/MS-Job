import { CONTENT_TYPES } from "../data/content";
import type {
  CardLayout,
  ContentTypeConfig,
  DisplaySettings,
  MetaSource,
} from "../types";
import { Field, Section, SwitchRow } from "./ui";

const META_SOURCES: { value: MetaSource; label: string }[] = [
  { value: "salary", label: "Salary" },
  { value: "price", label: "Price" },
  { value: "sku", label: "SKU" },
  { value: "location", label: "Location" },
  { value: "department", label: "Department" },
  { value: "category", label: "Category" },
  { value: "brand", label: "Brand" },
  { value: "author", label: "Author" },
  { value: "fileSize", label: "File Size" },
  { value: "date", label: "Date" },
];

export function ListingSettings({
  settings,
  config,
  onChange,
}: {
  settings: DisplaySettings;
  config: ContentTypeConfig;
  onChange: (next: DisplaySettings) => void;
}) {
  const listing = settings.listing;

  const patch = (partial: Partial<DisplaySettings["listing"]>) =>
    onChange({ ...settings, listing: { ...listing, ...partial } });

  const toggleSearchField = (id: string) => {
    const exists = listing.searchFields.includes(id);
    patch({
      searchFields: exists
        ? listing.searchFields.filter((f) => f !== id)
        : [...listing.searchFields, id],
    });
  };

  return (
    <>
      <Section
        title="Search"
        help="ควบคุมว่าผู้เยี่ยมชมค้นหาเนื้อหาบนหน้า Listing ได้อย่างไร"
      >
        <SwitchRow
          label="แสดงช่องค้นหา"
          impact="มีช่องค้นหาใต้หัวข้อหน้า"
          on={listing.showSearch}
          onToggle={() => patch({ showSearch: !listing.showSearch })}
        />
        <Field label="Placeholder">
          <input
            value={listing.searchPlaceholder}
            onChange={(e) => patch({ searchPlaceholder: e.target.value })}
            disabled={!listing.showSearch}
          />
        </Field>
        <Field label="ค้นหาจาก Field">
          <div className="checklist">
            {config.searchFields.map((field) => (
              <label className="check" key={field.id}>
                <input
                  type="checkbox"
                  checked={listing.searchFields.includes(field.id)}
                  disabled={!listing.showSearch}
                  onChange={() => toggleSearchField(field.id)}
                />
                {field.label}
              </label>
            ))}
          </div>
          <div className="chip-row">
            {listing.searchFields.map((id) => {
              const field = config.searchFields.find((f) => f.id === id);
              return (
                <span className="chip on" key={id}>
                  {field?.label ?? id}
                </span>
              );
            })}
          </div>
        </Field>
      </Section>

      <Section
        title="Filter, Sort & Layout"
        help="กำหนดแถบตัวกรอง จำนวนคอลัมน์ และการแบ่งหน้า"
      >
        <SwitchRow
          label="แสดง Filter"
          impact="มีเมนูกรองหมวด/สถานที่/เรียงลำดับ"
          on={listing.showFilters}
          onToggle={() => patch({ showFilters: !listing.showFilters })}
        />
        <SwitchRow
          label="แสดงจำนวนผลลัพธ์"
          impact={`เช่น “${config.resultLabel(6)}”`}
          on={listing.showResultCount}
          onToggle={() => patch({ showResultCount: !listing.showResultCount })}
        />
        <Field label="จำนวน Column">
          <select
            value={listing.columns}
            onChange={(e) =>
              patch({ columns: Number(e.target.value) as 1 | 2 | 3 })
            }
          >
            <option value={3}>3 Columns — เหมาะกับ Desktop กว้าง</option>
            <option value={2}>2 Columns — อ่านง่ายขึ้น</option>
            <option value={1}>1 Column — รายการยาว / มือถือ</option>
          </select>
        </Field>
        <Field label="Pagination">
          <select
            value={listing.pagination}
            onChange={(e) =>
              patch({
                pagination: e.target.value as DisplaySettings["listing"]["pagination"],
              })
            }
          >
            <option value="pagination">Pagination — เลขหน้า 1 2 3</option>
            <option value="loadmore">Load more — ปุ่มโหลดเพิ่ม</option>
            <option value="none">ไม่แสดง — โชว์รายการทั้งหมด</option>
          </select>
        </Field>
      </Section>
    </>
  );
}

export function CardSettings({
  settings,
  config,
  onChange,
}: {
  settings: DisplaySettings;
  config: ContentTypeConfig;
  onChange: (next: DisplaySettings) => void;
}) {
  const card = settings.card;
  const patch = (partial: Partial<DisplaySettings["card"]>) =>
    onChange({ ...settings, card: { ...card, ...partial } });

  const setLayout = (layout: CardLayout) => {
    patch({
      layout,
      showThumbnail: layout === "none" ? false : true,
    });
  };

  return (
    <>
      <Section
        title="Card Layout"
        help="รูปแบบการ์ดเดียวกันใช้ได้กับ Job, Blog, News, Product และ Download โดยเปิด-ปิด Field ตามประเภทเนื้อหา"
      >
        <div className="seg">
          {(
            [
              ["top", "Media Top"],
              ["horizontal", "Horizontal"],
              ["none", "No Media"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`seg-btn${card.layout === value ? " active" : ""}`}
              onClick={() => setLayout(value)}
            >
              <div className={`mini-layout ${value}`} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <p className="help" style={{ marginTop: 10 }}>
          {card.layout === "top" &&
            "รูปอยู่ด้านบน ข้อความด้านล่าง — เหมาะกับ Blog / News / Product"}
          {card.layout === "horizontal" &&
            "รูปซ้าย ข้อความขวา — เหมาะกับ Job listing ที่เน้นอ่านเร็ว"}
          {card.layout === "none" &&
            "ไม่มีพื้นที่รูป — เหมาะกับรายการที่เน้นข้อความอย่าง Download หรือ Job แบบกะทัดรัด"}
        </p>
      </Section>

      <Section title="Media">
        <SwitchRow
          label="แสดง Thumbnail"
          impact="มีรูป/ไอคอนบนการ์ด"
          on={card.showThumbnail && card.layout !== "none"}
          onToggle={() => {
            if (card.layout === "none") {
              setLayout("top");
              return;
            }
            patch({ showThumbnail: !card.showThumbnail });
          }}
        />
        <Field label="ถ้าไม่มีรูป">
          <select
            value={card.emptyImage}
            onChange={(e) =>
              patch({
                emptyImage: e.target
                  .value as DisplaySettings["card"]["emptyImage"],
              })
            }
            disabled={!card.showThumbnail || card.layout === "none"}
          >
            <option value="placeholder">ใช้ Placeholder / Icon</option>
            <option value="hide">ซ่อนพื้นที่รูป</option>
            <option value="default">ใช้ Default Image</option>
          </select>
        </Field>
      </Section>

      <Section
        title="ข้อมูลที่แสดงบน Card"
        help="เปิดเฉพาะข้อมูลที่ผู้เยี่ยมชมต้องเห็นบนหน้า Listing — รายละเอียดเต็มไปไว้ที่ Detail Page"
      >
        <SwitchRow
          label="Title"
          impact="แสดงชื่อรายการเป็นหัวข้อหลัก"
          on={card.showTitle}
          onToggle={() => patch({ showTitle: !card.showTitle })}
        />
        <SwitchRow
          label="Description"
          impact="แสดงข้อความย่อใต้หัวข้อ"
          on={card.showDescription}
          onToggle={() => patch({ showDescription: !card.showDescription })}
        />
        <SwitchRow
          label={config.categoryLabel}
          impact="แสดงหมวดหมู่ / แผนก บนการ์ด"
          on={card.showCategory}
          onToggle={() => patch({ showCategory: !card.showCategory })}
        />
        <SwitchRow
          label={config.locationLabel}
          impact="แสดงสถานที่ / แหล่งที่มา / ภาษา"
          on={card.showLocation}
          onToggle={() => patch({ showLocation: !card.showLocation })}
        />
        <SwitchRow
          label={config.priceLabel}
          impact="แสดงเงินเดือน ราคา ขนาดไฟล์ หรือเวลาอ่าน"
          on={card.showPrice}
          onToggle={() => patch({ showPrice: !card.showPrice })}
        />
        <SwitchRow
          label={config.statusLabel}
          impact="แสดงป้ายสถานะ เช่น เปิดรับสมัคร / Featured"
          on={card.showStatus}
          onToggle={() => patch({ showStatus: !card.showStatus })}
        />
        <SwitchRow
          label="CTA / Read More"
          impact={`ปุ่ม “${card.ctaLabel || config.ctaLabel}” ไปหน้ารายละเอียด`}
          on={card.showCta}
          onToggle={() => patch({ showCta: !card.showCta })}
        />
        <Field label="ข้อความปุ่ม CTA">
          <input
            value={card.ctaLabel}
            onChange={(e) => patch({ ctaLabel: e.target.value })}
            disabled={!card.showCta}
          />
        </Field>
      </Section>

      <Section
        title="Field Mapping"
        help="แมป Meta Field ให้ตรงกับข้อมูลจริงของ Content Type นี้ — ป้ายกำกับจะโชว์ใน Preview"
      >
        <div className="subcard">
          <div className="mini-title">Meta Field #1</div>
          <Field label="Source">
            <select
              value={card.meta1.source}
              onChange={(e) =>
                patch({
                  meta1: {
                    ...card.meta1,
                    source: e.target.value as MetaSource,
                  },
                })
              }
            >
              {META_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Label">
            <input
              value={card.meta1.label}
              onChange={(e) =>
                patch({ meta1: { ...card.meta1, label: e.target.value } })
              }
            />
          </Field>
        </div>
        <div className="subcard">
          <div className="mini-title">Meta Field #2</div>
          <Field label="Source">
            <select
              value={card.meta2.source}
              onChange={(e) =>
                patch({
                  meta2: {
                    ...card.meta2,
                    source: e.target.value as MetaSource,
                  },
                })
              }
            >
              {META_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Label">
            <input
              value={card.meta2.label}
              onChange={(e) =>
                patch({ meta2: { ...card.meta2, label: e.target.value } })
              }
            />
          </Field>
        </div>
      </Section>
    </>
  );
}

export function DetailSettings({
  settings,
  config,
  onChange,
}: {
  settings: DisplaySettings;
  config: ContentTypeConfig;
  onChange: (next: DisplaySettings) => void;
}) {
  const detail = settings.detail;
  const patch = (partial: Partial<DisplaySettings["detail"]>) =>
    onChange({ ...settings, detail: { ...detail, ...partial } });

  const type = settings.contentType;
  const showJobBlocks = type === "job";
  const showBody = type !== "job";
  const showBenefits = type === "job" || type === "product";

  return (
    <Section
      title="Detail Page"
      help="เมื่อผู้ใช้คลิกการ์ด จะเห็นหน้า Detail ตามสวิตช์ด้านล่าง — สลับ Preview เป็นโหมด Detail เพื่อตรวจผล"
    >
      <SwitchRow
        label={`แสดง ${CONTENT_TYPES[type].priceLabel.split(" / ")[0]}`}
        impact="แสดงค่าเงินเดือน/ราคา/ขนาดไฟล์ในหัวข้อ Detail"
        on={detail.showPrice}
        onToggle={() => patch({ showPrice: !detail.showPrice })}
      />
      <SwitchRow
        label={`แสดง ${config.locationLabel}`}
        impact="แสดงข้อมูลสถานที่/ผู้เขียน/ภาษา"
        on={detail.showLocation}
        onToggle={() => patch({ showLocation: !detail.showLocation })}
      />
      <SwitchRow
        label={`แสดง ${config.categoryLabel.split(" / ")[0]}`}
        impact="แสดงหมวดหมู่บนหน้ารายละเอียด"
        on={detail.showCategory}
        onToggle={() => patch({ showCategory: !detail.showCategory })}
      />
      <SwitchRow
        label="แสดง Status"
        impact="แสดงป้ายสถานะบน Detail"
        on={detail.showStatus}
        onToggle={() => patch({ showStatus: !detail.showStatus })}
      />

      {showJobBlocks && (
        <>
          <SwitchRow
            label="แสดง Responsibilities"
            impact="แสดงรายการหน้าที่ความรับผิดชอบ"
            on={detail.showResponsibilities}
            onToggle={() =>
              patch({ showResponsibilities: !detail.showResponsibilities })
            }
          />
          <SwitchRow
            label="แสดง Qualifications"
            impact="แสดงคุณสมบัติที่ต้องการ"
            on={detail.showQualifications}
            onToggle={() =>
              patch({ showQualifications: !detail.showQualifications })
            }
          />
        </>
      )}

      {showBenefits && (
        <SwitchRow
          label="แสดง Benefits"
          impact="แสดงสวัสดิการหรือจุดเด่น"
          on={detail.showBenefits}
          onToggle={() => patch({ showBenefits: !detail.showBenefits })}
        />
      )}

      {showBody && (
        <SwitchRow
          label="แสดงเนื้อหา / รายละเอียด"
          impact="แสดงย่อหน้าเนื้อหาหลักของรายการ"
          on={detail.showBody}
          onToggle={() => patch({ showBody: !detail.showBody })}
        />
      )}

      <Field label="Primary Action">
        <select
          value={detail.primaryAction}
          onChange={(e) => patch({ primaryAction: e.target.value })}
        >
          {config.primaryActions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </Field>
    </Section>
  );
}

export function SeoSettings({
  settings,
  onChange,
}: {
  settings: DisplaySettings;
  onChange: (next: DisplaySettings) => void;
}) {
  const seo = settings.seo;
  const patch = (partial: Partial<DisplaySettings["seo"]>) =>
    onChange({ ...settings, seo: { ...seo, ...partial } });

  return (
    <Section
      title="SEO & Publishing"
      help="ค่าเหล่านี้ใช้กับหน้า Listing บนเว็บจริง — ตัวอย่างผลลัพธ์ใน Google แสดงใน Preview"
    >
      <Field label="Page Title">
        <input
          value={seo.pageTitle}
          onChange={(e) => patch({ pageTitle: e.target.value })}
        />
      </Field>
      <Field label="Slug">
        <input
          value={seo.slug}
          onChange={(e) => patch({ slug: e.target.value })}
        />
      </Field>
      <Field label="Meta Description">
        <textarea
          value={seo.metaDescription}
          onChange={(e) => patch({ metaDescription: e.target.value })}
        />
      </Field>
      <SwitchRow
        label="Index by Search Engine"
        impact={
          seo.indexable
            ? "อนุญาตให้ Google เก็บหน้านี้ในผลการค้นหา"
            : "ใส่ noindex — หน้าจะไม่โชว์ใน Search"
        }
        on={seo.indexable}
        onToggle={() => patch({ indexable: !seo.indexable })}
      />
      <SwitchRow
        label="Published"
        impact={
          seo.published
            ? "หน้าเผยแพร่แล้ว ผู้เยี่ยมชมเห็นได้"
            : "ยังเป็น Draft — ยังไม่โชว์บนเว็บจริง"
        }
        on={seo.published}
        onToggle={() => patch({ published: !seo.published })}
      />
    </Section>
  );
}
