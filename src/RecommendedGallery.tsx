import { useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
  DesktopOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import {
  Button,
  Flex,
  Layout,
  Segmented,
  Space,
  Typography,
} from "antd";
import { LivePreview } from "./components/LivePreview";
import { SAMPLE_ITEMS } from "./data/content";
import {
  RECOMMENDED_DISPLAYS,
  RECOMMENDED_TYPE_ORDER,
} from "./data/recommended";
import type { ContentTypeId, DevicePreview, PreviewMode } from "./types";
import "./styles.css";
import "./cms-shell.css";

const { Header, Content } = Layout;

function typeFromHash(): ContentTypeId {
  const hash = window.location.hash.replace("#", "") as ContentTypeId;
  return RECOMMENDED_DISPLAYS[hash] ? hash : "job";
}

export default function RecommendedGallery() {
  const [type, setType] = useState<ContentTypeId>(typeFromHash);
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [mode, setMode] = useState<PreviewMode>("listing");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rec = RECOMMENDED_DISPLAYS[type];
  const items = SAMPLE_ITEMS[type];

  useEffect(() => {
    const sync = () => setType(typeFromHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (window.location.hash.replace("#", "") !== type) {
      window.history.replaceState(null, "", `#${type}`);
    }
    setMode("listing");
    setSelectedId(items[0]?.id ?? null);
  }, [type, items]);

  return (
    <Layout className="cms-app recommend-page">
      <Header className="cms-header">
        <div className="cms-header-left">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            href="./index.html"
          >
            Search Listing
          </Button>
          <span className="cms-business-name">Recommended Display</span>
        </div>
      </Header>

      <Content className="cms-shell-content">
        <Flex className="cms-page-head" align="flex-start" justify="space-between" wrap gap={12}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Recommended Display
            </Typography.Title>
            <Typography.Text type="secondary">
              ผลดีไซน์ที่แนะนำต่อ Content Type
            </Typography.Text>
          </div>
        </Flex>

        <Segmented
          className="recommend-type-switch"
          value={type}
          onChange={(value) => setType(value as ContentTypeId)}
          options={RECOMMENDED_TYPE_ORDER.map((id) => ({
            value: id,
            label: RECOMMENDED_DISPLAYS[id].label,
          }))}
        />

        <div className="recommend-preview">
          <Flex justify="space-between" align="center" wrap gap={8} className="recommend-preview-bar">
            <Typography.Text strong>ผลที่ผู้เข้าชมเห็น</Typography.Text>
            <Space wrap>
              <Segmented
                value={mode}
                onChange={(value) => setMode(value as PreviewMode)}
                options={[
                  { value: "listing", label: "หน้ารายการ" },
                  { value: "detail", label: "หน้ารายละเอียด" },
                ]}
              />
              <Segmented
                value={device}
                onChange={(value) => setDevice(value as DevicePreview)}
                options={[
                  { value: "desktop", icon: <DesktopOutlined />, label: "Desktop" },
                  { value: "mobile", icon: <MobileOutlined />, label: "Mobile" },
                ]}
              />
            </Space>
          </Flex>
          <LivePreview
            key={type}
            settings={rec.settings}
            items={items}
            device={device}
            mode={mode}
            selectedId={selectedId}
            toolbarLabel={`แนะนำสำหรับ ${rec.label}`}
            pageSize={
              device === "mobile"
                ? 3
                : rec.settings.listing.defaultView === "grid"
                  ? rec.settings.listing.columns * 3
                  : 6
            }
            onDeviceChange={setDevice}
            onModeChange={setMode}
            onSelect={setSelectedId}
          />
        </div>
      </Content>
    </Layout>
  );
}
