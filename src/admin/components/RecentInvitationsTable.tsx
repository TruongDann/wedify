import { DataTable } from "@/admin/components/DataTable";
import { StatusTag } from "@/admin/components/StatusTag";
import type { AnyRow } from "@/admin/types";
import { formatDateTime } from "@/admin/utils/format";

export function RecentInvitationsTable({ data }: { data: AnyRow[] }) {
  return <DataTable<AnyRow> pagination={false} dataSource={data} columns={[{ title: "Thiệp", dataIndex: "title" }, { title: "Trạng thái", dataIndex: "status", render: value => <StatusTag value={value} /> }, { title: "Lượt xem", dataIndex: "viewCount" }, { title: "Cập nhật", dataIndex: "updatedAt", render: formatDateTime }]} />;
}


