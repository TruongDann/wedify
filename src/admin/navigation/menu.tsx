import {
  AppstoreOutlined, DashboardOutlined, DollarOutlined, FileTextOutlined, GiftOutlined,
  HeartOutlined, SafetyCertificateOutlined, SettingOutlined, ShareAltOutlined,
  TeamOutlined, WalletOutlined,
} from "@ant-design/icons";
import type { ModuleKey } from "@/admin/types";

export const moduleLabels: Record<ModuleKey, string> = {
  dashboard: "Tổng quan", users: "Người dùng", invitations: "Thiệp online",
  templates: "Kho mẫu", components: "Component theo gói", plans: "Gói dịch vụ", subscriptions: "Thanh toán & gói",
  withdrawals: "Yêu cầu rút tiền", gifts: "Quà mừng", affiliates: "Affiliate",
  wishes: "Kiểm duyệt", system: "Hệ thống",
};

export const adminNavigation = [
  { key: "dashboard", icon: <DashboardOutlined />, label: moduleLabels.dashboard },
  { key: "users", icon: <TeamOutlined />, label: moduleLabels.users },
  { key: "invitations", icon: <HeartOutlined />, label: moduleLabels.invitations },
  { key: "templates", icon: <AppstoreOutlined />, label: moduleLabels.templates },
  { key: "commerce", icon: <DollarOutlined />, label: "Kinh doanh", children: [
    { key: "plans", icon: <SettingOutlined />, label: moduleLabels.plans },
    { key: "subscriptions", icon: <FileTextOutlined />, label: moduleLabels.subscriptions },
    { key: "withdrawals", icon: <WalletOutlined />, label: moduleLabels.withdrawals },
    { key: "gifts", icon: <GiftOutlined />, label: moduleLabels.gifts },
    { key: "affiliates", icon: <ShareAltOutlined />, label: moduleLabels.affiliates },
  ]},
  { key: "wishes", icon: <SafetyCertificateOutlined />, label: moduleLabels.wishes },
  { key: "system", icon: <SettingOutlined />, label: moduleLabels.system },
];


