import { useMemo, useState } from "react";
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileOutlined,
  FireOutlined,
  GiftOutlined,
  GlobalOutlined,
  HolderOutlined,
  InboxOutlined,
  LayoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined,
  PicCenterOutlined,
  PictureOutlined,
  PlaySquareOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  App as AntdApp,
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
} from "antd";
import type { MenuProps, TableColumnsType } from "antd";
import {
  CardSettings,
  DetailSettings,
  ListingSettings,
  SeoSettings,
} from "./components/SettingsPanels";
import { LivePreview } from "./components/LivePreview";
import { BodyEditor } from "./components/BodyEditor";
import {
  CONTENT_TYPES,
  SAMPLE_ITEMS,
  createBlankItem,
  createDefaultSettings,
  applyContentType,
} from "./data/content";
import type {
  ClickAction,
  ContentItem,
  ContentTypeId,
  DevicePreview,
  DisplaySettings,
  PreviewMode,
  SettingsTab,
} from "./types";
import "./styles.css";
import "./cms-shell.css";

const { Header, Sider, Content } = Layout;

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "listing", label: "หน้ารายการ" },
  { id: "card", label: "การ์ด" },
  { id: "detail", label: "หน้ารายละเอียด" },
  { id: "seo", label: "SEO" },
];

const MENU_ITEMS: MenuProps["items"] = [
  { key: "Grid Card", icon: <AppstoreOutlined />, label: "Grid Card" },
  { key: "Header", icon: <LayoutOutlined />, label: "Header" },
  { key: "Horizontal Card", icon: <PicCenterOutlined />, label: "Horizontal Card" },
  { key: "Media Ads", icon: <PlaySquareOutlined />, label: "Media Ads" },
  { key: "Navigation Bar", icon: <OrderedListOutlined />, label: "Navigation Bar" },
  { key: "Product Show Boxes", icon: <InboxOutlined />, label: "Product Show Boxes" },
  { key: "Promotion Shelf", icon: <GiftOutlined />, label: "Promotion Shelf" },
  { key: "Shortcut", icon: <ThunderboltOutlined />, label: "Shortcut" },
  { key: "Step Information", icon: <OrderedListOutlined />, label: "Step Information" },
  { key: "Web Editor", icon: <EditOutlined />, label: "Web Editor" },
  { key: "Search Listing", icon: <SearchOutlined />, label: "Search Listing" },
  { key: "Flash Sale", icon: <FireOutlined />, label: "Flash Sale" },
  { key: "Flash Sale Shelf", icon: <FireOutlined />, label: "Flash Sale Shelf" },
  { key: "Branch", icon: <EnvironmentOutlined />, label: "Branch" },
  { type: "divider" },
  { key: "Customers", icon: <TeamOutlined />, label: "Customers" },
  { key: "Products", icon: <ShoppingOutlined />, label: "Products" },
];

type SearchListing = {
  id: string;
  name: string;
  title: string;
  description: string;
  contentType: ContentTypeId;
  createdAt: string;
  updatedAt: string;
};

const TYPE_TAG_COLOR: Record<ContentTypeId, string> = {
  job: "blue",
  blog: "purple",
  product: "green",
  download: "cyan",
};

