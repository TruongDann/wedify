import { Input, Space, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { ActionButton } from "@/admin/components/ActionButton";
import { moduleLabels } from "@/admin/navigation/menu";
import { adminStyles as styles } from "@/admin/theme/theme";
import type { ResourceModuleKey } from "@/admin/types";

type Props = { module: ResourceModuleKey; canCreate: boolean; onSearch: (value: string) => void; onReload: () => void; onCreate: () => void; onManageCategories?: () => void; onManageStyles?: () => void };

export function ResourceToolbar({ module, canCreate, onSearch, onReload, onCreate, onManageCategories, onManageStyles }: Props) {
  const searchable = module === "users" || module === "invitations";
  return <div className={styles.toolbar}>
    <div><Typography.Title level={4} className="!m-0">{moduleLabels[module]}</Typography.Title><Typography.Text type="secondary">Quản lý dữ liệu và thao tác vận hành</Typography.Text></div>
    <Space wrap>{searchable && <Input.Search allowClear placeholder="Tìm kiếm..." onSearch={onSearch} className="w-[260px]" />}{module === "templates" && <><ActionButton size="small" onClick={onManageCategories}>Danh mục</ActionButton><ActionButton size="small" onClick={onManageStyles}>Phong cách</ActionButton></>}<ActionButton icon={<ReloadOutlined />} onClick={onReload}>Làm mới</ActionButton>{canCreate && <ActionButton type="primary" onClick={onCreate}>Thêm mới</ActionButton>}</Space>
  </div>;
}


