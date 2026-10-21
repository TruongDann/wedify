"use client";

import { useEffect, useState } from "react";
import { App, ConfigProvider } from "antd";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { LoadingState } from "@/admin/components/LoadingState";
import { useAdminSession } from "@/admin/hooks/useAdminSession";
import { LoginScreen } from "@/admin/screens/auth/LoginScreen";
import { AdminNavigator } from "@/admin/navigation/AdminNavigator";
import { bindAdminMessage } from "@/admin/utils/message";
import type { ModuleKey } from "@/admin/types";

function AdminRootContent() {
  const { message } = App.useApp();
  const { ready, user, setUser, logout } = useAdminSession();
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");

  useEffect(() => {
    bindAdminMessage(message);
    return () => bindAdminMessage(null);
  }, [message]);

  if (!ready) return <LoadingState fullscreen />;
  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <AdminLayout activeModule={activeModule} user={user} onModuleChange={setActiveModule} onLogout={logout}>
      <AdminNavigator module={activeModule} />
    </AdminLayout>
  );
}

export default function AdminRoot() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#f25f7c", borderRadius: 12, fontFamily: "Inter, Quicksand, sans-serif" } }}>
      <App><AdminRootContent /></App>
    </ConfigProvider>
  );
}