const SEARCH_LISTINGS: SearchListing[] = [
  {
    id: "sl-1",
    name: "ประกาศรับสมัครงาน",
    title: "Open Positions",
    description: "มาร่วมเติบโตไปกับเรา ค้นหาตำแหน่งงานที่เหมาะกับทักษะและความสนใจของคุณ",
    contentType: "job",
    createdAt: "2026-06-19 16:55",
    updatedAt: "2026-07-29 11:32",
  },
  {
    id: "sl-2",
    name: "บทความบริษัท",
    title: "Insights & Stories",
    description: "บทความ แนวคิด และเรื่องราวจากทีม Readyplanet",
    contentType: "blog",
    createdAt: "2026-06-18 10:12",
    updatedAt: "2026-07-28 09:40",
  },
  {
    id: "sl-3",
    name: "ข่าวสารและกิจกรรม",
    title: "ข่าวสารล่าสุด",
    description: "อัปเดตข่าวประกาศและกิจกรรมจาก Readyplanet",
    contentType: "blog",
    createdAt: "2026-06-17 11:55",
    updatedAt: "2026-07-27 14:18",
  },
  {
    id: "sl-4",
    name: "แคตตาล็อกสินค้า",
    title: "ผลิตภัณฑ์ของเรา",
    description: "เลือกโซลูชันที่ตอบโจทย์ธุรกิจของคุณ",
    contentType: "product",
    createdAt: "2026-06-16 09:20",
    updatedAt: "2026-07-26 16:05",
  },
  {
    id: "sl-5",
    name: "ศูนย์ดาวน์โหลด",
    title: "ดาวน์โหลดเอกสาร",
    description: "คู่มือ โบรชัวร์ และไฟล์สำหรับลูกค้า",
    contentType: "download",
    createdAt: "2026-06-15 15:35",
    updatedAt: "2026-07-25 13:22",
  },
];

const IMPACT_COPY: Record<SettingsTab, { title: string; body: string }> = {
  listing: {
    title: "กำลังตั้งค่าหน้ารายการ",
    body: "ตั้งหน้ารายการเป็นหลัก ฝังบาร์หน้าแรกเมื่อต้องการ ซ่อนบางอย่างบนมือถือได้",
  },
  card: {
    title: "กำลังตั้งค่าการ์ด",
    body: "เลือกข้อมูลที่โชว์บนแต่ละใบในลิสต์ เช่น รูป ชื่อ คำอธิบาย และปุ่ม",
  },
  detail: {
    title: "กำลังตั้งค่าหน้ารายละเอียด",
    body: "พรีวิวขวาเป็นหน้าหลังคลิกการ์ด เปิด-ปิดข้อมูลที่ผู้เข้าชมจะเห็น",
  },
  seo: {
    title: "กำลังตั้งค่า SEO",
    body: "ชื่อหน้า Slug และ Meta — ดูตัวอย่างผลการค้นหาด้านล่างพรีวิว",
  },
};

type Screen = "list" | "edit";
type EditTab = "general" | "items" | "display";

function formText(editing: boolean, value?: string) {
  return editing ? (value ?? "") : "";
}

