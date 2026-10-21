"use client";

import { useState, type ReactNode } from "react";
import { Layout } from "antd";
import { AdminHeader } from "@/admin/components/AdminHeader";
import { AdminSidebar } from "@/admin/components/AdminSidebar";
import { adminStyles as styles } from "@/admin/theme/theme";
import type { AnyRow, ModuleKey } from "@/admin/types";

type Props = { activeModule: ModuleKey; children: ReactNode; user: AnyRow; onModuleChange: (module: ModuleKey) => void; onLogout: () => void };

export function AdminLayout({ activeModule, children, user, onModuleChange, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  return <Layout className={styles.root}><AdminSidebar collapsed={collapsed} activeModule={activeModule} onModuleChange={onModuleChange} /><Layout className={styles.shell}><AdminHeader collapsed={collapsed} activeModule={activeModule} user={user} onToggle={() => setCollapsed(value => !value)} onLogout={onLogout} /><Layout.Content className={styles.content}>{children}</Layout.Content></Layout></Layout>;
}


