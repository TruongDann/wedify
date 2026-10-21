import { Col, Row } from "antd";
import { ResourceFormField } from "@/admin/components/ResourceFormField";
import type { ResourceField } from "@/admin/api/resources";
import type { AnyRow } from "@/admin/types";
import { formatMoney } from "@/admin/utils/format";

type Props = { fields: ResourceField[]; lookups: Record<string, AnyRow[]> };

function optionsFor(field: ResourceField, lookups: Record<string, AnyRow[]>) {
  if (!field.lookup) return [];
  return (lookups[field.lookup] || []).map(item => ({
    value: String(item.id),
    label: field.lookup === "users" ? `${item.name || "Chưa có tên"} — ${item.email}` : field.lookup === "plans" ? `${item.name} (${item.tier}) — ${formatMoney(item.price)}` : field.lookup === "templates" ? `${item.name} — ${item.category} (${item.tier})` : String(item.name),
  }));
}

export function ResourceFormFields({ fields, lookups }: Props) {
  return <Row gutter={14}>{fields.map(field => <Col xs={24} md={field.name === "thumbnailUrl" ? 24 : 12} key={field.name}><ResourceFormField field={field} options={optionsFor(field, lookups)} /></Col>)}</Row>;
}


