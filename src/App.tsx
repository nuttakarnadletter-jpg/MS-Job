import { useMemo, useState } from "react";
import {
  CardSettings,
  DetailSettings,
  ListingSettings,
  SeoSettings,
} from "./components/SettingsPanels";
import { LivePreview } from "./components/LivePreview";
import {
  CONTENT_TYPES,
  SAMPLE_ITEMS,
  createDefaultSettings,
} from "./data/content";
import type {
  ContentTypeId,
  DevicePreview,
  DisplaySettings,
  PreviewMode,
  SettingsTab,
} from "./types";
import "./styles.css";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "listing", label: "Listing" },
  { id: "card", label: "Card" },
  { id: "detail", label: "Detail" },
  { id: "seo", label: "SEO" },
];

const IMPACT_COPY: Record<SettingsTab, { title: string; body: string }> = {
  listing: {
    title: "กำลังตั้งค่าหน้า Listing",
    body: "ค้นหา Filter จำนวนคอลัมน์ และการแบ่งหน้า — ดูผลทางขวาได้ทันที",
  },
  card: {
    title: "กำลังตั้งค่า Card",
    body: "เปิด-ปิด Thumbnail Title Description และข้อมูลอื่นบนการ์ด รวมถึงเลือก Media Top / Horizontal / No Media",
  },
  detail: {
    title: "กำลังตั้งค่า Detail Page",
    body: "สลับ Preview เป็น Detail เพื่อดูว่าเมื่อคลิกการ์ดแล้วผู้ใช้จะเห็นอะไร",
  },
  seo: {
    title: "กำลังตั้งค่า SEO & Publishing",
    body: "Title Slug Meta Description และการเผยแพร่ — ดูตัวอย่างผลการค้นหาด้านล่าง Preview",
  },
};

export default function App() {
  const [settings, setSettings] = useState<DisplaySettings>(() =>
    createDefaultSettings("job"),
  );
  const [tab, setTab] = useState<SettingsTab>("listing");
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [mode, setMode] = useState<PreviewMode>("listing");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const config = CONTENT_TYPES[settings.contentType];
  const items = useMemo(
    () => SAMPLE_ITEMS[settings.contentType],
    [settings.contentType],
  );

  const switchContentType = (type: ContentTypeId) => {
    setSettings(createDefaultSettings(type));
    setMode("listing");
    setSelectedId(null);
    setTab("listing");
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const impact = IMPACT_COPY[tab];

  return (
    <div className="app">
      <header className="topbar">
        <div className="top-left">
          <div className="brand">readyplanet CMS</div>
          <div className="crumb">{config.crumb}</div>
        </div>

        <div className="type-switch" aria-label="Content type">
          {(Object.keys(CONTENT_TYPES) as ContentTypeId[]).map((type) => (
            <button
              key={type}
              type="button"
              className={settings.contentType === type ? "active" : ""}
              onClick={() => switchContentType(type)}
            >
              {CONTENT_TYPES[type].label}
            </button>
          ))}
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn"
            onClick={() => {
              setMode("listing");
              showToast("เปิด Preview หน้า Listing แล้ว");
            }}
          >
            Preview Website
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() =>
              showToast(
                settings.seo.published
                  ? "บันทึกและเผยแพร่การตั้งค่าแล้ว"
                  : "บันทึกเป็น Draft แล้ว",
              )
            }
          >
            Save & Publish
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="settings">
          <div className="page-title">
            <h1>Front-end Display Builder</h1>
            <p>
              กำหนดว่าข้อมูลจาก CMS จะถูกนำไปแสดงบนหน้าบ้านอย่างไร โดยใช้
              Universal Content Listing ชุดเดียวกับ Job, Blog, News, Product และ
              Download — ไม่ต้องแก้โครงสร้างหน้าใหม่ทุกครั้ง
            </p>
          </div>

          <label className="field" style={{ marginTop: 0 }}>
            <span style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6, fontWeight: 600 }}>
              Content Type
            </span>
            <select
              value={settings.contentType}
              onChange={(e) =>
                switchContentType(e.target.value as ContentTypeId)
              }
            >
              {(Object.keys(CONTENT_TYPES) as ContentTypeId[]).map((type) => (
                <option key={type} value={type}>
                  {CONTENT_TYPES[type].label} — {CONTENT_TYPES[type].pageName}
                </option>
              ))}
            </select>
          </label>

          <div className="impact-banner">
            <div className="icon" aria-hidden>
              i
            </div>
            <div>
              <strong>{impact.title}</strong>
              <span>{impact.body}</span>
            </div>
          </div>

          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tab${tab === t.id ? " active" : ""}`}
                onClick={() => {
                  setTab(t.id);
                  if (t.id === "detail") {
                    setMode("detail");
                    if (!selectedId) setSelectedId(items[0]?.id ?? null);
                  }
                  if (t.id === "listing" || t.id === "card") {
                    setMode("listing");
                  }
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "listing" ? (
            <ListingSettings
              settings={settings}
              config={config}
              onChange={setSettings}
            />
          ) : null}
          {tab === "card" ? (
            <CardSettings
              settings={settings}
              config={config}
              onChange={setSettings}
            />
          ) : null}
          {tab === "detail" ? (
            <DetailSettings
              settings={settings}
              config={config}
              onChange={setSettings}
            />
          ) : null}
          {tab === "seo" ? (
            <SeoSettings settings={settings} onChange={setSettings} />
          ) : null}
        </aside>

        <LivePreview
          settings={settings}
          items={items}
          device={device}
          mode={mode}
          selectedId={selectedId}
          onDeviceChange={setDevice}
          onModeChange={setMode}
          onSelect={setSelectedId}
        />
      </div>

      {toast ? <div className="save-toast">{toast}</div> : null}
    </div>
  );
}