function formLines(editing: boolean, values?: string[]) {
  return editing ? (values?.join("\n") ?? "") : "";
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`;
}

function itemClickAction(item?: ContentItem): ClickAction {
  if (item?.clickAction === "external") return "external";
  if (item?.clickAction === "file") return "file";
  return "detail";
}

export default function App() {
  const { message } = AntdApp.useApp();
  const [settings, setSettings] = useState<DisplaySettings>(() =>
    createDefaultSettings("job"),
  );
  const [tab, setTab] = useState<SettingsTab>("listing");
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOverride, setPreviewOverride] = useState<PreviewMode | null>(
    null,
  );
  const [screen, setScreen] = useState<Screen>("list");
  const [editTab, setEditTab] = useState<EditTab>("items");
  const [listings, setListings] = useState(SEARCH_LISTINGS);
  const [activeJobId, setActiveJobId] = useState(SEARCH_LISTINGS[0].id);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [clickAction, setClickAction] = useState<ClickAction>("detail");
  const [externalUrl, setExternalUrl] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [itemsByType, setItemsByType] = useState<
    Record<ContentTypeId, ContentItem[]>
  >(() => structuredClone(SAMPLE_ITEMS));

  const config = CONTENT_TYPES[settings.contentType];
  const items = itemsByType[settings.contentType];
  const activeItem =
    items.find((item) => item.id === activeItemId) ?? items[0];
  const activeJob =
    listings.find((job) => job.id === activeJobId) ?? listings[0];
  const impact = IMPACT_COPY[tab];
  const previewMode: PreviewMode =
    previewOverride ?? (tab === "detail" ? "detail" : "listing");
  const filteredJobs = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return listings;
    return listings.filter((job) => {
      const typeLabel = CONTENT_TYPES[job.contentType].label.toLowerCase();
      return (
        job.name.toLowerCase().includes(keyword) ||
        job.title.toLowerCase().includes(keyword) ||
        job.description.toLowerCase().includes(keyword) ||
        typeLabel.includes(keyword)
      );
    });
  }, [query, listings]);

  const switchContentType = (type: ContentTypeId) => {
    setSettings(createDefaultSettings(type));
    setSelectedId(null);
    setPreviewOverride(null);
    setTab("listing");
  };

  const changeListingContentType = (type: ContentTypeId) => {
    setListings((current) =>
      current.map((listing) =>
        listing.id === activeJobId ? { ...listing, contentType: type } : listing,
      ),
    );
    setSettings((current) => applyContentType(current, type));
    setSelectedId(null);
    setPreviewOverride(null);
    message.info("คงการตั้งค่าหน้ารายการและการ์ดไว้ ปรับป้ายฟิลด์ให้ตรงประเภทใหม่");
  };

  const patchActiveListing = (partial: Partial<SearchListing>) => {
    setListings((current) =>
      current.map((listing) =>
        listing.id === activeJobId ? { ...listing, ...partial } : listing,
      ),
    );
  };

  const openItemModal = (id?: string) => {
    const item = id
      ? items.find((entry) => entry.id === id)
      : undefined;
    setActiveItemId(id ?? null);
    setClickAction(
      item
        ? itemClickAction(item)
        : settings.contentType === "download"
          ? "file"
          : "detail",
    );
    setExternalUrl(item?.externalUrl ?? "");
    setBodyHtml(item?.detailSections.body ?? "");
    setCoverImage(item?.coverImage ?? "");
    setFileName(item?.fileName ?? "");
    setFileUrl(item?.fileUrl ?? "");
    setFileSize(item?.fileSize ?? "");
    setItemModalOpen(true);
  };

  const saveItem = () => {
    const url =
      clickAction === "external" ? normalizeUrl(externalUrl) : undefined;
    if (clickAction === "external" && !url) {
      message.warning("ใส่ลิงก์ปลายทางก่อนบันทึก");
      return;
    }
    if (clickAction === "file" && !fileName && !fileUrl) {
      message.warning("แนบไฟล์ก่อนบันทึก");
      return;
    }
    const type = settings.contentType;
    const fileFields = {
      fileName: fileName || undefined,
      fileUrl: fileUrl || undefined,
      fileSize: fileSize || undefined,
    };
    setItemsByType((current) => {
      const list = current[type];
      if (activeItemId) {
        return {
          ...current,
          [type]: list.map((item) =>
            item.id === activeItemId
              ? {
                  ...item,
                  clickAction,
                  externalUrl: url,
                  coverImage: coverImage || undefined,
                  ...fileFields,
                  priceLabel:
                    type === "download" && fileSize
                      ? fileSize
                      : item.priceLabel,
                  detailSections:
                    type === "job"
                      ? item.detailSections
                      : { ...item.detailSections, body: bodyHtml },
                }
              : item,
          ),
        };
      }
      return {
        ...current,
        [type]: [
          createBlankItem(
            clickAction,
            url,
            bodyHtml,
            coverImage || undefined,
            fileFields,
          ),
          ...list,
        ],
      };
    });
    setItemModalOpen(false);
    message.success(
      clickAction === "external"
        ? "บันทึกแล้ว กดรายการนี้จะเปิดลิงก์ภายนอก"
        : clickAction === "file"
          ? "บันทึกแล้ว กดรายการนี้จะดาวน์โหลดไฟล์ ไม่ใช่ลิงก์ออกเว็บ"
          : "บันทึกแล้ว กดรายการนี้จะเปิดหน้ารายละเอียด",
    );
  };

  const attachItemFile = (file: File) => {
    if (fileUrl.startsWith("blob:")) URL.revokeObjectURL(fileUrl);
    setFileName(file.name);
    setFileUrl(URL.createObjectURL(file));
    setFileSize(formatFileSize(file.size));
  };

  const clearItemFile = () => {
    if (fileUrl.startsWith("blob:")) URL.revokeObjectURL(fileUrl);
    setFileName("");
    setFileUrl("");
    setFileSize("");
  };

  const openEdit = (listing: SearchListing) => {
    setActiveJobId(listing.id);
    switchContentType(listing.contentType);
    setScreen("edit");
    setEditTab("items");
  };

  const jobColumns: TableColumnsType<SearchListing> = [
    {
      title: "",
      key: "actions",
      width: 96,
      render: (_, job) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            aria-label={`Edit ${job.name}`}
            onClick={() => openEdit(job)}
          />
          <Popconfirm
            title="ลบ Search Listing?"
            description="รายการนี้จะถูกลบจากตัวอย่าง"
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
            onConfirm={() => message.success("ตัวอย่าง: ลบรายการนี้")}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${job.name}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (_, job) => (
        <div>
          <Space size={8} wrap>
            <Typography.Text strong>{job.name}</Typography.Text>
            <Tag color={TYPE_TAG_COLOR[job.contentType]}>
              {CONTENT_TYPES[job.contentType].label}
            </Tag>
          </Space>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {job.title}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      width: 200,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      width: 200,
      sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
    },
  ];

  const itemColumns: TableColumnsType<ContentItem> = [
    {
      title: "",
      key: "actions",
      width: 120,
      render: (_, item) => (
        <Space size={4}>
          <Button type="text" size="small" icon={<HolderOutlined />} aria-label="Reorder" />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            aria-label={`Edit ${item.title}`}
            onClick={() => openItemModal(item.id)}
          />
          <Popconfirm
            title="ลบรายการนี้?"
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
            onConfirm={() => message.success("ตัวอย่าง: ลบรายการนี้")}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${item.title}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
    { title: "Title", dataIndex: "title", ellipsis: true },
    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      render: (status: string) => (
        <Tag color={status.includes("เปิด") || status.toLowerCase().includes("open") ? "success" : "default"}>
          {status}
        </Tag>
      ),
    },
    { title: config.categoryLabel, dataIndex: "category", width: 160 },
    { title: config.locationLabel, dataIndex: "location", width: 180 },
    {
      title: "เมื่อกด",
      key: "clickAction",
      width: 150,
      render: (_, item) =>
        itemClickAction(item) === "external" ? (
          <Tag color="blue">ลิงก์ออก</Tag>
        ) : itemClickAction(item) === "file" ? (
          <Tag color="cyan">ดาวน์โหลดไฟล์</Tag>
        ) : (
          <Tag>รายละเอียด</Tag>
        ),
    },
  ];

  const renderDisplayBuilder = () => (
    <div className="builder-workspace">
      <div className="builder-control-bar">
        <div className="page-title">
          <span className="module-kicker">
            {CONTENT_TYPES[activeJob.contentType].label} · {activeJob.name}
          </span>
          <h3>ตั้งค่าหน้าบ้าน</h3>
          <p>ซ้ายตั้งค่า · ขวาคือหน้าเว็บที่ผู้เข้าชมจะเห็น</p>
        </div>
      </div>

      <div className="layout edit-builder-layout">
        <aside className="settings">
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
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`tab${tab === item.id ? " active" : ""}`}
                onClick={() => {
                  setTab(item.id);
                  setPreviewOverride(null);
                  if (item.id === "detail" && !selectedId) {
                    setSelectedId(items[0]?.id ?? null);
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "listing" ? (
            <ListingSettings settings={settings} config={config} onChange={setSettings} />
          ) : null}
          {tab === "card" ? (
            <CardSettings settings={settings} config={config} onChange={setSettings} />
          ) : null}
          {tab === "detail" ? (
            <DetailSettings settings={settings} config={config} onChange={setSettings} />
          ) : null}
          {tab === "seo" ? (
            <SeoSettings settings={settings} onChange={setSettings} />
          ) : null}
        </aside>

        <LivePreview
          settings={settings}
          items={items}
          device={device}
          mode={previewMode}
          selectedId={selectedId}
          heroTitle={activeJob.title}
          heroSubtitle={activeJob.description}
          toolbarLabel={
            previewOverride === "detail" && tab !== "detail"
              ? "กำลังดูหน้ารายละเอียดชั่วคราว · กดกลับเพื่อตั้งค่าต่อ"
              : tab === "detail"
                ? "พรีวิวหน้ารายละเอียด"
                : tab === "seo"
                  ? "พรีวิวหน้ารายการ และตัวอย่างใน Google"
                  : tab === "card"
                    ? "พรีวิวการ์ดบนหน้ารายการ"
                    : "พรีวิวหน้ารายการ"
          }
          onDeviceChange={setDevice}
          onModeChange={(next) => {
            if (next === "detail") {
              setPreviewOverride("detail");
              if (!selectedId) setSelectedId(items[0]?.id ?? null);
            } else {
              setPreviewOverride(null);
              setSelectedId(null);
            }
          }}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  );

  const renderItemForm = () => {
    const editing = Boolean(activeItemId);
    const current = editing ? activeItem : undefined;
    const type = settings.contentType;
    const showJobBlocks = type === "job";
    const showBody = type !== "job";
    const showBenefits = type === "job" || type === "product";
    const showSku = type === "product";
    const showPublishedAt = type === "blog";
    const showFile = type === "download";

    return (
      <Form layout="vertical">
        <Form.Item
          label="Cover"
          extra="รูปปกบน Card และหน้ารายละเอียด แนะนำภาพแนวนอน เช่น 16:9"
        >
          {coverImage ? (
            <div className="item-cover">
              <img src={coverImage} alt="Cover" />
              <Space className="item-cover-actions">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setCoverImage(URL.createObjectURL(file));
                    return false;
                  }}
                >
                  <Button icon={<PictureOutlined />}>เปลี่ยนรูป</Button>
                </Upload>
                <Button onClick={() => setCoverImage("")}>ลบรูป</Button>
              </Space>
            </div>
          ) : (
            <Upload.Dragger
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                setCoverImage(URL.createObjectURL(file));
                return false;
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">คลิกหรือลากไฟล์มาวางเพื่ออัปโหลด Cover</p>
              <p className="ant-upload-hint">รองรับ JPG, PNG, WEBP</p>
            </Upload.Dragger>
          )}
        </Form.Item>

        <Form.Item label="Title" required>
          <Input value={formText(editing, current?.title)} readOnly />
        </Form.Item>

        <Form.Item
          label="เมื่อกดรายการนี้"
          extra={
            showFile
              ? "เปิดหน้ารายละเอียด ออกไปเว็บอื่น หรือดาวน์โหลดไฟล์ที่แนบ — ไฟล์ไม่ใช่ลิงก์ออก"
              : "เลือกได้ต่อใบ ว่าจะเปิดหน้ารายละเอียดในโมดูลนี้ หรือออกไปลิงก์อื่น"
          }
        >
          <Radio.Group
            value={clickAction}
            onChange={(event) =>
              setClickAction(event.target.value as ClickAction)
            }
          >
            <Radio value="detail">เปิดหน้ารายละเอียด</Radio>
            <Radio value="external">ลิงก์ออกไปที่อื่น</Radio>
            {showFile ? (
              <Radio value="file">ดาวน์โหลดไฟล์</Radio>
            ) : null}
          </Radio.Group>
        </Form.Item>
        {clickAction === "external" ? (
          <Form.Item label="URL ปลายทาง" required>
            <Input
              value={externalUrl}
              placeholder="https://example.com/apply"
              onChange={(event) => setExternalUrl(event.target.value)}
            />
          </Form.Item>
        ) : null}
        {showFile ? (
          <Form.Item
            label="ไฟล์ดาวน์โหลด"
            required={clickAction === "file"}
            extra="แนบไฟล์จริง เช่น PDF หรือ ZIP ไม่ใช่ URL เว็บภายนอก ขนาดไฟล์จะโชว์บนการ์ด"
          >
            {fileName ? (
              <div className="item-file">
                <FileOutlined className="item-file-icon" />
                <div className="item-file-copy">
                  <div className="item-file-name">{fileName}</div>
                  {fileSize ? (
                    <div className="item-file-meta">{fileSize}</div>
                  ) : null}
                </div>
                <Space className="item-file-actions">
                  <Upload
                    accept=".pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      attachItemFile(file);
                      return false;
                    }}
                  >
                    <Button>เปลี่ยนไฟล์</Button>
                  </Upload>
                  <Button onClick={clearItemFile}>ลบไฟล์</Button>
                </Space>
              </div>
            ) : (
              <Upload.Dragger
                accept=".pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp"
                showUploadList={false}
                beforeUpload={(file) => {
                  attachItemFile(file);
                  return false;
                }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">คลิกหรือลากไฟล์มาวางเพื่อแนบ</p>
                <p className="ant-upload-hint">รองรับ PDF, ZIP, Office และรูปภาพ</p>
              </Upload.Dragger>
            )}
          </Form.Item>
        ) : null}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Status" required>
              <Input value={formText(editing, current?.status)} readOnly />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={config.categoryLabel}>
              <Input value={formText(editing, current?.category)} readOnly />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={config.locationLabel}>
              <Input value={formText(editing, current?.location)} readOnly />
            </Form.Item>
          </Col>
          {showFile ? (
            <Col span={12}>
              <Form.Item label="File Size" extra="ดึงจากไฟล์ที่แนบ โชว์บนการ์ดเมื่อเปิด File Size">
                <Input value={fileSize} readOnly placeholder="แนบไฟล์แล้วจะมีขนาดให้" />
              </Form.Item>
            </Col>
          ) : (
            <Col span={12}>
              <Form.Item label={config.priceLabel}>
                <Input value={formText(editing, current?.priceLabel)} readOnly />
              </Form.Item>
            </Col>
          )}
          {showSku ? (
            <Col span={12}>
              <Form.Item label="SKU" extra="โชว์ได้เมื่อเลือก Source เป็น SKU ใน Display">
                <Input
                  value={formText(editing, current?.sku ?? current?.id.toUpperCase())}
                  readOnly
                />
              </Form.Item>
            </Col>
          ) : null}
          {showPublishedAt ? (
            <Col span={12}>
              <Form.Item
                label="Published At"
                extra="ช่องวันที่จริง ใช้เมื่อ Display เลือก Source เป็น Date"
              >
                <Input
                  value={formText(editing, current?.publishedAt ?? "2026-08-01 09:00")}
                  readOnly
                />
              </Form.Item>
            </Col>
          ) : null}
        </Row>

        <Form.Item
          label="Description"
          extra="ข้อความย่อบน Card และใช้ค้นหาได้เมื่อเปิด Search จากรายละเอียด"
        >
          <Input.TextArea
            rows={3}
            value={formText(editing, current?.description)}
            readOnly
          />
        </Form.Item>

        {showJobBlocks || showBenefits || showBody ? (
          <>
            <Divider plain>รายละเอียดหน้า Detail</Divider>
            <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
              ช่องเหล่านี้โชว์บนหน้าบ้านเมื่อเปิดสวิตช์ใน Display → Detail
            </Typography.Paragraph>
          </>
        ) : null}

        {showJobBlocks ? (
          <>
            <Form.Item label="Responsibilities" extra="หนึ่งข้อต่อหนึ่งบรรทัด">
              <Input.TextArea
                rows={4}
                value={formLines(editing, current?.detailSections.responsibilities)}
                readOnly
              />
            </Form.Item>
            <Form.Item label="Qualifications" extra="หนึ่งข้อต่อหนึ่งบรรทัด">
              <Input.TextArea
                rows={4}
                value={formLines(editing, current?.detailSections.qualifications)}
                readOnly
              />
            </Form.Item>
          </>
        ) : null}

        {showBenefits ? (
          <Form.Item label="Benefits" extra="หนึ่งข้อต่อหนึ่งบรรทัด">
            <Input.TextArea
              rows={3}
              value={formLines(editing, current?.detailSections.benefits)}
              readOnly
            />
          </Form.Item>
        ) : null}

        {showBody ? (
          <Form.Item
            label="เนื้อหา / รายละเอียด"
            extra={
              type === "blog"
                ? "บทความเต็ม จัดรูปแบบได้ หรือสลับไปแท็บ HTML เพื่อวางโค้ด ไม่มีสีตัวอักษรหรือตาราง"
                : "รายละเอียดบนหน้า Detail จัดรูปแบบได้ หรือวาง HTML ในแท็บ HTML"
            }
          >
            <BodyEditor
              key={activeItemId ?? "new"}
              value={bodyHtml}
              onChange={setBodyHtml}
            />
          </Form.Item>
        ) : null}
      </Form>
    );
  };

  const renderListScreen = () => (
    <>
      <Flex className="cms-page-head" align="center" justify="space-between" wrap gap={12}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Search Listing
          </Typography.Title>
          <Typography.Text type="secondary">
            ตั้งค่าหน้ารายการพร้อมค้นหา ใช้ได้กับ Job, บทความ, Product และ Download
          </Typography.Text>
        </div>
        <Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: "rgba(0,0,0,0.25)" }} />}
            placeholder="Search listing"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ width: 280 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info("เตรียมเพิ่ม Search Listing ใหม่")}
          >
            Add
          </Button>
        </Space>
      </Flex>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={jobColumns}
          dataSource={filteredJobs}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} รายการ`,
          }}
        />
      </Card>
    </>
  );

  const renderEditScreen = () => (
    <>
      <Breadcrumb
        style={{ marginBottom: 12 }}
        items={[
          {
            title: (
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => setScreen("list")}
                style={{ padding: 0, height: "auto" }}
              >
                Search Listing
              </Button>
            ),
          },
          { title: activeJob.name },
        ]}
      />

      <Flex className="cms-page-head" align="flex-start" justify="space-between" wrap gap={12}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {activeJob.name}
          </Typography.Title>
          <Typography.Text type="secondary">Search Listing Detail</Typography.Text>
        </div>
        <Button
          type="primary"
          onClick={() =>
            message.success(
              editTab === "display"
                ? "บันทึกการตั้งค่าหน้าบ้านแล้ว"
                : "บันทึกการตั้งค่าแล้ว",
            )
          }
        >
          Save
        </Button>
      </Flex>

      <Tabs
        activeKey={editTab}
        onChange={(key) => setEditTab(key as EditTab)}
        items={[
          {
            key: "general",
            label: "General",
            children: (
              <Card>
                <Form layout="vertical" style={{ maxWidth: 760 }}>
                  <Form.Item label="Name" required>
                    <Input value={activeJob.name} readOnly />
                  </Form.Item>
                  <Form.Item
                    label="Content Type"
                    extra="กำหนดช่องกรอกใน Items และตัวเลือกที่เปิด-ปิดได้ใน Display"
                  >
                    <Select
                      value={activeJob.contentType}
                      onChange={changeListingContentType}
                      options={(Object.keys(CONTENT_TYPES) as ContentTypeId[]).map(
                        (type) => ({
                          value: type,
                          label: CONTENT_TYPES[type].label,
                        }),
                      )}
                    />
                  </Form.Item>
                  <Card
                    size="small"
                    title="Attributes"
                    extra={
                      <Radio.Group defaultValue="TH" optionType="button" buttonStyle="solid" size="small">
                        <Radio.Button value="TH">TH</Radio.Button>
                        <Radio.Button value="EN">EN</Radio.Button>
                      </Radio.Group>
                    }
                  >
                    <Form.Item
                      label="Title"
                      required
                      extra="หัวข้อนี้โชว์บนหน้ารายการใน Display"
                    >
                      <Input
                        value={activeJob.title}
                        onChange={(event) =>
                          patchActiveListing({ title: event.target.value })
                        }
                      />
                    </Form.Item>
                    <Form.Item
                      label="Description"
                      extra="คำอธิบายนี้โชว์ใต้หัวข้อบนหน้ารายการ"
                    >
                      <Input.TextArea
                        rows={4}
                        value={activeJob.description}
                        onChange={(event) =>
                          patchActiveListing({ description: event.target.value })
                        }
                      />
                    </Form.Item>
                  </Card>
                </Form>
              </Card>
            ),
          },
          {
            key: "items",
            label: "Items",
            children: (
              <Card>
                <Flex align="center" justify="space-between" wrap gap={12} style={{ marginBottom: 16 }}>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    Items
                  </Typography.Title>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openItemModal()}>
                    Add Item
                  </Button>
                </Flex>
                <Table
                  rowKey="id"
                  columns={itemColumns}
                  dataSource={items}
                  pagination={false}
                />
              </Card>
            ),
          },
          {
            key: "display",
            label: "Display",
            children: (
              <div className="display-builder-card page-display-builder">
                {renderDisplayBuilder()}
              </div>
            ),
          },
        ]}
      />

      <Modal
        title={activeItemId ? "Edit Item" : "Add Item"}
        open={itemModalOpen}
        onCancel={() => setItemModalOpen(false)}
        width={840}
        centered
        styles={{
          body: {
            maxHeight: "calc(100vh - 180px)",
            overflow: "auto",
          },
        }}
        footer={[
          <Button key="close" onClick={() => setItemModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={saveItem}
          >
            Save
          </Button>,
        ]}
      >
        {renderItemForm()}
      </Modal>
    </>
  );

  return (
    <Layout className="cms-app">
      <Sider
        className="cms-sider"
        theme="light"
        width={248}
        collapsedWidth={76}
        collapsed={sidebarCollapsed}
        trigger={null}
        style={{ height: "100vh", position: "sticky", top: 0, overflow: "auto" }}
      >
        <div className="cms-sider-brand">
          <span className="cms-sider-brand-mark">C</span>
          {sidebarCollapsed ? null : <span>CMS</span>}
        </div>
        <Menu
          className="cms-sider-menu"
          mode="inline"
          selectedKeys={["Search Listing"]}
          items={MENU_ITEMS}
          onClick={({ key }) => {
            if (key !== "Search Listing") {
              message.info(`โมดูล ${key} ยังไม่เปิดในตัวอย่างนี้`);
            } else {
              setScreen("list");
            }
          }}
        />
      </Sider>

      <Layout>
        <Header className="cms-header">
          <div className="cms-header-left">
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              aria-label={sidebarCollapsed ? "Show menu" : "Hide menu"}
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            />
            <span className="cms-business-name">Test Business</span>
            <Button type="text" size="small" icon={<EyeOutlined />} aria-label="Preview business" />
          </div>
          <div className="cms-header-right">
            <Button type="text" icon={<GlobalOutlined />}>
              EN
            </Button>
            <Button type="text" shape="circle" icon={<QuestionCircleOutlined />} aria-label="Help" />
            <Avatar style={{ backgroundColor: "#1677ff" }}>N</Avatar>
          </div>
        </Header>

        <Content className="cms-shell-content">
          {screen === "list" ? renderListScreen() : renderEditScreen()}
        </Content>
      </Layout>
    </Layout>
  );
}
