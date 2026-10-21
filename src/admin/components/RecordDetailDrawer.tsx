import { Descriptions, Drawer } from "antd";
import type { AnyRow } from "@/admin/types";

export function RecordDetailDrawer({ record, onClose }: { record: AnyRow | null; onClose: () => void }) {
  const items = record ? Object.entries(record).filter(([, value]) => typeof value !== "object").map(([key, value]) => ({ key, label: key, children: String(value ?? "—") })) : [];
  return <Drawer size="large" title="Chi tiết bản ghi" open={Boolean(record)} onClose={onClose}>{record && <Descriptions bordered column={1} size="small" items={items} />}</Drawer>;
}


