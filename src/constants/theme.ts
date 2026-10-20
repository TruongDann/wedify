import type { ThemeConfig } from "antd";

// Theme Ant Design: xanh tím chủ đạo #4F5BEF, #5865F2 cho hover, lavender #C4B5FD phối,
// nền trắng, font SN Pro. Màu khớp với token trong globals.css.
export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: "#4F5BEF",
    colorLink: "#4F5BEF",
    colorText: "#1F2040",
    colorTextSecondary: "#4A4C6A",
    colorTextTertiary: "#6B6D8C",
    colorTextQuaternary: "#A3A5BF",
    colorBorder: "#E8E4F5",
    colorBorderSecondary: "#F1EEF9",
    colorBgLayout: "#FFFFFF",
    colorFillTertiary: "#F3F0FF",
    fontFamily: "'SN Pro', system-ui, -apple-system, 'Segoe UI', sans-serif",
    borderRadius: 10,
    borderRadiusSM: 8,
    borderRadiusLG: 16,
    controlHeight: 36,
  },
  components: {
    Button: {
      colorPrimary: "#4F5BEF",
      colorPrimaryHover: "#5865F2",
      colorPrimaryActive: "#3F49D1",
      primaryShadow: "none",
      defaultShadow: "none",
      dangerShadow: "none",
      defaultBorderColor: "#D6D0EC",
      fontWeight: 600,
    },
    Segmented: {
      itemSelectedColor: "#4F5BEF",
      trackBg: "#F3F0FF",
    },
    Tabs: {
      itemSelectedColor: "#4F5BEF",
      inkBarColor: "#4F5BEF",
    },
    Slider: {
      railBg: "#E8E4F5",
      railHoverBg: "#D6D0EC",
      trackBg: "#4F5BEF",
      trackHoverBg: "#5865F2",
      handleColor: "#4F5BEF",
      handleActiveColor: "#4F5BEF",
      dotActiveBorderColor: "#4F5BEF",
    },
    Switch: {
      colorPrimary: "#4F5BEF",
      colorPrimaryHover: "#5865F2",
    },
    Tooltip: {
      colorBgSpotlight: "#1F2040",
    },
  },
};
