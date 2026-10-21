import { Avatar, Dropdown, Layout, Tooltip } from "antd";
import { BellOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { ActionButton } from "@/admin/components/ActionButton";
import { moduleLabels } from "@/admin/navigation/menu";
import { adminStyles as styles } from "@/admin/theme/theme";
import type { AnyRow, ModuleKey } from "@/admin/types";

type Props = {
  collapsed: boolean;
  activeModule: ModuleKey;
  user: AnyRow;
  onToggle: () => void;
  onLogout: () => void;
};

export function AdminHeader({ collapsed, activeModule, user, onToggle, onLogout }: Props) {
  const displayName = String(user.name || user.email || "Administrator");

  return (
    <Layout.Header className={styles.header}>
      <div className="flex min-w-0 items-center gap-4">
        <ActionButton
          type="text"
          aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className="!grid !size-10 !shrink-0 !place-items-center !text-[#536078] hover:!bg-[#f2f5fa]"
        />
        <div className="min-w-0">
          <h1 className={styles.pageTitle}>{moduleLabels[activeModule]}</h1>
          <p className="!m-0 mt-1 truncate text-[13px] leading-5 text-[#7a879d]">
            Quản trị và vận hành nền tảng Wedify
          </p>
        </div>
      </div>

      <div className="ml-6 flex shrink-0 items-center gap-3">
        <Tooltip title="Thông báo">
          <ActionButton
            shape="circle"
            aria-label="Thông báo"
            icon={<BellOutlined />}
            className="!grid !size-10 !place-items-center !border-[#e5eaf2] !bg-white !text-[#344054] shadow-sm"
          />
        </Tooltip>
        <Dropdown menu={{ items: [{ key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", onClick: onLogout }] }} trigger={["click"]}>
          <button type="button" className="flex cursor-pointer items-center gap-2.5 rounded-xl border-0 bg-transparent px-2 py-1.5 text-[#172033] transition-colors hover:bg-[#f2f5fa]">
            <Avatar className="!bg-gradient-to-br !from-[#ff8faa] !to-[#f25f7c] !text-white">
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            <span className="max-w-40 truncate text-sm font-semibold max-[700px]:hidden">{displayName}</span>
          </button>
        </Dropdown>
      </div>
    </Layout.Header>
  );
}
