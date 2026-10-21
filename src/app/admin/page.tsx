"use client";

import dynamic from "next/dynamic";
import { App, ConfigProvider, Spin } from "antd";

const AdminRoot = dynamic(() => import("@/admin/navigation/AdminRoot"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center"><Spin size="large" /></div>,
});

export default function AdminPage() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#f25f7c", borderRadius: 12, fontFamily: "Inter, sans-serif" } }}>
      <App><AdminRoot /></App>
    </ConfigProvider>
  );
}





