import { useMemo, useState } from "react";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  App as AntdApp,
  Breadcrumb,
  Button,
  Card,
  Flex,
  Input,
  Popconfirm,
  Radio,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { ArticleBoxPreview } from "./ArticleBoxPreview";
import { ArticleBoxSettings, type ArticleSettingsTab } from "./ArticleBoxSettings";
import {
  ARTICLE_ITEMS,
  SAMPLE_ARTICLE_BOXES,
  createDefaultArticleBoxSettings,
  displayLayoutLabel,
  nowStamp,
} from "../data/articles";
import type {
  ArticleBoxRecord,
  ArticleLocale,
  DevicePreview,
} from "../types";
import "../articles.css";

const TABS: { id: ArticleSettingsTab; label: string }[] = [
  { id: "content", label: "เลือกบทความ" },
  { id: "look", label: "หน้าตาการ์ด" },
  { id: "header", label: "ส่วนหัว/ปุ่ม" },
];

export function ArticleBoxModule() {
  const { message } = AntdApp.useApp();
  const [boxes, setBoxes] = useState(SAMPLE_ARTICLE_BOXES);
  const [screen, setScreen] = useState<"list" | "edit">("list");
  const [activeId, setActiveId] = useState(SAMPLE_ARTICLE_BOXES[0].id);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<ArticleSettingsTab>("look");
  const [locale, setLocale] = useState<ArticleLocale>("th");
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [savedAt, setSavedAt] = useState<Record<string, string>>(() =>
    Object.fromEntries(SAMPLE_ARTICLE_BOXES.map((box) => [box.id, JSON.stringify(box.settings)])),
  );

  const active = boxes.find((box) => box.id === activeId) ?? boxes[0];
  const dirty = active ? savedAt[active.id] !== JSON.stringify(active.settings) : false;

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return boxes;
    return boxes.filter((box) => box.name.toLowerCase().includes(keyword));
  }, [boxes, query]);

  const patchActive = (partial: Partial<ArticleBoxRecord>) => {
    if (!active) return;
    setBoxes((current) =>
      current.map((box) => (box.id === active.id ? { ...box, ...partial } : box)),
    );
  };

  const openEdit = (box: ArticleBoxRecord) => {
    setActiveId(box.id);
    setTab("look");
    setScreen("edit");
  };

  const addBox = () => {
    const stamp = nowStamp();
    const box: ArticleBoxRecord = {
      id: `ab-${Date.now()}`,
      name: "กล่องบทความใหม่",
      createdAt: stamp,
      updatedAt: stamp,
      settings: createDefaultArticleBoxSettings("กล่องบทความใหม่"),
    };
    setBoxes((current) => [box, ...current]);
    setSavedAt((current) => ({ ...current, [box.id]: JSON.stringify(box.settings) }));
    openEdit(box);
    message.success("สร้างกล่องบทความแล้ว ปรับหน้าตาได้ทันทีทางขวา");
  };

  const deleteBox = (id: string) => {
    const next = boxes.filter((box) => box.id !== id);
    setBoxes(next);
    if (activeId === id) {
      setActiveId(next[0]?.id ?? "");
      setScreen("list");
    }
    message.success("ลบกล่องบทความแล้ว");
  };

  const save = () => {
    if (!active) return;
    const stamp = nowStamp();
    patchActive({ updatedAt: stamp });
    setSavedAt((current) => ({ ...current, [active.id]: JSON.stringify(active.settings) }));
    message.success("บันทึกกล่องบทความแล้ว");
  };

  const columns: TableColumnsType<ArticleBoxRecord> = [
    {
      title: "",
      key: "actions",
      width: 96,
      render: (_, box) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            aria-label={`Edit ${box.name}`}
            onClick={() => openEdit(box)}
          />
          <Popconfirm
            title="ลบกล่องบทความ?"
            description="การตั้งค่ากล่องนี้จะถูกลบ"
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteBox(box.id)}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${box.name}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
    {
      title: "ชื่อกล่อง",
      dataIndex: "name",
      render: (_, box) => (
        <div>
          <Typography.Text strong>{box.name}</Typography.Text>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {box.settings.headerTitle.th || "ยังไม่มีหัวข้อบนหน้าเว็บ"}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "รูปแบบ",
      key: "layout",
      width: 180,
      render: (_, box) => <Tag color="purple">{displayLayoutLabel(box.settings)}</Tag>,
    },
    {
      title: "จำนวน",
      key: "count",
      width: 100,
      render: (_, box) => `${box.settings.maxItems} บทความ`,
    },
    {
      title: "อัปเดตล่าสุด",
      dataIndex: "updatedAt",
      width: 180,
    },
  ];

  if (screen === "list" || !active) {
    return (
      <>
        <Flex className="cms-page-head" align="center" justify="space-between" wrap gap={12}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              บทความ
            </Typography.Title>
            <Typography.Text type="secondary">
              ตั้งค่ากล่องแสดงบทความบนหน้าเว็บ เช่น หน้าแรก หรือหน้าหมวด
            </Typography.Text>
          </div>
          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined style={{ color: "rgba(0,0,0,0.25)" }} />}
              placeholder="ค้นหากล่องบทความ"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ width: 260 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={addBox}>
              เพิ่มกล่อง
            </Button>
          </Space>
        </Flex>
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => `${total} กล่อง`,
            }}
          />
        </Card>
      </>
    );
  }

  return (
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
                บทความ
              </Button>
            ),
          },
          { title: active.name },
        ]}
      />

      <Flex className="cms-page-head" align="flex-start" justify="space-between" wrap gap={12}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Input
            value={active.name}
            onChange={(event) => {
              const name = event.target.value;
              patchActive({
                name,
                settings: { ...active.settings, name },
              });
            }}
            variant="borderless"
            style={{
              fontSize: 24,
              fontWeight: 700,
              padding: 0,
              maxWidth: 520,
              height: 36,
            }}
            aria-label="ชื่อกล่องในระบบ"
          />
          <div>
            <Typography.Text type="secondary">
              ชื่อในระบบ · หัวข้อที่ผู้เข้าชมเห็นตั้งในแท็บส่วนหัว
            </Typography.Text>
            {dirty ? <span className="abox-dirty"> · ยังไม่บันทึก</span> : null}
          </div>
        </div>
        <Space wrap>
          <Radio.Group
            value={locale}
            optionType="button"
            buttonStyle="solid"
            onChange={(event) => setLocale(event.target.value)}
          >
            <Radio.Button value="th">ไทย</Radio.Button>
            <Radio.Button value="en">English</Radio.Button>
          </Radio.Group>
          <Button
            icon={previewOpen ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => setPreviewOpen((open) => !open)}
          >
            {previewOpen ? "ซ่อนพรีวิว" : "แสดงพรีวิว"}
          </Button>
          <Button type="primary" onClick={save} disabled={!dirty}>
            บันทึก
          </Button>
        </Space>
      </Flex>

      <div className="display-builder-card">
        <div className="builder-workspace">
          <div className="builder-control-bar">
            <div className="page-title">
              <span className="module-kicker">กล่องแสดงบทความ</span>
              <h3>{previewOpen ? "ปรับแล้วเห็นผลทันที" : "ตั้งค่าแบบเต็มจอ"}</h3>
              <p>
                {previewOpen
                  ? "ซ้ายตั้งค่า · ขวาคือกล่องบทความบนหน้าเว็บ"
                  : "พรีวิวถูกซ่อนแล้ว — เปิดอีกครั้งได้ทุกเมื่อ"}
              </p>
            </div>
            <Space wrap>
              <Tabs
                className="abox-line-tabs"
                activeKey={tab}
                onChange={(key) => setTab(key as ArticleSettingsTab)}
                items={TABS.map((item) => ({
                  key: item.id,
                  label: item.label,
                }))}
              />
              <Button
                icon={previewOpen ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setPreviewOpen((open) => !open)}
              >
                {previewOpen ? "ซ่อนพรีวิว" : "แสดงพรีวิว"}
              </Button>
            </Space>
          </div>
          <div className={`layout abox-layout${previewOpen ? "" : " preview-hidden"}`}>
            <ArticleBoxSettings
              settings={active.settings}
              tab={tab}
              locale={locale}
              onChange={(settings) => patchActive({ settings })}
            />
            {previewOpen ? (
              <ArticleBoxPreview
                settings={active.settings}
                items={ARTICLE_ITEMS}
                locale={locale}
                device={device}
                onDeviceChange={setDevice}
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
