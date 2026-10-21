"use client";

import { useEffect, useState } from "react";
import { Form, Modal } from "antd";
import { moduleLabels } from "@/admin/navigation/menu";
import { ResourceFormFields } from "@/admin/components/ResourceFormFields";
import { resourceFields } from "@/admin/api/resources";
import { request } from "@/admin/api/client";
import { adminMessage as message } from "@/admin/utils/message";
import type { AnyRow, ResourceModuleKey } from "@/admin/types";

type Props = { module: ResourceModuleKey; record: AnyRow; onClose: () => void; onSaved: () => void };

export function ResourceFormModal({ module, record, onClose, onSaved }: Props) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [lookups, setLookups] = useState<Record<string, AnyRow[]>>({ users: [], plans: [], templates: [], components: [], categories: [], styles: [] });
  const isEdit = Boolean(record.id);

  useEffect(() => { request("/admin/lookups").then(setLookups).catch(error => message.error(error.message)); }, []);

  const fields = (resourceFields[module] || []).filter(field => !(isEdit && ((module === "users" && ["email", "password"].includes(field.name)) || (module === "invitations" && field.name === "userId"))));
  const initialValues = { ...record };
  if (module === "templates") {
    initialValues.categoryId = record.categoryId || record.category?.id;
    initialValues.styleId = record.styleId || record.style?.id;
  }
  if (module === "components") {
    initialValues.configJson = initialValues.configJson !== undefined && initialValues.configJson !== null ? JSON.stringify(initialValues.configJson, null, 2) : "[]";
  }
  if (initialValues.eventDate) initialValues.eventDate = String(initialValues.eventDate).slice(0, 10);
  if (initialValues.expiresAt) initialValues.expiresAt = String(initialValues.expiresAt).slice(0, 10);

  const save = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (module === "templates" && !isEdit) values.contentJson = { canvasSettings: { width: 600, height: 3200, backgroundColor: "#fffafc" }, elements: [] };
      if (module === "invitations" && !isEdit) values.contentJson = { canvasSettings: { width: 600, height: 3200, backgroundColor: "#fffafc" }, elements: [] };
      if (module === "components" && values.configJson !== undefined && values.configJson !== null && values.configJson !== "") {
        try {
          const parsed = JSON.parse(values.configJson);
          values.configJson = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          throw new Error("Cấu hình option không hợp lệ. Vui lòng nhập JSON đúng định dạng.");
        }
      } else if (module === "components") {
        values.configJson = [];
      }
      const base = module === "templates" || module === "components" ? `/${module}` : module === "plans" ? `/plans/${record.tier}` : `/admin/${module}`;
      await request(isEdit && module !== "plans" ? `${base}/${record.id}` : base, { method: isEdit ? "PATCH" : "POST", body: JSON.stringify(values) });
      message.success(isEdit ? "Đã cập nhật" : "Đã thêm mới");
      onSaved();
    } catch (error) {
      if (error instanceof Error) message.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return <Modal open title={`${isEdit ? "Sửa" : "Thêm"} ${moduleLabels[module]}`} onCancel={onClose} onOk={save} confirmLoading={saving} width={620} destroyOnHidden><Form form={form} layout="vertical" initialValues={initialValues}><ResourceFormFields fields={fields} lookups={lookups} /></Form></Modal>;
}


