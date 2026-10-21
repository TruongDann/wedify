import { Tag } from "antd";
import { statusColor } from "@/admin/utils/format";

export function StatusTag({ value }: { value?: string }) {
  if (!value) return <>—</>;
  return <Tag color={statusColor(value)}>{value.replaceAll("_", " ")}</Tag>;
}


