import { Popconfirm, Space } from "antd";
import { ActionButton } from "@/admin/components/ActionButton";
import type { AnyRow } from "@/admin/types";

export function RowActions({ record, canEdit, canDelete, onEdit, onDelete }: { record: AnyRow; canEdit: boolean; canDelete: boolean; onEdit: (row: AnyRow) => void; onDelete: (row: AnyRow) => void }) {
  return <Space>{canEdit && <ActionButton size="small" onClick={() => onEdit(record)}>Sửa</ActionButton>}{canDelete && <Popconfirm title="Xác nhận xóa bản ghi này?" description="Thao tác có thể ảnh hưởng dữ liệu liên quan." onConfirm={() => onDelete(record)}><ActionButton size="small" danger>Xóa</ActionButton></Popconfirm>}</Space>;
}


