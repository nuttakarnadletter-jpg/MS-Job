import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExperimentOutlined,
  EyeOutlined,
  FileOutlined,
  FormOutlined,
  GlobalOutlined,
  HomeOutlined,
  InboxOutlined,
  ProfileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PictureOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SettingOutlined,
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
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  CardSettings,
  DetailSettings,
  ListingSettings,
  SeoSettings,
} from "./components/SettingsPanels";
import { LivePreview } from "./components/LivePreview";
import { ArticleBoxModule } from "./components/ArticleBoxModule";
import { BodyEditor } from "./components/BodyEditor";
import { FormBuilderModule } from "./FormBuilderModule";
import { DragHandle, SortableItemRow } from "./components/SortableItemRow";
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
  { key: "ภาพรวม", icon: <HomeOutlined />, label: "ภาพรวม" },
  { key: "Search Listing", icon: <SearchOutlined />, label: "Search Listing" },
  { key: "Article Display", icon: <FileOutlined />, label: "Article Display" },
  { key: "Custom Forms", icon: <FormOutlined />, label: "Custom Forms" },
  { key: "Form Entries", icon: <ProfileOutlined />, label: "Form Entries" },
  { key: "คลังสื่อ", icon: <InboxOutlined />, label: "คลังสื่อ" },
  { key: "ตั้งค่า", icon: <SettingOutlined />, label: "ตั้งค่า" },
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

type CustomFormListing = {
  id: string;
  name: string;
  title: string;
  description: string;
  languages: string[];
  fields: number;
  createdAt: string;
  updatedAt: string;
};

type FormEntry = {
  id: string;
  formId: string;
  formName: string;
  submitter: string;
  email: string;
  phone: string;
  language: string;
  submittedAt: string;
  answers: Record<string, FormEntryAnswer>;
  tracking: {
    referrer: string;
    landingUrl: string;
    submitUrl: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    gclid: string;
    fbclid: string;
  };
};

type FormEntryImageAttachment = {
  type: "image";
  fileName: string;
  size: string;
  url: string;
  alt?: string;
};

