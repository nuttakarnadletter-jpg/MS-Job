import type { ContentTypeId, DisplaySettings } from "../types";
import { CONTENT_TYPES, createDefaultSettings } from "./content";
import { searchPlaceholderFor } from "./search";

export interface RecommendedDisplay {
  type: ContentTypeId;
  label: string;
  headline: string;
  why: string;
  listingNotes: string[];
  cardNotes: string[];
  detailNotes: string[];
  settings: DisplaySettings;
}

function withRecommended(
  type: ContentTypeId,
  listing: Partial<DisplaySettings["listing"]>,
  card: Partial<DisplaySettings["card"]>,
  detail: Partial<DisplaySettings["detail"]>,
): DisplaySettings {
  const base = createDefaultSettings(type);
  const nextListing = { ...base.listing, ...listing };
  if (listing.searchFields) {
    nextListing.searchPlaceholder = searchPlaceholderFor(
      CONTENT_TYPES[type],
      listing.searchFields,
    );
  }
  return {
    ...base,
    listing: nextListing,
    card: { ...base.card, ...card },
    detail: { ...base.detail, ...detail },
  };
}

export const RECOMMENDED_DISPLAYS: Record<ContentTypeId, RecommendedDisplay> = {
  job: {
    type: "job",
    label: "Job",
    headline: "กริด 3 การ์ดต่อแถว ไม่มีรูป เทียบเงินเดือนกับสถานที่ได้เร็ว",
    why: "ผู้สมัครสแกนตำแหน่งจากชื่อและเงินเดือน ไม่ได้เลือกจากรูป แผนก หรือสถานที่บนการ์ด จึงซ่อนฟิลด์เหล่านั้น จัด 3 ใบต่อแถวให้อ่านหลายตำแหน่งพร้อมกัน ปุ่มสมัครอยู่ขวาบนหน้า Detail เพราะเป็น CTA หลักของหน้า",
    listingNotes: [
      "กริด 3 การ์ดต่อแถว สลับลิสต์ได้ถ้าต้องการ — มุมมองลิสต์ดึงเงินเดือนไปขวา",
      "บาร์ค้นหาเป็นช่องพิมพ์อิสระช่องเดียว ไม่มีตัวกรองด้านล่าง",
      "ไม่มีบาร์หน้าแรก — เข้าจากเมนู Careers ตรงไปหน้ารายการ",
    ],
    cardNotes: [
      "เลย์เอาต์แนวนอน ไม่แสดงรูป แผนก สถานที่ และป้ายสถานะ",
      "โชว์เงินเดือนพร้อมไอคอนค่าเริ่มต้น",
      "CTA เป็นลิงก์ อ่านเพิ่มเติม ไม่มีไอคอนหลังคำ",
    ],
    detailNotes: [
      "โชว์หน้าที่ คุณสมบัติ สวัสดิการ ไม่โชว์แผนก",
      "สถานที่ใช้ไอคอนหมุดค่าเริ่มต้น",
      "ปุ่ม Apply อยู่ขวาบน คู่กับชื่อตำแหน่ง ไม่มีแท็กเปิดรับสมัคร",
    ],
    settings: withRecommended(
      "job",
      {
        showSearch: true,
        primaryFilters: [],
        extraFilters: [],
        enableHomeBar: false,
        listingBarStyle: "card",
        columns: 3,
        pagination: "pagination",
        allowViewToggle: true,
        defaultView: "grid",
      },
      {
        layout: "horizontal",
        showThumbnail: false,
        emptyImage: "hide",
        showTitle: true,
        showDescription: true,
        showCategory: false,
        showLocation: false,
        showPrice: true,
        showStatus: false,
        showCta: true,
        ctaStyle: "link",
        ctaLabel: "อ่านเพิ่มเติม",
        ctaIcon: { mode: "none" },
        priceIcon: { mode: "default" },
        locationIcon: { mode: "default" },
      },
      {
        showPrice: true,
        showLocation: true,
        showCategory: false,
        showStatus: false,
        showResponsibilities: true,
        showQualifications: true,
        showBenefits: true,
        showBody: false,
        primaryAction: "Apply Now",
        ctaPosition: "topRight",
      },
    ),
  },
  blog: {
    type: "blog",
    label: "Blog / News",
    headline: "กริดรูปด้านบน อ่านต่อแบบบทความ",
    why: "บทความขายด้วยหัวข้อ รูปปก และวันที่ ไม่ใช่ราคา กริด 3 คอลัมน์สแกนได้เร็ว โหลดเพิ่มเหมาะกับคอนเทนต์ที่อัปเดตต่อเนื่อง หน้า Detail คือเนื้อหาเต็ม ไม่ใช่ฟอร์มสมัคร",
    listingNotes: [
      "กริด 3 คอลัมน์ ไม่ต้องสลับมุมมอง",
      "บาร์ค้นหาเป็นช่องพิมพ์อิสระช่องเดียว ตัวกรองหมวดกับปีอยู่ด้านขวา",
      "ไม่ฝังบาร์หน้าแรกเป็นค่าเริ่มต้น — เข้าจากเมนูบทความ/ข่าว",
      "ใช้เลขหน้า เพราะสแกนกริดได้เป็นชุด",
    ],
    cardNotes: [
      "รูปปกด้านบน วันที่อยู่เหนือหัวข้อ ไม่มีไอคอนวัน",
      "ไม่โชว์หมวด ผู้เขียน และป้าย Featured / ใหม่",
      "CTA เป็นลิงก์ อ่านเพิ่มเติม ไม่มีไอคอนหลังคำ",
    ],
    detailNotes: [
      "ซ้ายพื้นเหลือง 20% สำหรับหัวข้อ วันที่ ผู้เขียน ขวา 80% เป็นรูป",
      "โชว์วันที่และผู้เขียน ไม่โชว์แท็กสถานะ",
      "เนื้อหาบทความมีหัวข้อย่อยและ bullet",
    ],
    settings: withRecommended(
      "blog",
      {
        showSearch: true,
        primaryFilters: [],
        extraFilters: ["category", "year"],
        enableHomeBar: false,
        listingBarStyle: "card",
        columns: 3,
        pagination: "pagination",
        allowViewToggle: false,
        defaultView: "grid",
      },
      {
        layout: "top",
        showThumbnail: true,
        emptyImage: "default",
        showTitle: true,
        showDescription: true,
        showCategory: false,
        showLocation: false,
        showPrice: true,
        showStatus: false,
        showCta: true,
        ctaStyle: "link",
        ctaLabel: "อ่านเพิ่มเติม",
        ctaIcon: { mode: "none" },
        priceIcon: { mode: "none" },
        pricePlacement: "top",
      },
      {
        showPrice: true,
        showLocation: true,
        showCategory: false,
        showStatus: false,
        showResponsibilities: false,
        showQualifications: false,
        showBenefits: false,
        showBody: true,
        primaryAction: "Read More",
        ctaPosition: "bottom",
      },
    ),
  },
  product: {
    type: "product",
    label: "Product",
    headline: "กริดแคตตาล็อก ราคาชัด ปุ่มติดต่อบนการ์ด",
    why: "สินค้าถูกเลือกจากรูป ชื่อ และราคา กริด 3 คอลัมน์เป็นแคตตาล็อก ปุ่มบนการ์ดช่วยให้ติดต่อได้ทันที สลับลิสต์ได้เมื่ออยากเทียบสเปกยาว",
    listingNotes: [
      "กริด 3 คอลัมน์เป็นค่าเริ่มต้น สลับลิสต์ได้",
      "ตัวกรองหลัก: หมวดหมู่กับช่วงราคา ไม่มีตัวกรองสถานะสินค้า",
      "เปิดบาร์หน้าแรก เพื่อค้นหาสินค้าจากโฮมแล้วไปหน้าแคตตาล็อก",
      "ใช้เลขหน้า เพราะแคตตาล็อกมักมีจำนวนคงที่",
    ],
    cardNotes: [
      "รูปด้านบน ป้ายสถานะมุมซ้ายบนของรูป",
      "CTA เป็นปุ่ม ไม่ใช่ลิงก์ข้อความ",
      "โชว์หมวด ไม่โชว์สถานะสินค้า",
    ],
    detailNotes: [
      "โชว์ราคา จุดเด่น และรายละเอียดสินค้า",
      "ปุ่ม Contact Us อยู่ล่างหน้า",
    ],
    settings: withRecommended(
      "product",
      {
        primaryFilters: ["category", "priceRange"],
        extraFilters: ["status"],
        enableHomeBar: true,
        homeBarStyle: "dark",
        listingBarStyle: "card",
        columns: 3,
        pagination: "pagination",
        allowViewToggle: true,
        defaultView: "grid",
      },
      {
        layout: "top",
        showThumbnail: true,
        emptyImage: "default",
        showTitle: true,
        showDescription: true,
        showCategory: true,
        showLocation: false,
        showPrice: true,
        showStatus: true,
        showCta: true,
        ctaStyle: "button",
      },
      {
        showPrice: true,
        showLocation: true,
        showCategory: true,
        showStatus: true,
        showResponsibilities: false,
        showQualifications: false,
        showBenefits: true,
        showBody: true,
        primaryAction: "Contact Us",
        ctaPosition: "bottom",
      },
    ),
  },
  download: {
    type: "download",
    label: "Download",
    headline: "กริด 3 คอลัมน์ กดดาวน์โหลดจากปุ่มบนการ์ด",
    why: "ผู้ใช้มาหาไฟล์ ไม่ได้อ่านบทความ กริด 3 คอลัมน์สแกนประเภท ภาษา และขนาดไฟล์ได้เร็ว ปุ่มดาวน์โหลดอยู่บนการ์ด เพราะคลิกแล้วได้ไฟล์ ไม่เข้าหน้ารายละเอียด",
    listingNotes: [
      "กริด 3 คอลัมน์เป็นค่าเริ่มต้น สลับลิสต์ได้",
      "ตัวกรองหลัก: ประเภทไฟล์กับภาษา",
      "ค้นจากชื่อไฟล์และคำอธิบาย",
    ],
    cardNotes: [
      "รูปด้านบน ใช้รูปเริ่มต้นถ้าไม่มีปก",
      "โชว์ขนาดไฟล์ ประเภท และภาษา",
      "CTA เป็นปุ่ม ดาวน์โหลด",
    ],
    detailNotes: [
      "ยังมีหน้าอธิบายไฟล์ถ้าต้องการ",
      "โชว์ขนาด ประเภท ภาษา และปุ่ม Download ด้านล่าง",
    ],
    settings: withRecommended(
      "download",
      {
        primaryFilters: ["category", "location"],
        extraFilters: ["status"],
        enableHomeBar: false,
        listingBarStyle: "card",
        columns: 3,
        pagination: "pagination",
        allowViewToggle: true,
        defaultView: "grid",
      },
      {
        layout: "top",
        showThumbnail: true,
        emptyImage: "default",
        showTitle: true,
        showDescription: true,
        showCategory: true,
        showLocation: true,
        showPrice: true,
        showStatus: false,
        showCta: true,
        ctaStyle: "button",
      },
      {
        showPrice: true,
        showLocation: true,
        showCategory: true,
        showStatus: false,
        showResponsibilities: false,
        showQualifications: false,
        showBenefits: false,
        showBody: true,
        primaryAction: "Download",
        ctaPosition: "bottom",
      },
    ),
  },
};

export const RECOMMENDED_TYPE_ORDER: ContentTypeId[] = [
  "job",
  "blog",
  "product",
  "download",
];

export function recommendedDisplayFor(type: ContentTypeId): RecommendedDisplay {
  return RECOMMENDED_DISPLAYS[type];
}
