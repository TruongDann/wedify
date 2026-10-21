"use client";

import { useState } from "react";
import { Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DataTable } from "@/admin/components/DataTable";
import { RecordDetailDrawer } from "@/admin/components/RecordDetailDrawer";
import { ResourceFormModal } from "@/admin/components/ResourceFormModal";
import { ResourceToolbar } from "@/admin/components/ResourceToolbar";
import { RowActions } from "@/admin/components/RowActions";
import { TaxonomyManagerModal } from "@/admin/components/TaxonomyManagerModal";
import { useResource } from "@/admin/hooks/useResource";
import { getResourceColumns } from "@/admin/screens/resources/columns";
import { adminStyles as styles } from "@/admin/theme/theme";
import type { AnyRow, ResourceModuleKey } from "@/admin/types";

const editableModules: ResourceModuleKey[] = ["users", "invitations", "templates", "components", "plans", "subscriptions"];
const deletableModules: ResourceModuleKey[] = ["users", "invitations", "templates", "components", "subscriptions", "affiliates", "wishes"];

export function ResourcesScreen({ module }: { module: ResourceModuleKey }) {
  const [selected, setSelected] = useState<AnyRow | null>(null);
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [taxonomy, setTaxonomy] = useState<"categories" | "styles" | null>(null);
  const { data, loading, load, mutate, remove, setSearch } = useResource(module);
  const canEdit = editableModules.includes(module);
  const canDelete = deletableModules.includes(module);
  const columns: ColumnsType<AnyRow> = [
    ...getResourceColumns(module, mutate, setSelected),
    ...((canEdit || canDelete) ? [{ title: "Thao tác", fixed: "right" as const, width: 150, render: (_: unknown, record: AnyRow) => <RowActions record={record} canEdit={canEdit} canDelete={canDelete} onEdit={setEditing} onDelete={remove} /> }] : []),
  ];

  return <Card className={styles.panel}>
    <ResourceToolbar module={module} canCreate={canEdit && module !== "plans"} onSearch={setSearch} onReload={load} onCreate={() => setEditing({})} onManageCategories={() => setTaxonomy("categories")} onManageStyles={() => setTaxonomy("styles")} />
    <DataTable<AnyRow> loading={loading} dataSource={data} columns={columns} scroll={{ x: 1100 }} pagination={{ pageSize: 20, showSizeChanger: false }} />
    <RecordDetailDrawer record={selected} onClose={() => setSelected(null)} />
    {editing && <ResourceFormModal module={module} record={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    {taxonomy && <TaxonomyManagerModal open type={taxonomy} onClose={() => setTaxonomy(null)} onChanged={load} />}
  </Card>;
}
