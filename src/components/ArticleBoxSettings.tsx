import {
  AppstoreOutlined,
  FontSizeOutlined,
  LinkOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Input, InputNumber, Select, Switch } from "antd";
import { ARTICLE_CATEGORIES, t } from "../data/articles";
import type {
  ArticleBoxSettings,
  ArticleCtaStyle,
  ArticleDisplayMode,
  ArticleGridColumns,
  ArticleHeaderAlign,
  ArticleLayout,
  ArticleLocale,
  ArticleSort,
  ArticleViewAllPosition,
} from "../types";

type Tab = "content" | "look" | "header";

const HINT: Record<Tab, { title: string; body: string }> = {
  content: {
    title: "เลือกบทความที่จะโชว์",
    body: "กำหนดแหล่งที่มา ลำดับ และแท็บกรองบนหน้าเว็บ — ดูผลทันทีทางขวา",
  },
  look: {
    title: "จัดหน้าตาการ์ด",
    body: "เลือกรูปแบบตาราง/รายการ จำนวนที่เห็นต่อหน้า และข้อมูลบนการ์ดแต่ละใบ",
  },
  header: {
    title: "ส่วนหัวของกล่อง",
    body: "หัวข้อ คำอธิบาย และปุ่มดูทั้งหมดอยู่ด้วยกัน เพราะตำแหน่งสัมพันธ์กัน",
  },
};

function patchCopy(
  settings: ArticleBoxSettings,
  key: keyof Pick<
    ArticleBoxSettings,
    "ctaLabel" | "headerTitle" | "headerDescription" | "viewAllLabel"
  >,
  locale: ArticleLocale,
  value: string,
): ArticleBoxSettings {
  return { ...settings, [key]: { ...settings[key], [locale]: value } };
}

function SettingBlock({
  icon,
  title,
  description,
  extra,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="abox-block">
      <div className="abox-block-head">
        <div className="abox-block-icon">{icon}</div>
        <div className="abox-block-copy">
          <h4>{title}</h4>
          {description ? <p>{description}</p> : null}
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
      {hint ? <p className="abox-note" style={{ marginTop: 6 }}>{hint}</p> : null}
    </div>
  );
}

function HiddenNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="abox-hidden-notice">
      <span>ซ่อนอยู่</span>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function ArticleBoxSettings({
  settings,
  tab,
  locale,
  onChange,
}: {
  settings: ArticleBoxSettings;
  tab: Tab;
  locale: ArticleLocale;
  onChange: (next: ArticleBoxSettings) => void;
}) {
  const hint = HINT[tab];
  const patch = (partial: Partial<ArticleBoxSettings>) => onChange({ ...settings, ...partial });
  const lang = locale === "th" ? "ไทย" : "English";

  return (
    <aside className="settings abox-settings">
      <div className="abox-hint">
        <div>
          <strong>{hint.title}</strong>
          <span>{hint.body}</span>
        </div>
      </div>

      {tab === "content" ? (
        <>
          <SettingBlock
            icon={<UnorderedListOutlined />}
            title="แหล่งบทความ"
            description="เลือกหมวดที่จะดึงมาแสดง และลำดับบนหน้าเว็บ"
          >
            <div className="abox-fields abox-source-stack">
              <Field label="บทความมาจากไหน">
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="ทุกหมวดหมู่"
                  value={settings.sourceCategories}
                  onChange={(value) => patch({ sourceCategories: value })}
                  maxTagCount="responsive"
                  style={{ width: "100%" }}
                  options={ARTICLE_CATEGORIES.map((category) => ({
                    value: category,
                    label: category,
                  }))}
                />
                <p className="abox-note" style={{ marginTop: 6 }}>
                  ไม่เลือกหมวด = แสดงบทความจากทุกหมวดหมู่
                </p>
              </Field>
              <Field label="เรียงลำดับ">
                <Select
                  value={settings.sort}
                  onChange={(value) => patch({ sort: value as ArticleSort })}
                  style={{ width: "100%" }}
                  options={[
                    { value: "latest", label: "ล่าสุดก่อน" },
                    { value: "oldest", label: "เก่าสุดก่อน" },
                    { value: "title", label: "ตามชื่อเรื่อง" },
                  ]}
                />
              </Field>
            </div>
          </SettingBlock>

          <SettingBlock
            icon={<AppstoreOutlined />}
            title="แท็บกรองตามหมวดหมู่"
            description="ให้ผู้เข้าชมกดกรองบทความได้จากหน้าเว็บ"
            extra={
              <Switch
                checked={settings.showFilterTabs}
                onChange={(checked) => patch({ showFilterTabs: checked })}
              />
            }
          >
            {settings.showFilterTabs ? (
              <div className="abox-fields">
                <div className="abox-switch-row">
                  <div>
                    <label>มีแท็บ “ทั้งหมด”</label>
                    <small>โชว์ทุกบทความในกล่องนี้ก่อนกรอง</small>
                  </div>
                  <Switch
                    checked={settings.showAllTab}
                    onChange={(checked) => patch({ showAllTab: checked })}
                  />
                </div>
              </div>
            ) : (
              <HiddenNotice
                title="ไม่แสดงแท็บกรอง"
                description="กล่องจะแสดงบทความตามแหล่งที่เลือก โดยไม่มีแท็บหมวดหมู่ให้ผู้เข้าชมกดกรอง"
              />
            )}
          </SettingBlock>
        </>
      ) : null}

      {tab === "look" ? (
        <>
          <SettingBlock
            icon={<AppstoreOutlined />}
            title="รูปแบบ Layout"
            description="เลือกรูปแบบการจัดวางบทความภายในกล่อง"
          >
            <div className="abox-choices">
              {(
                [
                  ["grid", "ตาราง", "เลือกได้ 3 หรือ 4 คอลัมน์"],
                  ["list", "รายการแนวนอน", "รูปซ้าย ข้อความขวา"],
                  ["featured", "เด่น + กริด", "บทความแรกใหญ่ ที่เหลือเล็ก"],
                ] as const
              ).map(([value, label, hintText]) => (
                <button
                  key={value}
                  type="button"
                  className={`abox-choice${settings.layout === value ? " active" : ""}`}
                  onClick={() => patch({ layout: value as ArticleLayout })}
                >
                  <div className={`abox-wire abox-wire-${value}`}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <strong>{label}</strong>
                  <small>{hintText}</small>
                </button>
              ))}
            </div>
            {settings.layout === "grid" ? (
              <div className="abox-fields" style={{ marginTop: 12 }}>
                <Field label="จำนวนคอลัมน์">
                  <div className="abox-column-options">
                    {(
                      [
                        [3, "Grid 3", "อ่านง่าย"],
                        [4, "Grid 4", "โชว์แน่นขึ้น"],
                      ] as const
                    ).map(([value, label, hintText]) => (
                      <button
                        key={value}
                        type="button"
                        className={`abox-column-btn${settings.columns === value ? " active" : ""}`}
                        onClick={() => patch({ columns: value as ArticleGridColumns })}
                      >
                        <div className={`abox-column-wire abox-wire-grid abox-wire-grid-${value}`}>
                          {Array.from({ length: value }, (_, index) => (
                            <span key={index} />
                          ))}
                        </div>
                        <div>
                          <span>{label}</span>
                          <small>{hintText}</small>
                        </div>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            ) : null}
          </SettingBlock>

          <SettingBlock
            icon={<UnorderedListOutlined />}
            title="จำนวนและการเลื่อนดู"
            description="กำหนดจำนวนบทความที่ดึงมา และวิธีให้ผู้ใช้ดูเพิ่ม"
          >
            <div className="abox-fields two abox-display-mode-row">
              <Field label="จำนวนบทความสูงสุด">
                <InputNumber
                  min={1}
                  max={12}
                  value={settings.maxItems}
                  onChange={(value) => patch({ maxItems: Number(value) || 1 })}
                  style={{ width: "100%" }}
                />
              </Field>
              <Field
                label="โหมดแสดงผล"
                hint={
                  settings.displayMode === "carousel" &&
                  settings.layout === "grid" &&
                  settings.maxItems <= settings.columns
                    ? `เพิ่มจำนวนมากกว่า ${settings.columns} ถึงจะเลื่อน Carousel ได้`
                    : settings.displayMode === "carousel" &&
                        settings.layout !== "grid" &&
                        settings.maxItems <= 3
                      ? "เพิ่มจำนวนมากกว่า 3 ถึงจะเลื่อน Carousel ได้"
                      : undefined
                }
              >
                <Select
                  value={settings.displayMode}
                  onChange={(value) => patch({ displayMode: value as ArticleDisplayMode })}
                  style={{ width: "100%" }}
                  options={[
                    { value: "carousel", label: "เลื่อนแบบ Carousel" },
                    { value: "pagination", label: "แบ่งหน้า" },
                  ]}
                />
              </Field>
            </div>
          </SettingBlock>

          <SettingBlock
            icon={<FontSizeOutlined />}
            title="ข้อมูลบนการ์ด"
            description="เลือกข้อมูลเสริมที่จะแสดงบนการ์ดแต่ละใบ"
          >
            <div className="abox-extras">
              {(
                [
                  ["showCategoryBadge", "Badge หมวดหมู่", "ป้ายหมวดมุมรูปปก"],
                  ["showPublishedAt", "วันที่เผยแพร่", "อยู่เหนือหัวข้อบทความ"],
                  ["showExcerpt", "คำโปรยใต้หัวข้อ", "ข้อความย่อใต้หัวข้อ"],
                ] as const
              ).map(([key, label, impact]) => (
                <div key={key} className={`abox-extra${settings[key] ? " on" : ""}`}>
                  <div>
                    <label>{label}</label>
                    <small style={{ display: "block", color: "var(--muted)" }}>{impact}</small>
                  </div>
                  <Switch
                    checked={settings[key]}
                    onChange={(checked) => patch({ [key]: checked })}
                  />
                </div>
              ))}
            </div>
          </SettingBlock>

          <SettingBlock
            icon={<LinkOutlined />}
            title="ปุ่มบนการ์ด"
            description="ปุ่มต่อบทความ เช่น อ่านต่อ"
            extra={
              <Switch
                checked={settings.showCta}
                onChange={(checked) => patch({ showCta: checked })}
              />
            }
          >
            {settings.showCta ? (
              <div className="abox-fields">
                <p className="abox-lang-note">กำลังแก้ข้อความภาษา{lang} — สลับภาษาได้ที่มุมบนขวา</p>
                <div className="abox-fields two">
                  <Field label="รูปแบบ">
                    <Select
                      value={settings.ctaStyle}
                      onChange={(value) => patch({ ctaStyle: value as ArticleCtaStyle })}
                      options={[
                        { value: "link", label: "ลิงก์ข้อความ" },
                        { value: "button", label: "ปุ่มทึบ" },
                      ]}
                    />
                  </Field>
                  <Field label="ข้อความปุ่ม">
                    <Input
                      value={t(settings.ctaLabel, locale)}
                      onChange={(event) =>
                        onChange(patchCopy(settings, "ctaLabel", locale, event.target.value))
                      }
                    />
                  </Field>
                </div>
              </div>
            ) : (
              <HiddenNotice
                title="ไม่แสดงปุ่มบนการ์ด"
                description="การ์ดจะไม่มีปุ่มอ่านต่อ แต่ยังใช้การกดที่ตัวการ์ดเพื่อไปหน้าบทความได้"
              />
            )}
          </SettingBlock>
        </>
      ) : null}

      {tab === "header" ? (
        <>
          <SettingBlock
            icon={<FontSizeOutlined />}
            title="ส่วนหัว"
            description="หัวข้อและคำอธิบายเหนือกล่องบทความ"
            extra={
              <Switch
                checked={settings.showHeader}
                onChange={(checked) => {
                  const showHeader = checked;
                  patch({
                    showHeader,
                    viewAllPosition:
                      !showHeader && settings.viewAllPosition === "headerRight"
                        ? "bottomCenter"
                        : settings.viewAllPosition,
                  });
                }}
              />
            }
          >
            {settings.showHeader ? (
              <div className="abox-fields">
                <p className="abox-lang-note">กำลังแก้ข้อความภาษา{lang} — สลับภาษาได้ที่มุมบนขวา</p>
                <Field label="หัวข้อ">
                  <Input
                    value={t(settings.headerTitle, locale)}
                    onChange={(event) =>
                      onChange(patchCopy(settings, "headerTitle", locale, event.target.value))
                    }
                  />
                </Field>
                <Field label="คำอธิบาย">
                  <Input
                    value={t(settings.headerDescription, locale)}
                    placeholder="ไม่บังคับ"
                    onChange={(event) =>
                      onChange(
                        patchCopy(settings, "headerDescription", locale, event.target.value),
                      )
                    }
                  />
                </Field>
                <Field label="ตำแหน่งส่วนหัว">
                  <div className="abox-align">
                    {(
                      [
                        ["left", "ชิดซ้าย"],
                        ["center", "จัดกลาง"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={`abox-align-btn${settings.headerAlign === value ? " active" : ""}`}
                        onClick={() => patch({ headerAlign: value as ArticleHeaderAlign })}
                      >
                        <div className={`abox-mini-head ${value}`}>
                          <div className="abox-mini-line" />
                          <div className="abox-mini-line" />
                        </div>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            ) : (
              <HiddenNotice
                title="ไม่แสดงส่วนหัว"
                description="กล่องจะเริ่มที่แท็บกรองหรือการ์ดบทความทันที โดยไม่มีหัวข้อและคำอธิบายด้านบน"
              />
            )}
          </SettingBlock>

          <SettingBlock
            icon={<LinkOutlined />}
            title={'ปุ่ม “ดูทั้งหมด”'}
            description="ลิงก์ไปหน้ารวมบทความ"
            extra={
              <Switch
                checked={settings.showViewAll}
                onChange={(checked) => patch({ showViewAll: checked })}
              />
            }
          >
            {settings.showViewAll ? (
              <div className="abox-fields">
                <p className="abox-lang-note">กำลังแก้ข้อความภาษา{lang} — สลับภาษาได้ที่มุมบนขวา</p>
                <div className="abox-fields two">
                  <Field label="ข้อความปุ่ม">
                    <Input
                      value={t(settings.viewAllLabel, locale)}
                      onChange={(event) =>
                        onChange(patchCopy(settings, "viewAllLabel", locale, event.target.value))
                      }
                    />
                  </Field>
                  <Field label="ลิงก์">
                    <Input
                      value={settings.viewAllLink}
                      placeholder="/articles"
                      onChange={(event) => patch({ viewAllLink: event.target.value })}
                    />
                  </Field>
                </div>
                <Field label="ตำแหน่งปุ่ม">
                  <div className="abox-align">
                    {(
                      [
                        ["headerRight", "บนขวาของหัวข้อ", settings.showHeader],
                        ["bottomCenter", "กลางด้านล่าง", true],
                      ] as const
                    ).map(([value, label, enabled]) => (
                      <button
                        key={value}
                        type="button"
                        className={`abox-align-btn${settings.viewAllPosition === value ? " active" : ""}`}
                        disabled={!enabled}
                        onClick={() =>
                          enabled && patch({ viewAllPosition: value as ArticleViewAllPosition })
                        }
                        style={enabled ? undefined : { opacity: 0.45, cursor: "not-allowed" }}
                      >
                        <div className={`abox-mini-view ${value === "headerRight" ? "header-right" : "bottom"}`}>
                          <div className="abox-mini-line" style={{ width: value === "headerRight" ? "42%" : "36%" }} />
                          <div className="abox-mini-chip" />
                        </div>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                  {!settings.showHeader ? (
                    <p className="abox-note" style={{ marginTop: 8 }}>
                      ปิดส่วนหัวแล้ว ปุ่มจะอยู่กลางด้านล่างอัตโนมัติ
                    </p>
                  ) : null}
                </Field>
              </div>
            ) : (
              <HiddenNotice
                title="ไม่แสดงปุ่มดูทั้งหมด"
                description="ผู้เข้าชมจะเห็นเฉพาะบทความในกล่องนี้ โดยไม่มีลิงก์ไปหน้ารวมบทความ"
              />
            )}
          </SettingBlock>
        </>
      ) : null}
    </aside>
  );
}

export type ArticleSettingsTab = Tab;