type FormEntryAnswer = string | FormEntryImageAttachment;

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
    description: "บทความ แนวคิด และเรื่องราวจากทีม Company",
    contentType: "blog",
    createdAt: "2026-06-18 10:12",
    updatedAt: "2026-07-28 09:40",
  },
  {
    id: "sl-3",
    name: "ข่าวสารและกิจกรรม",
    title: "ข่าวสารล่าสุด",
    description: "อัปเดตข่าวประกาศและกิจกรรมจาก Company",
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

const CUSTOM_FORM_LISTINGS: CustomFormListing[] = [
  {
    id: "form-1",
    name: "แบบฟอร์มลงทะเบียน",
    title: "Registration Form",
    description: "ฟอร์มเก็บข้อมูลผู้สมัครพร้อมข้อความ 3 ภาษา",
    languages: ["TH", "EN", "CN"],
    fields: 2,
    createdAt: "2026-07-18 10:20",
    updatedAt: "2026-08-30 14:45",
  },
  {
    id: "form-2",
    name: "แบบฟอร์มติดต่อกลับ",
    title: "Contact Request",
    description: "ฟอร์มสำหรับให้ลูกค้าฝากข้อมูลเพื่อติดต่อกลับ",
    languages: ["TH", "EN"],
    fields: 5,
    createdAt: "2026-07-22 09:10",
    updatedAt: "2026-08-28 16:05",
  },
  {
    id: "form-3",
    name: "แบบสอบถามความพึงพอใจ",
    title: "Customer Feedback",
    description: "แบบสอบถามหลังใช้บริการสำหรับทีมดูแลลูกค้า",
    languages: ["TH", "EN", "CN"],
    fields: 8,
    createdAt: "2026-07-25 11:35",
    updatedAt: "2026-08-29 12:18",
  },
];

const MOCK_ATTACHMENT_IMAGES = {
  receipt:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='240' viewBox='0 0 360 240'%3E%3Crect width='360' height='240' rx='18' fill='%23f7fbff'/%3E%3Crect x='92' y='34' width='176' height='172' rx='12' fill='white' stroke='%23bfdbfe' stroke-width='3'/%3E%3Crect x='116' y='62' width='128' height='14' rx='7' fill='%232563eb'/%3E%3Crect x='116' y='96' width='98' height='10' rx='5' fill='%2394a3b8'/%3E%3Crect x='116' y='120' width='128' height='10' rx='5' fill='%23cbd5e1'/%3E%3Crect x='116' y='144' width='82' height='10' rx='5' fill='%23cbd5e1'/%3E%3Ccircle cx='228' cy='162' r='18' fill='%23dbeafe'/%3E%3Cpath d='M219 162l6 6 13-15' fill='none' stroke='%232563eb' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
  storefront:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='240' viewBox='0 0 360 240'%3E%3Crect width='360' height='240' rx='18' fill='%23f8fafc'/%3E%3Crect x='52' y='88' width='256' height='104' rx='10' fill='white' stroke='%23cbd5e1' stroke-width='3'/%3E%3Cpath d='M72 56h216l20 44H52z' fill='%232563eb'/%3E%3Cpath d='M92 56h44l-8 44H80zM180 56h44l8 44h-60zM268 56h20l20 44h-48z' fill='%2393c5fd' opacity='.9'/%3E%3Crect x='82' y='124' width='72' height='68' rx='6' fill='%23dbeafe'/%3E%3Crect x='184' y='126' width='94' height='14' rx='7' fill='%2394a3b8'/%3E%3Crect x='184' y='154' width='68' height='10' rx='5' fill='%23cbd5e1'/%3E%3C/svg%3E",
};

const FORM_ENTRIES: FormEntry[] = [
  {
    id: "entry-1",
    formId: "form-1",
    formName: "แบบฟอร์มลงทะเบียน",
    submitter: "ณัฐกานต์ บิน",
    email: "nuttakarn@example.com",
    phone: "081-234-5678",
    language: "TH",
    submittedAt: "2026-08-31 16:42",
    answers: {
      "ชื่อ-นามสกุล": "ณัฐกานต์ บิน",
      เพศ: "หญิง",
      "สลิป/รูปภาพแนบ": {
        type: "image",
        fileName: "registration-slip.jpg",
        size: "1.4 MB",
        url: MOCK_ATTACHMENT_IMAGES.receipt,
        alt: "Uploaded registration slip",
      },
      หมายเหตุ: "สนใจรับข้อมูลเพิ่มเติม",
    },
    tracking: {
      referrer: "https://b78e6cff.rp-test.net/search?search=test%20add%20manual",
      landingUrl: "https://b78e6cff.rp-test.net/checkout",
      submitUrl:
        "https://b78e6cff.rp-test.net/products/test%20add?quantity=1&variant=6942499999cc27e453707428",
      utmSource: "-",
      utmMedium: "-",
      utmCampaign: "-",
      gclid: "-",
      fbclid: "-",
    },
  },
  {
    id: "entry-2",
    formId: "form-2",
    formName: "แบบฟอร์มติดต่อกลับ",
    submitter: "Michael Chen",
    email: "michael.chen@example.com",
    phone: "+66 89 555 2100",
    language: "EN",
    submittedAt: "2026-08-31 14:18",
    answers: {
      "Full Name": "Michael Chen",
      Email: "michael.chen@example.com",
      "Phone Number": "+66 89 555 2100",
      Message: "Please contact me about enterprise pricing.",
    },
    tracking: {
      referrer: "https://google.com/search?q=enterprise+cms+form+builder",
      landingUrl: "https://demo-cms.test/pricing?utm_source=google&utm_medium=cpc",
      submitUrl: "https://demo-cms.test/contact/request-demo",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "enterprise-demo-q3",
      gclid: "CjwKCAjw9uPCBhATEiwABHN9KzDemo123",
      fbclid: "-",
    },
  },
  {
    id: "entry-3",
    formId: "form-3",
    formName: "แบบสอบถามความพึงพอใจ",
    submitter: "李小明",
    email: "li.xiaoming@example.cn",
    phone: "+86 138 0000 8821",
    language: "CN",
    submittedAt: "2026-08-30 11:05",
    answers: {
      姓名: "李小明",
      评分: "5",
      反馈: "服务很好，回复速度快。",
    },
    tracking: {
      referrer: "https://wechat.example.cn/article/customer-feedback",
      landingUrl: "https://demo-cms.test/cn/survey/customer-feedback",
      submitUrl: "https://demo-cms.test/cn/forms/customer-feedback/submit",
      utmSource: "wechat",
      utmMedium: "social",
      utmCampaign: "cn-feedback-august",
      gclid: "-",
      fbclid: "-",
    },
  },
  {
    id: "entry-4",
    formId: "form-1",
    formName: "แบบฟอร์มลงทะเบียน",
    submitter: "Ariya Wong",
    email: "ariya.wong@example.com",
    phone: "086-901-2233",
    language: "EN",
    submittedAt: "2026-08-29 09:32",
    answers: {
      "Full Name": "Ariya Wong",
      Gender: "Female",
      Note: "Registered from campaign landing page.",
    },
    tracking: {
      referrer: "https://facebook.com/",
      landingUrl:
        "https://demo-cms.test/register?utm_source=facebook&utm_medium=paid-social&utm_campaign=leadgen-awareness",
      submitUrl: "https://demo-cms.test/forms/registration/submit",
      utmSource: "facebook",
      utmMedium: "paid-social",
      utmCampaign: "leadgen-awareness",
      gclid: "-",
      fbclid: "IwAR2xFormLeadExample999",
    },
  },
  {
    id: "entry-5",
    formId: "form-2",
    formName: "แบบฟอร์มติดต่อกลับ",
    submitter: "Somsak P.",
    email: "somsak.p@example.co.th",
    phone: "089-771-2044",
    language: "TH",
    submittedAt: "2026-08-28 18:22",
    answers: {
      "ชื่อ-นามสกุล": "สมศักดิ์ พ.",
      อีเมล: "somsak.p@example.co.th",
      เบอร์โทรศัพท์: "089-771-2044",
      หัวข้อ: "สอบถามการติดตั้งระบบ CMS",
      "ภาพหน้าร้าน": {
        type: "image",
        fileName: "storefront-reference.png",
        size: "2.1 MB",
        url: MOCK_ATTACHMENT_IMAGES.storefront,
        alt: "Uploaded storefront reference",
      },
      ข้อความ: "ต้องการให้ทีมติดต่อกลับเรื่องแพ็กเกจสำหรับองค์กร",
    },
    tracking: {
      referrer: "https://demo-cms.test/blog/how-to-build-company-website",
      landingUrl: "https://demo-cms.test/contact",
      submitUrl: "https://demo-cms.test/forms/contact-request/submit",
      utmSource: "newsletter",
      utmMedium: "email",
      utmCampaign: "august-product-update",
      gclid: "-",
      fbclid: "-",
    },
  },
  {
    id: "entry-6",
    formId: "form-1",
    formName: "แบบฟอร์มลงทะเบียน",
    submitter: "Priya Raman",
    email: "priya.raman@example.com",
    phone: "+91 98765 43210",
    language: "EN",
    submittedAt: "2026-08-27 13:48",
    answers: {
      "Full Name": "Priya Raman",
      Gender: "Female",
      Company: "Bright Retail Co.",
      "Interested Plan": "Pro",
    },
    tracking: {
      referrer: "-",
      landingUrl: "https://demo-cms.test/register?utm_source=linkedin&utm_medium=organic",
      submitUrl: "https://demo-cms.test/forms/registration/submit",
      utmSource: "linkedin",
      utmMedium: "organic",
      utmCampaign: "-",
      gclid: "-",
      fbclid: "-",
    },
  },
  {
    id: "entry-7",
    formId: "form-3",
    formName: "แบบสอบถามความพึงพอใจ",
    submitter: "ธนา สุขใจ",
    email: "thana.s@example.com",
    phone: "082-448-1900",
    language: "TH",
    submittedAt: "2026-08-26 10:15",
    answers: {
      "คะแนนความพึงพอใจ": "4",
      "ช่องทางที่ใช้บริการ": "Live chat",
      "สิ่งที่ชอบ": "ตอบเร็วและข้อมูลชัดเจน",
      "ข้อเสนอแนะ": "อยากให้มีคู่มือภาษาไทยเพิ่ม",
    },
    tracking: {
      referrer: "https://demo-cms.test/help-center",
      landingUrl: "https://demo-cms.test/survey/customer-feedback?source=chat",
      submitUrl: "https://demo-cms.test/forms/customer-feedback/submit",
      utmSource: "-",
      utmMedium: "-",
      utmCampaign: "-",
      gclid: "-",
      fbclid: "-",
    },
  },
  {
    id: "entry-8",
    formId: "form-2",
    formName: "แบบฟอร์มติดต่อกลับ",
    submitter: "Emma Roberts",
    email: "emma.roberts@example.co.uk",
    phone: "+44 20 7946 0958",
    language: "EN",
    submittedAt: "2026-08-25 08:40",
    answers: {
      "Full Name": "Emma Roberts",
      Email: "emma.roberts@example.co.uk",
      "Phone Number": "+44 20 7946 0958",
      Message: "Following up after the webinar.",
      Consent: "Accepted",
    },
    tracking: {
      referrer: "https://event.example.com/webinar/cms-growth",
      landingUrl:
        "https://demo-cms.test/contact?utm_source=webinar&utm_medium=partner&utm_campaign=cms-growth",
      submitUrl: "https://demo-cms.test/forms/contact-request/submit",
      utmSource: "webinar",
      utmMedium: "partner",
      utmCampaign: "cms-growth",
      gclid: "-",
      fbclid: "-",
    },
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
type FormScreen = "list" | "edit";
type EditTab = "general" | "items" | "display";
type ActiveModule = "search-listing" | "article-display" | "custom-forms" | "form-entries";

function parseLines(value: string) {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : undefined;
}

type AppProps = {
  initialModule?: ActiveModule;
};

function nowStamp() {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type ItemDraft = {
  title: string;
  status: string;
  category: string;
  location: string;
  priceLabel: string;
  description: string;
  publishedAt: string;
  sku: string;
  responsibilities: string;
  qualifications: string;
  benefits: string;
};

const EMPTY_ITEM_DRAFT: ItemDraft = {
  title: "",
  status: "",
  category: "",
  location: "",
  priceLabel: "",
  description: "",
  publishedAt: "",
  sku: "",
  responsibilities: "",
  qualifications: "",
  benefits: "",
};

function draftFromItem(item?: ContentItem): ItemDraft {
  if (!item) return { ...EMPTY_ITEM_DRAFT };
  return {
    title: item.title,
    status: item.status,
    category: item.category,
    location: item.location,
    priceLabel: item.priceLabel,
    description: item.description,
    publishedAt: item.publishedAt ?? "",
    sku: item.sku ?? "",
    responsibilities: (item.detailSections.responsibilities ?? []).join("\n"),
    qualifications: (item.detailSections.qualifications ?? []).join("\n"),
    benefits: (item.detailSections.benefits ?? []).join("\n"),
  };
}

function initialItemsByListing(): Record<string, ContentItem[]> {
  return Object.fromEntries(
    SEARCH_LISTINGS.map((listing) => [
      listing.id,
      structuredClone(SAMPLE_ITEMS[listing.contentType]),
    ]),
  );
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

function displayDash(value: string) {
  return value.trim() || "-";
}

function isImageAttachment(value: FormEntryAnswer): value is FormEntryImageAttachment {
  return typeof value === "object" && value.type === "image";
}

function entryAnswerText(value: FormEntryAnswer) {
  return isImageAttachment(value) ? `${value.fileName} ${value.size}` : value;
}

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export default function App({ initialModule = "search-listing" }: AppProps) {
  const { message } = AntdApp.useApp();
  const [settings, setSettings] = useState<DisplaySettings>(() =>
    createDefaultSettings("job"),
  );
  const [tab, setTab] = useState<SettingsTab>("listing");
  const [highlightListingToggle, setHighlightListingToggle] = useState(false);
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOverride, setPreviewOverride] = useState<PreviewMode | null>(
    null,
  );
  const [screen, setScreen] = useState<Screen>("list");
  const [formScreen, setFormScreen] = useState<FormScreen>("list");
  const [activeModule, setActiveModule] = useState<ActiveModule>(initialModule);
  const [editTab, setEditTab] = useState<EditTab>("items");
  const [listings, setListings] = useState(SEARCH_LISTINGS);
  const [customForms, setCustomForms] = useState(CUSTOM_FORM_LISTINGS);
  const [activeJobId, setActiveJobId] = useState(SEARCH_LISTINGS[0].id);
  const [activeFormId, setActiveFormId] = useState(CUSTOM_FORM_LISTINGS[0].id);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [clickAction, setClickAction] = useState<ClickAction>("detail");
  const [externalUrl, setExternalUrl] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [itemDraft, setItemDraft] = useState<ItemDraft>(EMPTY_ITEM_DRAFT);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [formQuery, setFormQuery] = useState("");
  const [entryQuery, setEntryQuery] = useState("");
  const [entryFormFilter, setEntryFormFilter] = useState<string>("all");
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [itemsByListing, setItemsByListing] = useState<
    Record<string, ContentItem[]>
  >(initialItemsByListing);

  const config = CONTENT_TYPES[settings.contentType];
  const items = itemsByListing[activeJobId] ?? [];
  const activeJob =
    listings.find((job) => job.id === activeJobId) ?? listings[0];
  const activeCustomForm =
    customForms.find((formItem) => formItem.id === activeFormId) ?? customForms[0];
  const activeEntry = FORM_ENTRIES.find((entry) => entry.id === activeEntryId);
  const impact = IMPACT_COPY[tab];
  const previewMode: PreviewMode =
    previewOverride ?? (tab === "detail" ? "detail" : "listing");

  useEffect(() => {
    if (tab !== "listing" || !highlightListingToggle) return;
    const el = document.getElementById("listing-view-toggle");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => setHighlightListingToggle(false), 1800);
    return () => window.clearTimeout(timer);
  }, [tab, highlightListingToggle]);
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

  const filteredCustomForms = useMemo(() => {
    const keyword = formQuery.trim().toLowerCase();
    if (!keyword) return customForms;
    return customForms.filter((formItem) =>
      [formItem.name, formItem.title, formItem.description]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [customForms, formQuery]);

  const filteredEntries = useMemo(() => {
    const keyword = entryQuery.trim().toLowerCase();
    return FORM_ENTRIES.filter((entry) => {
      const matchesForm = entryFormFilter === "all" || entry.formId === entryFormFilter;
      if (!matchesForm) return false;
      if (!keyword) return true;
      return [
        entry.formName,
        entry.submitter,
        entry.email,
        entry.phone,
        entry.language,
        entry.tracking.referrer,
        entry.tracking.landingUrl,
        entry.tracking.submitUrl,
        entry.tracking.utmSource,
        entry.tracking.utmMedium,
        entry.tracking.utmCampaign,
        entry.tracking.gclid,
        entry.tracking.fbclid,
        ...Object.values(entry.answers).map(entryAnswerText),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [entryFormFilter, entryQuery]);

  const entryCountByForm = useMemo(
    () =>
      FORM_ENTRIES.reduce<Record<string, number>>((counts, entry) => {
        counts[entry.formId] = (counts[entry.formId] ?? 0) + 1;
        return counts;
      }, {}),
    [],
  );

  const itemSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const reorderItems = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setItemsByListing((current) => {
      const list = current[activeJobId] ?? [];
      const from = list.findIndex((item) => item.id === active.id);
      const to = list.findIndex((item) => item.id === over.id);
      if (from < 0 || to < 0) return current;
      return { ...current, [activeJobId]: arrayMove(list, from, to) };
    });
  };

  const patchItemDraft = (partial: Partial<ItemDraft>) =>
    setItemDraft((current) => ({ ...current, ...partial }));

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
        listing.id === activeJobId
          ? { ...listing, updatedAt: nowStamp(), ...partial }
          : listing,
      ),
    );
  };

  const syncSeoTitle = (heading: string) => {
    setSettings((current) => ({
      ...current,
      seo: {
        ...current.seo,
        pageTitle: heading.trim()
          ? `${heading} | Company`
          : current.seo.pageTitle,
      },
    }));
  };

  const renameListing = (name: string) => {
    patchActiveListing({ name, title: name });
    syncSeoTitle(name);
  };

  const addListing = () => {
    const stamp = nowStamp();
    const listing: SearchListing = {
      id: `sl-${Date.now()}`,
      name: "Search Listing ใหม่",
      title: "Search Listing ใหม่",
      description: "",
      contentType: "job",
      createdAt: stamp,
      updatedAt: stamp,
    };
    setListings((current) => [listing, ...current]);
    setItemsByListing((current) => ({ ...current, [listing.id]: [] }));
    openEdit(listing);
    message.success("สร้างแล้ว เพิ่มรายการได้ที่แท็บ Items");
  };

  const deleteListing = (id: string) => {
    const next = listings.filter((listing) => listing.id !== id);
    setListings(next);
    setItemsByListing((current) => {
      const { [id]: _removed, ...rest } = current;
      return rest;
    });
    if (activeJobId === id) {
      setActiveJobId(next[0]?.id ?? "");
      setScreen("list");
    }
    message.success("ลบ Search Listing แล้ว");
  };

  const addCustomForm = () => {
    const stamp = nowStamp();
    const formItem: CustomFormListing = {
      id: `form-${Date.now()}`,
      name: "ฟอร์มใหม่",
      title: "New Form",
      description: "เริ่มสร้างฟอร์มใหม่พร้อมข้อความหลายภาษา",
      languages: ["TH", "EN", "CN"],
      fields: 0,
      createdAt: stamp,
      updatedAt: stamp,
    };
    setCustomForms((current) => [formItem, ...current]);
    setActiveFormId(formItem.id);
    setFormScreen("edit");
    message.success("สร้างฟอร์มใหม่แล้ว");
  };

  const openCustomFormEdit = (formItem: CustomFormListing) => {
    setActiveFormId(formItem.id);
    setFormScreen("edit");
  };

  const patchActiveCustomForm = (partial: Partial<CustomFormListing>) => {
    setCustomForms((current) =>
      current.map((formItem) =>
        formItem.id === activeFormId
          ? { ...formItem, updatedAt: nowStamp(), ...partial }
          : formItem,
      ),
    );
  };

  const deleteCustomForm = (id: string) => {
    const next = customForms.filter((formItem) => formItem.id !== id);
    setCustomForms(next);
    if (activeFormId === id) {
      setActiveFormId(next[0]?.id ?? "");
      setFormScreen("list");
    }
    message.success("ลบฟอร์มแล้ว");
  };

  const exportEntriesCsv = () => {
    const headers = [
      "Submitted At",
      "Form",
      "Language",
      "Submitted By",
      "Email",
      "Phone",
      "Answers",
      "Referrer",
      "Landing URL",
      "Submit URL",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "GCLID",
      "FBCLID",
    ];
    const rows = filteredEntries.map((entry) => [
      entry.submittedAt,
      entry.formName,
      entry.language,
      entry.submitter,
      entry.email,
      entry.phone,
      Object.entries(entry.answers)
        .map(([label, value]) => `${label}: ${entryAnswerText(value)}`)
        .join(" | "),
      entry.tracking.referrer,
      entry.tracking.landingUrl,
      entry.tracking.submitUrl,
      entry.tracking.utmSource,
      entry.tracking.utmMedium,
      entry.tracking.utmCampaign,
      entry.tracking.gclid,
      entry.tracking.fbclid,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `form-entries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    message.success("Export CSV แล้ว");
  };

  const deleteItem = (id: string) => {
    setItemsByListing((current) => ({
      ...current,
      [activeJobId]: (current[activeJobId] ?? []).filter((item) => item.id !== id),
    }));
    if (selectedId === id) setSelectedId(null);
    if (activeItemId === id) {
      setActiveItemId(null);
      setItemModalOpen(false);
    }
    message.success("ลบรายการแล้ว");
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
    setItemDraft(draftFromItem(item));
    setItemModalOpen(true);
  };

  const saveItem = () => {
    const title = itemDraft.title.trim();
    if (!title) {
      message.warning("ใส่ชื่อรายการก่อนบันทึก");
      return;
    }
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
    const detailSections =
      type === "job"
        ? {
            responsibilities: parseLines(itemDraft.responsibilities),
            qualifications: parseLines(itemDraft.qualifications),
            benefits: parseLines(itemDraft.benefits),
          }
        : {
            body: bodyHtml,
            benefits:
              type === "product" ? parseLines(itemDraft.benefits) : undefined,
          };
    const shared = {
      title,
      status: itemDraft.status.trim(),
      category: itemDraft.category.trim(),
      location: itemDraft.location.trim(),
      description: itemDraft.description.trim(),
      publishedAt: itemDraft.publishedAt.trim() || undefined,
      sku: type === "product" ? itemDraft.sku.trim() || undefined : undefined,
      clickAction,
      externalUrl: url,
      coverImage: coverImage || undefined,
      ...fileFields,
      priceLabel:
        type === "download" && fileSize ? fileSize : itemDraft.priceLabel.trim(),
      detailSections,
    };
    setItemsByListing((current) => {
      const list = current[activeJobId] ?? [];
      if (activeItemId) {
        return {
          ...current,
          [activeJobId]: list.map((item) =>
            item.id === activeItemId ? { ...item, ...shared } : item,
          ),
        };
      }
      return {
        ...current,
        [activeJobId]: [
          {
            ...createBlankItem(
              clickAction,
              url,
              bodyHtml,
              coverImage || undefined,
              fileFields,
            ),
            ...shared,
          },
          ...list,
        ],
      };
    });
    patchActiveListing({ updatedAt: nowStamp() });
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
            description="รายการนี้จะถูกลบ พร้อมรายการย่อยใน Listing นี้"
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteListing(job.id)}
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

  const customFormColumns: TableColumnsType<CustomFormListing> = [
    {
      title: "",
      key: "actions",
      width: 96,
      render: (_, formItem) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            aria-label={`Edit ${formItem.name}`}
            onClick={() => openCustomFormEdit(formItem)}
          />
          <Popconfirm
            title="ลบฟอร์ม?"
            description="รายการฟอร์มนี้จะถูกลบออกจากตัวอย่าง"
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteCustomForm(formItem.id)}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${formItem.name}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
    {
      title: "Form Name",
      dataIndex: "name",
      render: (_, formItem) => (
        <div>
          <Typography.Text strong>{formItem.name}</Typography.Text>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {formItem.description}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Languages",
      dataIndex: "languages",
      width: 180,
      render: (languages: string[]) => (
        <Space size={4} wrap>
          {languages.map((lang) => (
            <Tag key={lang}>{lang}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Fields",
      dataIndex: "fields",
      width: 120,
      sorter: (a, b) => a.fields - b.fields,
    },
    {
      title: "Entries",
      key: "entries",
      width: 120,
      render: (_, formItem) => (
        <Tag color={(entryCountByForm[formItem.id] ?? 0) > 0 ? "blue" : "default"}>
          {entryCountByForm[formItem.id] ?? 0} entries
        </Tag>
      ),
      sorter: (a, b) => (entryCountByForm[a.id] ?? 0) - (entryCountByForm[b.id] ?? 0),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      width: 200,
      sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
    },
  ];

  const formEntryColumns: TableColumnsType<FormEntry> = [
    {
      title: "",
      key: "actions",
      width: 56,
      render: (_, entry) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          aria-label={`View ${entry.submitter}`}
          onClick={() => setActiveEntryId(entry.id)}
        />
      ),
    },
    {
      title: "Submitted By",
      dataIndex: "submitter",
      width: 220,
      render: (_, entry) => (
        <div>
          <Typography.Text strong>{entry.submitter}</Typography.Text>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {entry.email}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "Form",
      dataIndex: "formName",
      width: 200,
      render: (_, entry) => (
        <Space size={4} wrap>
          <Tag color="blue">{entry.formName}</Tag>
          <Tag>{entry.language}</Tag>
        </Space>
      ),
    },
    {
      title: "Submitted At",
      dataIndex: "submittedAt",
      width: 150,
      sorter: (a, b) => a.submittedAt.localeCompare(b.submittedAt),
    },
  ];

  const itemColumns: TableColumnsType<ContentItem> = [
    {
      title: "",
      key: "actions",
      width: 120,
      render: (_, item) => (
        <Space size={4}>
          <DragHandle />
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
            onConfirm={() => deleteItem(item.id)}
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
        <Button
          href={`./recommend.html#${activeJob.contentType}`}
          icon={<ExperimentOutlined />}
        >
          ดูดีไซน์ที่แนะนำ
        </Button>
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
            <ListingSettings
              settings={settings}
              config={config}
              onChange={setSettings}
              highlightViewToggle={highlightListingToggle}
            />
          ) : null}
          {tab === "card" ? (
            <CardSettings
              settings={settings}
              config={config}
              onChange={setSettings}
              onGoToListing={() => {
                setTab("listing");
                setPreviewOverride(null);
                setHighlightListingToggle(true);
              }}
            />
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
          <Input
            value={itemDraft.title}
            placeholder="ชื่อที่โชว์บนการ์ด"
            onChange={(event) => patchItemDraft({ title: event.target.value })}
          />
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
              <Input
                value={itemDraft.status}
                placeholder="เช่น เปิดรับสมัคร / Featured"
                onChange={(event) => patchItemDraft({ status: event.target.value })}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={config.categoryLabel}>
              <Input
                value={itemDraft.category}
                onChange={(event) =>
                  patchItemDraft({ category: event.target.value })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={config.locationLabel}>
              <Input
                value={itemDraft.location}
                onChange={(event) =>
                  patchItemDraft({ location: event.target.value })
                }
              />
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
                <Input
                  value={itemDraft.priceLabel}
                  onChange={(event) =>
                    patchItemDraft({ priceLabel: event.target.value })
                  }
                />
              </Form.Item>
            </Col>
          )}
          {showSku ? (
            <Col span={12}>
              <Form.Item label="SKU" extra="โชว์ได้เมื่อเลือก Source เป็น SKU ใน Display">
                <Input
                  value={itemDraft.sku}
                  onChange={(event) => patchItemDraft({ sku: event.target.value })}
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
                  value={itemDraft.publishedAt}
                  placeholder="2026-08-01 09:00"
                  onChange={(event) =>
                    patchItemDraft({ publishedAt: event.target.value })
                  }
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
            value={itemDraft.description}
            onChange={(event) =>
              patchItemDraft({ description: event.target.value })
            }
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
                value={itemDraft.responsibilities}
                onChange={(event) =>
                  patchItemDraft({ responsibilities: event.target.value })
                }
              />
            </Form.Item>
            <Form.Item label="Qualifications" extra="หนึ่งข้อต่อหนึ่งบรรทัด">
              <Input.TextArea
                rows={4}
                value={itemDraft.qualifications}
                onChange={(event) =>
                  patchItemDraft({ qualifications: event.target.value })
                }
              />
            </Form.Item>
          </>
        ) : null}

        {showBenefits ? (
          <Form.Item label="Benefits" extra="หนึ่งข้อต่อหนึ่งบรรทัด">
            <Input.TextArea
              rows={3}
              value={itemDraft.benefits}
              onChange={(event) =>
                patchItemDraft({ benefits: event.target.value })
              }
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

  const renderCustomFormsListScreen = () => (
    <>
      <Flex className="cms-page-head" align="center" justify="space-between" wrap gap={12}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Custom Forms
          </Typography.Title>
          <Typography.Text type="secondary">
            จัดการแบบฟอร์มหลายภาษา ก่อนเข้าไปแก้ไขฟิลด์และข้อความในแต่ละฟอร์ม
          </Typography.Text>
        </div>
        <Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: "rgba(0,0,0,0.25)" }} />}
            placeholder="Search forms"
            value={formQuery}
            onChange={(event) => setFormQuery(event.target.value)}
            style={{ width: 280 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={addCustomForm}>
            Add
          </Button>
        </Space>
      </Flex>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={customFormColumns}
          dataSource={filteredCustomForms}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} รายการ`,
          }}
        />
      </Card>
    </>
  );

  const renderCustomFormEditScreen = () => (
    <>
      <Flex className="custom-form-edit-head" align="center" justify="space-between" wrap gap={12}>
        <div>
          <Breadcrumb
            style={{ marginBottom: 8 }}
            items={[
              {
                title: (
                  <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => setFormScreen("list")}
                    style={{ padding: 0, height: "auto" }}
                  >
                    Custom Forms
                  </Button>
                ),
              },
              { title: activeCustomForm?.name ?? "New Form" },
            ]}
          />
          <Typography.Title level={3} style={{ margin: 0 }}>
            {activeCustomForm?.name === "ฟอร์มใหม่" ? "New Form" : "Edit Form"}
          </Typography.Title>
          <Typography.Text type="secondary">Custom Form Detail</Typography.Text>
        </div>
        <Button
          type="primary"
          disabled={!activeCustomForm?.name.trim()}
          onClick={() => message.success("บันทึกฟอร์มแล้ว")}
        >
          Save
        </Button>
      </Flex>

      <Card className="custom-form-detail-card" styles={{ body: { padding: 24 } }}>
        <label className="custom-form-name-field">
          <span>
            Form Name <strong>*</strong>
          </span>
          <Input
            size="large"
            value={activeCustomForm?.name ?? ""}
            onChange={(event) => patchActiveCustomForm({ name: event.target.value })}
            placeholder="Enter form name"
          />
        </label>
      </Card>

      <FormBuilderModule />
    </>
  );

  const renderFormEntriesScreen = () => (
    <>
      <Flex className="cms-page-head" align="center" justify="space-between" wrap gap={12}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Form Entries
          </Typography.Title>
          <Typography.Text type="secondary">
            ดูข้อมูลที่ผู้ใช้กรอกเข้ามาจากแต่ละฟอร์ม พร้อมค้นหาและกรองตามฟอร์ม
          </Typography.Text>
        </div>
        <Space wrap>
          <Select
            value={entryFormFilter}
            onChange={setEntryFormFilter}
            style={{ width: 240 }}
            options={[
              { value: "all", label: "All forms" },
              ...customForms.map((formItem) => ({
                value: formItem.id,
                label: formItem.name,
              })),
            ]}
          />
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: "rgba(0,0,0,0.25)" }} />}
            placeholder="Search entries"
            value={entryQuery}
            onChange={(event) => setEntryQuery(event.target.value)}
            style={{ width: 280 }}
          />
        </Space>
      </Flex>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          className="entries-table"
          rowKey="id"
          columns={formEntryColumns}
          dataSource={filteredEntries}
          scroll={{ x: 626 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} entries`,
          }}
        />
      </Card>

      <Modal
        title="Entry Detail"
        className="entry-detail-modal"
        open={Boolean(activeEntry)}
        onCancel={() => setActiveEntryId(null)}
        width={760}
        footer={[
          <Button key="close" onClick={() => setActiveEntryId(null)}>
            Close
          </Button>,
        ]}
      >
        {activeEntry ? (
          <div className="entry-detail">
            <Card size="small" className="entry-summary-card">
              <div className="entry-summary-layout">
                <div className="entry-person">
                  <Avatar size={42} icon={<InboxOutlined />} />
                  <div>
                    <Typography.Text strong className="entry-person-name">
                      {activeEntry.submitter}
                    </Typography.Text>
                    <div className="entry-person-contact">
                      <Typography.Text type="secondary">{activeEntry.email}</Typography.Text>
                      <Typography.Text type="secondary">{activeEntry.phone}</Typography.Text>
                    </div>
                  </div>
                </div>
                <div className="entry-meta-list">
                  <div className="entry-meta-item">
                    <FormOutlined />
                    <span>{activeEntry.formName}</span>
                  </div>
                  <div className="entry-meta-item">
                    <GlobalOutlined />
                    <span>{activeEntry.language}</span>
                  </div>
                  <div className="entry-meta-time">{activeEntry.submittedAt}</div>
                </div>
              </div>
            </Card>

            <div className="entry-detail-grid">
              <Card title="Form Answers" size="small">
                <div className="entry-answer-list">
                  {Object.entries(activeEntry.answers).map(([label, value]) => (
                    <div className="entry-answer-row" key={label}>
                      <Typography.Text type="secondary">{label}</Typography.Text>
                      {isImageAttachment(value) ? (
                        <div className="entry-attachment">
                          <img src={value.url} alt={value.alt ?? value.fileName} />
                          <div className="entry-attachment-info">
                            <Space size={6}>
                              <PictureOutlined />
                              <Typography.Text strong>{value.fileName}</Typography.Text>
                            </Space>
                            <Typography.Text type="secondary">{value.size}</Typography.Text>
                            <Button size="small" href={value.url} target="_blank">
                              View Image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Typography.Text>{value}</Typography.Text>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Data Tracking" size="small">
                <Typography.Text type="secondary" className="entry-section-hint">
                  Source and URL data captured when this form was submitted.
                </Typography.Text>
                <div className="entry-tracking-grid">
                  {[
                    ["Referrer", activeEntry.tracking.referrer],
                    ["Landing URL", activeEntry.tracking.landingUrl],
                    ["Submit URL", activeEntry.tracking.submitUrl],
                    ["UTM Source", activeEntry.tracking.utmSource],
                    ["UTM Medium", activeEntry.tracking.utmMedium],
                    ["UTM Campaign", activeEntry.tracking.utmCampaign],
                    ["GCLID", activeEntry.tracking.gclid],
                    ["FBCLID", activeEntry.tracking.fbclid],
                  ].map(([label, value]) => (
                    <div className="entry-tracking-item" key={label}>
                      <Typography.Text type="secondary">{label}</Typography.Text>
                      <Typography.Text className="entry-tracking-value">
                        {displayDash(value)}
                      </Typography.Text>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );

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
          <Button icon={<ExperimentOutlined />} href="./recommend.html">
            Recommended display
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addListing}
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
                  <Form.Item
                    label="Name"
                    required
                    extra="ชื่อในระบบ และหัวข้อที่ผู้เข้าชมเห็นบนหน้ารายการ"
                  >
                    <Input
                      value={activeJob.name}
                      onChange={(event) => renameListing(event.target.value)}
                    />
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
                      extra="แก้แล้วหัวข้อบนหน้ารายการเปลี่ยนตาม ถ้าต้องการชื่อคนละแบบจาก Name ให้แก้ช่องนี้"
                    >
                      <Input
                        value={activeJob.title}
                        onChange={(event) => {
                          const title = event.target.value;
                          patchActiveListing({ title });
                          syncSeoTitle(title);
                        }}
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
                  <div>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      Items
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      ลากจุดจับเพื่อสลับตำแหน่ง ลำดับนี้คือลำดับบนหน้ารายการ
                    </Typography.Text>
                  </div>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openItemModal()}>
                    Add Item
                  </Button>
                </Flex>
                <DndContext
                  sensors={itemSensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  onDragEnd={reorderItems}
                >
                  <SortableContext
                    items={items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Table
                      rowKey="id"
                      columns={itemColumns}
                      dataSource={items}
                      pagination={false}
                      components={{ body: { row: SortableItemRow } }}
                    />
                  </SortableContext>
                </DndContext>
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
          selectedKeys={[
            activeModule === "article-display"
              ? "Article Display"
              : activeModule === "custom-forms"
                ? "Custom Forms"
                : activeModule === "form-entries"
                  ? "Form Entries"
                  : "Search Listing",
          ]}
          items={MENU_ITEMS}
          onClick={({ key }) => {
            if (key === "Recommended Display") {
              window.location.href = "./recommend.html";
              return;
            }
            if (key === "Article Display") {
              setActiveModule("article-display");
              return;
            }
            if (key === "Custom Forms") {
              setActiveModule("custom-forms");
              setFormScreen("list");
              return;
            }
            if (key === "Form Entries") {
              setActiveModule("form-entries");
              return;
            }
            if (key === "Search Listing") {
              setActiveModule("search-listing");
              setScreen("list");
              return;
            }
            if (key !== "Search Listing") {
              message.info(`โมดูล ${key} ยังไม่เปิดในตัวอย่างนี้`);
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
          {activeModule === "article-display" ? (
            <ArticleBoxModule />
          ) : activeModule === "custom-forms" ? (
            formScreen === "edit" ? (
              renderCustomFormEditScreen()
            ) : (
              renderCustomFormsListScreen()
            )
          ) : activeModule === "form-entries" ? (
            renderFormEntriesScreen()
          ) : screen === "list" || !activeJob ? (
            renderListScreen()
          ) : (
            renderEditScreen()
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
