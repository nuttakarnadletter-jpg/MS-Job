import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App as AntdApp, ConfigProvider } from "antd";
import thTH from "antd/locale/th_TH";
import RecommendedGallery from "./RecommendedGallery";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      locale={thTH}
      theme={{
        token: {
          colorPrimary: "#1677ff",
          colorInfo: "#1677ff",
          borderRadius: 8,
          fontFamily:
            '"Noto Sans Thai", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          colorBgLayout: "#f5f5f5",
          colorBorderSecondary: "#f0f0f0",
        },
      }}
    >
      <AntdApp>
        <RecommendedGallery />
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
);
