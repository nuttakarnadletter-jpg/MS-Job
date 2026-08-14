import { CONTENT_TYPES } from "../data/content";
import {
  defaultCategoryIconSrc,
  defaultLocationIconSrc,
  defaultPriceIconSrc,
} from "../data/defaultIcons";
import {
  availableFilters,
  MAX_PRIMARY_FILTERS,
  searchPlaceholderFor,
} from "../data/search";
import type {
  BarStyle,
  CardLayout,
  ContentTypeConfig,
  CtaStyle,
  DetailCtaPosition,
  DisplaySettings,
  FilterKey,
  ListingView,
  ListMetaLayout,
  MetaIconMode,
  MetaIconSetting,
  MetaSource,
  MobileSettings,
} from "../types";
import { Field, Section, SwitchRow } from "./ui";

function IconSourcePicker({
  value,
  onChange,
  defaultSrc,
}: {
  value: MetaIconSetting;
  onChange: (next: MetaIconSetting) => void;
  defaultSrc?: string;
}) {
  const setting = value ?? { mode: "default" as const };
  const setMode = (mode: MetaIconMode) => onChange({ ...setting, mode });

  return (
    <div>
      <div className="icon-mode-toggle">
        {(
          [
            ["none", "ไม่มี"],
            ["default", "ค่าเริ่มต้น"],
            ["upload", "อัปโหลด"],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            className={setting.mode === mode ? "active" : ""}
            onClick={() => setMode(mode)}
          >
            {label}
          </button>
        ))}
      </div>
      {setting.mode === "default" && defaultSrc ? (
        <img className="icon-default-preview" src={defaultSrc} alt="" />
      ) : null}
      {setting.mode === "upload" ? (
        <label className="icon-upload">
          {setting.src ? (
            <img src={setting.src} alt="" />
          ) : (
            <span>เลือกไฟล์รูป</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              onChange({ mode: "upload", src: URL.createObjectURL(file) });
            }}
          />
        </label>
      ) : null}
    </div>
  );
}

const BAR_STYLES: { value: BarStyle; label: string; hint: string }[] = [
  { value: "dark", label: "แถบเข้ม", hint: "พื้นทึบ ไม่มีขอบ ปุ่มเด่น" },
  { value: "card", label: "การ์ดขาว", hint: "พื้นขาว มีขอบ ใช้บนพื้นสว่าง" },
  { value: "ghost", label: "โปร่ง", hint: "ไม่มีกล่อง ทับบนพื้นหน้า" },
];

function MobileHideChecks({
  items,
  mobile,
  onChange,
}: {
  items: { key: keyof MobileSettings; label: string; available: boolean }[];
  mobile: MobileSettings;
  onChange: (next: MobileSettings) => void;
}) {
  const visible = items.filter((item) => item.available);
  if (visible.length === 0) {
    return <p className="help">ยังไม่มีรายการที่เปิดบนเดสก์ท็อปให้ซ่อนเพิ่ม</p>;
  }
  return (
    <div className="checklist">
      {visible.map((item) => (
        <label className="check" key={item.key}>
          <input
            type="checkbox"
            checked={Boolean(mobile[item.key])}
            onChange={() =>
              onChange({ ...mobile, [item.key]: !mobile[item.key] })
            }
          />
          {item.label}
        </label>
      ))}
    </div>
  );
}

