import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App as AntdApp, ConfigProvider } from "antd";
import thTH from "antd/locale/th_TH";
import App from "./App";

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
        components: {
          Layout: {
            headerBg: "#ffffff",
            headerHeight: 64,
            headerPadding: "0 20px",
            siderBg: "#ffffff",
            bodyBg: "#f5f5f5",
          },
          Menu: {
            itemBorderRadius: 8,
            itemMarginInline: 8,
            itemHeight: 40,
          },
          Table: {
            headerBg: "#fafafa",
            headerColor: "rgba(0, 0, 0, 0.88)",
            rowHoverBg: "#f5f9ff",
          },
          Card: {
            headerFontSize: 16,
          },
        },
      }}
    >
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
);
