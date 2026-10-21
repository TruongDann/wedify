import { Layout, Menu } from "antd";
import { HeartOutlined } from "@ant-design/icons";
import { adminNavigation } from "@/admin/navigation/menu";
import { adminStyles as styles } from "@/admin/theme/theme";
import type { ModuleKey } from "@/admin/types";

export function AdminSidebar({ collapsed, activeModule, onModuleChange }: { collapsed: boolean; activeModule: ModuleKey; onModuleChange: (module: ModuleKey) => void }) {
  return <Layout.Sider width={252} collapsedWidth={76} collapsed={collapsed} className={styles.sider} trigger={null} breakpoint="lg"><div className={styles.brand}><span className={styles.brandMark}><HeartOutlined /></span>{!collapsed && <span>Wedify<span className={styles.brandSub}>CONTROL CENTER</span></span>}</div><Menu theme="dark" mode="inline" className={styles.menu} items={adminNavigation} selectedKeys={[activeModule]} defaultOpenKeys={["commerce"]} onClick={({ key }) => onModuleChange(key as ModuleKey)} /></Layout.Sider>;
}