function BarStylePicker({
  value,
  onChange,
}: {
  value: BarStyle;
  onChange: (next: BarStyle) => void;
}) {
  return (
    <div className="seg">
      {BAR_STYLES.map((style) => (
        <button
          key={style.value}
          type="button"
          className={`seg-btn${value === style.value ? " active" : ""}`}
          onClick={() => onChange(style.value)}
        >
          <div className={`mini-bar ${style.value}`}>
            <span className="mini-slot" />
            <span className="mini-slot" />
            <span className="mini-cta" />
          </div>
          <span>{style.label}</span>
          <small>{style.hint}</small>
        </button>
      ))}
    </div>
  );
}

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
  highlightViewToggle = false,
}: {
  settings: DisplaySettings;
  config: ContentTypeConfig;
  onChange: (next: DisplaySettings) => void;
  highlightViewToggle?: boolean;
}) {
  const listing = settings.listing;

  const patch = (partial: Partial<DisplaySettings["listing"]>) =>
    onChange({ ...settings, listing: { ...listing, ...partial } });

  const filters = availableFilters(config);

  const toggleSearchField = (id: string) => {
    const exists = listing.searchFields.includes(id);
    const searchFields = exists
      ? listing.searchFields.filter((fieldId) => fieldId !== id)
      : [...listing.searchFields, id];
    if (searchFields.length === 0) return;
    patch({
      searchFields,
      searchPlaceholder: searchPlaceholderFor(config, searchFields),
    });
  };

  const togglePrimary = (id: FilterKey) => {
    const exists = listing.primaryFilters.includes(id);
    if (exists) {
      patch({
        primaryFilters: listing.primaryFilters.filter((key) => key !== id),
      });
      return;
    }
    if (listing.primaryFilters.length >= MAX_PRIMARY_FILTERS) return;
    patch({
      primaryFilters: [...listing.primaryFilters, id],
      extraFilters: listing.extraFilters.filter((key) => key !== id),
    });
  };

  const toggleExtra = (id: FilterKey) => {
    if (listing.primaryFilters.includes(id)) return;
    const exists = listing.extraFilters.includes(id);
    patch({
      extraFilters: exists
        ? listing.extraFilters.filter((key) => key !== id)
        : [...listing.extraFilters, id],
    });
  };

  return (
    <>
      <Section
        title="บาร์หลัก"
        help="แถวค้นหาบนหน้ารายการเต็ม ถ้าจะฝังบาร์บนหน้าแรกค่อยเปิดด้านล่าง"
      >
        <SwitchRow
          label="แสดงช่องค้นหา"
          impact="มีช่องพิมพ์ กรองทันทีตอนพิมพ์ มีไอคอนแว่นในช่อง"
          on={listing.showSearch}
          onToggle={() => patch({ showSearch: !listing.showSearch })}
        />
        <Field label="Placeholder">
          <input
            value={listing.searchPlaceholder}
            onChange={(e) => patch({ searchPlaceholder: e.target.value })}
            disabled={!listing.showSearch}
          />
          <p className="help">อัปเดตอัตโนมัติเมื่อเลือกช่องค้นหา สามารถแก้ข้อความเองได้</p>
        </Field>
        <Field label="ค้นหาจากช่องข้อความ">
          <p className="help" style={{ marginTop: 0 }}>
            ผู้เข้าชมพิมพ์ในช่องค้นหา แล้วไปเจอช่องที่เปิดไว้
          </p>
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
              const field = config.searchFields.find((item) => item.id === id);
              return (
                <span className="chip on" key={id}>
                  {field?.label ?? id}
                </span>
              );
            })}
          </div>
        </Field>
        <Field label={`ตัวกรองบนบาร์ (สูงสุด ${MAX_PRIMARY_FILTERS})`}>
          <p className="help" style={{ marginTop: 0 }}>
            โชว์เป็นเมนูเลือกบนหน้าแรกและแถวหลักของหน้าเต็ม เรียงตามที่ติ๊ก
          </p>
          <div className="checklist">
            {filters.map((filter) => {
              const checked = listing.primaryFilters.includes(filter.id);
              const full =
                !checked && listing.primaryFilters.length >= MAX_PRIMARY_FILTERS;
              return (
                <label className="check" key={filter.id}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={full}
                    onChange={() => togglePrimary(filter.id)}
                  />
                  {filter.label}
                </label>
              );
            })}
          </div>
          <div className="chip-row">
            {listing.primaryFilters.map((id) => {
              const filter = filters.find((item) => item.id === id);
              return (
                <span className="chip on" key={id}>
                  {filter?.label ?? id}
                </span>
              );
            })}
          </div>
        </Field>
        <Field label="สไตล์บาร์หน้าเต็ม">
          <p className="help" style={{ marginTop: 0 }}>
            แถวหลักบนหน้ารายการ
          </p>
          <BarStylePicker
            value={listing.listingBarStyle}
            onChange={(listingBarStyle) => patch({ listingBarStyle })}
          />
        </Field>
        <SwitchRow
          label="ฝังบาร์บนหน้าแรก"
          impact="มีวิดเจ็ตค้นหาบนหน้าแรก กดแล้วมาหน้ารายการนี้ — ไม่ต้องเปิดถ้าใช้แค่หน้า Listing"
          on={listing.enableHomeBar}
          onToggle={() => patch({ enableHomeBar: !listing.enableHomeBar })}
        />
        {listing.enableHomeBar ? (
          <Field label="สไตล์บาร์หน้าแรก">
            <p className="help" style={{ marginTop: 0 }}>
              ใช้ตอนฝังบนฮีโร่หน้าแรก เลือกคนละแบบกับหน้าเต็มได้
            </p>
            <BarStylePicker
              value={listing.homeBarStyle}
              onChange={(homeBarStyle) => patch({ homeBarStyle })}
            />
          </Field>
        ) : null}
      </Section>

      <Section
        title="ตัวกรองเพิ่มเติมบนหน้าเต็ม"
        help="มีเฉพาะหน้า Listing เต็ม หลังปุ่ม “ตัวกรองเพิ่มเติม” ไม่โชว์บนบาร์หน้าแรกถ้าเปิดฝังไว้"
      >
        <div className="checklist">
          {filters.map((filter) => {
            const onPrimary = listing.primaryFilters.includes(filter.id);
            return (
              <label className="check" key={filter.id}>
                <input
                  type="checkbox"
                  checked={listing.extraFilters.includes(filter.id)}
                  disabled={onPrimary}
                  onChange={() => toggleExtra(filter.id)}
                />
                {filter.label}
                {onPrimary ? " · อยู่บนบาร์หลักแล้ว" : ""}
              </label>
            );
          })}
        </div>
      </Section>

      <Section
        title="เลย์เอาต์หน้ารายการ"
        help="ใช้เฉพาะหน้า Listing เต็ม บาร์หน้าแรกถ้าเปิดจะฝังได้แค่แถวค้นหา ไม่ดึงการ์ด"
      >
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
        <div
          id="listing-view-toggle"
          className={`setting-anchor${highlightViewToggle ? " is-highlight" : ""}`}
        >
          <SwitchRow
            label="ให้สลับ Grid / List บนเดสก์ท็อป"
            impact="มีปุ่มตารางและรายการบนหน้ารายการ เมื่อเปิดแล้วไปตั้งแถวข้อมูลแบบลิสต์ได้ที่แท็บ Card มือถือยังเป็นแถวเดียว"
            on={listing.allowViewToggle}
            onToggle={() =>
              patch({ allowViewToggle: !listing.allowViewToggle })
            }
          />
        </div>
        {listing.allowViewToggle ? (
          <Field label="มุมมองเริ่มต้น">
            <div className="icon-mode-toggle">
              {(
                [
                  ["grid", "ตาราง"],
                  ["list", "รายการ"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={
                    (listing.defaultView ?? "grid") === value ? "active" : ""
                  }
                  onClick={() => patch({ defaultView: value as ListingView })}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="help">Grid ใช้จำนวนคอลัมน์ที่ตั้งไว้ List เป็นแถวเดียว รูปซ้ายข้อความขวา</p>
          </Field>
        ) : null}
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
          <p className="help">ตัวอย่างแบ่งหน้าละ 3 รายการ เลือกแล้วพรีวิวจะตัดรายการตามนั้น</p>
        </Field>
      </Section>

      <Section
        title="บนมือถือ"
        help="เดสก์ท็อปยังใช้ค่าเดิม สลับพรีวิวเป็น Mobile เพื่อดูของที่ซ่อน คอลัมน์บนมือถือเป็น 1 ตลอด"
      >
        <MobileHideChecks
          mobile={settings.mobile}
          onChange={(mobile) => onChange({ ...settings, mobile })}
          items={[
            {
              key: "hideHomeBar",
              label: "ซ่อนบาร์หน้าแรก",
              available: listing.enableHomeBar,
            },
            {
              key: "hideExtraFilters",
              label: "ซ่อนตัวกรองเพิ่มเติม",
              available: listing.extraFilters.length > 0,
            },
          ]}
        />
      </Section>
    </>
  );
}

export function CardSettings({
  settings,
  config,
  onChange,
  onGoToListing,
}: {
  settings: DisplaySettings;
  config: ContentTypeConfig;
  onChange: (next: DisplaySettings) => void;
  onGoToListing?: () => void;
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
  const priceName = config.priceLabel.split(" / ")[0];
  const categoryName = config.categoryLabel.split(" / ")[0];
  const locationName = config.locationLabel.split(" / ")[0];
  const listMetaLayout = card.listMetaLayout === "stack" ? "stack" : "inline";
  const canSetListMeta = Boolean(settings.listing.allowViewToggle);
  const showListMetaSetting =
    card.showCategory || card.showLocation || card.showPrice;

  return (
    <>
      <Section
        title="Card Layout"
        help="รูปแบบการ์ดเดียวกันใช้ได้กับ Job, บทความ, Product และ Download โดยเปิด-ปิด Field ตามประเภทเนื้อหา"
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
            "รูปอยู่ด้านบน ข้อความด้านล่าง — เหมาะกับบทความและสินค้า"}
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
            value={card.emptyImage === "hide" ? "hide" : "default"}
            onChange={(e) =>
              patch({
                emptyImage: e.target.value as DisplaySettings["card"]["emptyImage"],
              })
            }
            disabled={!card.showThumbnail || card.layout === "none"}
          >
            <option value="hide">ซ่อนพื้นที่รูป</option>
            <option value="default">ใช้รูป Default</option>
          </select>
          <p className="help">ใช้เมื่อรายการนั้นยังไม่มี Cover</p>
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
        {card.showCategory || card.showLocation || card.showPrice ? (
          <>
            {card.showCategory ? (
              <Field label={`ไอคอน${config.categoryLabel.split(" / ")[0]}`}>
                <IconSourcePicker
                  value={card.categoryIcon}
                  defaultSrc={defaultCategoryIconSrc(config.id)}
                  onChange={(categoryIcon) => patch({ categoryIcon })}
                />
              </Field>
            ) : null}
            {card.showLocation ? (
              <Field label={`ไอคอน${config.locationLabel.split(" / ")[0]}`}>
                <IconSourcePicker
                  value={card.locationIcon}
                  defaultSrc={defaultLocationIconSrc(config.id)}
                  onChange={(locationIcon) => patch({ locationIcon })}
                />
              </Field>
            ) : null}
            {card.showPrice ? (
              <Field label={`ไอคอน${config.priceLabel.split(" / ")[0]}`}>
                <IconSourcePicker
                  value={card.priceIcon}
                  defaultSrc={defaultPriceIconSrc(card.meta1.source)}
                  onChange={(priceIcon) => patch({ priceIcon })}
                />
              </Field>
            ) : null}
            {showListMetaSetting ? (
              <Field label="แถวข้อมูลตอนดูแบบรายการ">
                <div
                  className={`seg cols-2${canSetListMeta ? "" : " is-disabled"}`}
                >
                  {(
                    [
                      ["inline", `${priceName}ชิดขวาบน`],
                      ["stack", "เรียงลงทางซ้าย"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      disabled={!canSetListMeta}
                      className={`seg-btn${listMetaLayout === value ? " active" : ""}`}
                      onClick={() =>
                        patch({ listMetaLayout: value as ListMetaLayout })
                      }
                    >
                      <div className={`mini-list-meta layout-${value}`}>
                        <div className="mini-list-copy">
                          <div className="mini-line title" />
                          {value === "stack" ? (
                            <>
                              <div className="mini-line meta" />
                              <div className="mini-line meta short" />
                              <div className="mini-line meta accent" />
                            </>
                          ) : (
                            <div className="mini-line meta" />
                          )}
                        </div>
                        {value === "inline" ? (
                          <div className="mini-line price top" />
                        ) : null}
                      </div>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <p className="help">
                  {canSetListMeta
                    ? listMetaLayout === "stack"
                      ? `${categoryName} ${locationName} และ${priceName}อยู่ทางซ้าย เรียงลงทีละบรรทัด`
                      : `${priceName}อยู่ขวาบนคู่กับชื่อ ${categoryName}กับ${locationName}อยู่บรรทัดเดียวใต้ชื่อ`
                    : (
                      <>
                        เปิด “ให้สลับ Grid / List บนเดสก์ท็อป” ก่อน จึงจะตั้งค่านี้ได้
                        {onGoToListing ? (
                          <>
                            {" "}
                            <button
                              type="button"
                              className="help-link"
                              onClick={onGoToListing}
                            >
                              ไปแท็บหน้ารายการ
                            </button>
                          </>
                        ) : null}
                      </>
                    )}
                </p>
              </Field>
            ) : null}
          </>
        ) : null}
        <SwitchRow
          label={config.statusLabel}
          impact="ป้ายเขียวมุมซ้ายบนของรูป เช่น เปิดรับสมัคร / Featured / ยอดนิยม ถ้าไม่โชว์รูปจะอยู่ในการ์ด"
          on={card.showStatus}
          onToggle={() => patch({ showStatus: !card.showStatus })}
        />
        <SwitchRow
          label="ดูรายละเอียด"
          impact="มีจุดกดไปหน้ารายละเอียดบนการ์ด การ์ดทั้งใบกดได้อยู่แล้ว"
          on={card.showCta}
          onToggle={() => patch({ showCta: !card.showCta })}
        />
        {card.showCta ? (
          <>
            <Field label="รูปแบบ">
              <div className="seg">
                {(
                  [
                    ["link", "ลิงก์", "ข้อความสีธีม ไม่มีกรอบ"],
                    ["button", "ปุ่ม", "ปุ่มทึบพร้อมข้อความ"],
                    ["icon", "ไอคอน", "ไอคอนอย่างเดียว ไม่มีข้อความ"],
                  ] as const
                ).map(([value, label, hint]) => (
                  <button
                    key={value}
                    type="button"
                    className={`seg-btn${(card.ctaStyle ?? "link") === value ? " active" : ""}`}
                    onClick={() => patch({ ctaStyle: value as CtaStyle })}
                  >
                    <span>{label}</span>
                    <small>{hint}</small>
                  </button>
                ))}
              </div>
            </Field>
            {card.ctaStyle !== "icon" ? (
              <Field label="ข้อความ">
                <input
                  value={card.ctaLabel}
                  onChange={(e) => patch({ ctaLabel: e.target.value })}
                />
              </Field>
            ) : (
              <p className="help">โชว์เฉพาะไอคอน ไม่มีข้อความ เช่น ปุ่มดาวน์โหลดบนการ์ดไฟล์</p>
            )}
            <Field label="ไอคอนปุ่ม">
              <IconSourcePicker
                value={card.ctaIcon}
                onChange={(ctaIcon) => patch({ ctaIcon })}
              />
              <p className="help">
                ค่าเริ่มต้นของการ์ดดาวน์โหลดเป็นไอคอนดาวน์โหลดหน้าข้อความ ถ้าอัปโหลดเองจะอยู่หลังคำ
              </p>
            </Field>
          </>
        ) : null}
      </Section>

      <details className="advanced-fold">
        <summary>ตั้งค่าขั้นสูง — แมปชื่อฟิลด์บนการ์ด</summary>
        <p className="help">
          ส่วนนี้สำหรับกรณีที่ป้ายบนการ์ดต้องชี้ไปข้อมูลคนละช่อง เช่น แสดงวันที่แทนราคา
        </p>
        <div className="subcard">
          <div className="mini-title">เมื่อเปิด {config.priceLabel}</div>
          <Field label="ดึงค่าจาก">
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
          <Field label="ป้ายที่แสดง">
            <input
              value={card.meta1.label}
              onChange={(e) =>
                patch({ meta1: { ...card.meta1, label: e.target.value } })
              }
            />
          </Field>
        </div>
        <div className="subcard">
          <div className="mini-title">เมื่อเปิด {config.categoryLabel}</div>
          <Field label="ดึงค่าจาก">
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
          <Field label="ป้ายที่แสดง">
            <input
              value={card.meta2.label}
              onChange={(e) =>
                patch({ meta2: { ...card.meta2, label: e.target.value } })
              }
            />
          </Field>
        </div>
      </details>

      <Section
        title="บนมือถือ"
        help="ซ่อนเฉพาะบนมือถือ ของที่ปิดอยู่บนเดสก์ท็อปอยู่แล้วจะไม่โชว์ที่นี่ สลับพรีวิวเป็น Mobile เพื่อดูผล"
      >
        <MobileHideChecks
          mobile={settings.mobile}
          onChange={(mobile) => onChange({ ...settings, mobile })}
          items={[
            {
              key: "hideThumbnail",
              label: "ซ่อนรูป",
              available: card.showThumbnail && card.layout !== "none",
            },
            {
              key: "hideDescription",
              label: "ซ่อนคำอธิบาย",
              available: card.showDescription,
            },
            {
              key: "hideCategory",
              label: `ซ่อน${config.categoryLabel.split(" / ")[0]}`,
              available: card.showCategory,
            },
            {
              key: "hideLocation",
              label: `ซ่อน${config.locationLabel.split(" / ")[0]}`,
              available: card.showLocation,
            },
            {
              key: "hidePrice",
              label: `ซ่อน${config.priceLabel.split(" / ")[0]}`,
              available: card.showPrice,
            },
            {
              key: "hideStatus",
              label: "ซ่อนสถานะ",
              available: card.showStatus,
            },
            {
              key: "hideCta",
              label: "ซ่อนปุ่มดูรายละเอียด",
              available: card.showCta,
            },
          ]}
        />
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
      title="หน้ารายละเอียด"
      help="เมื่อผู้เข้าชมคลิกการ์ด จะเห็นหน้านี้ตามสวิตช์ด้านล่าง"
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
      {showJobBlocks ? (
        <Field label="ตำแหน่งปุ่ม">
          <div className="icon-mode-toggle">
            {(
              [
                ["bottom", "ด้านล่าง"],
                ["topRight", "ด้านบนขวา"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  (detail.ctaPosition ?? "bottom") === value ? "active" : ""
                }
                onClick={() =>
                  patch({ ctaPosition: value as DetailCtaPosition })
                }
              >
                {label}
              </button>
            ))}
          </div>
          <p className="help">
            ด้านบนขวาอยู่แถวเดียวกับหัวข้อและแท็ก ปุ่มชิดขวาแบบหน้ารายละเอียดงาน
          </p>
        </Field>
      ) : null}
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
