"use client";

import { useCallback, useEffect, useState } from "react";
import { Form, Input, InputNumber, Modal, Popconfirm, Space } from "antd";
import { ActionButton } from "@/admin/components/ActionButton";
import { DataTable } from "@/admin/components/DataTable";
import { request } from "@/admin/api/client";
import { adminMessage as message } from "@/admin/utils/message";
import type { AnyRow } from "@/admin/types";

type TaxonomyType = "categories" | "styles";
type Props = { open: boolean; type: TaxonomyType; onClose: () => void; onChanged: () => void };

export function TaxonomyManagerModal({ open, type, onClose, onChanged }: Props) {
  const [form] = Form.useForm();
  const [items, setItems] = useState<AnyRow[]>([]);
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [saving, setSaving] = useState(false);
  const endpoint = type === "categories" ? "/template-categories" : "/template-styles";
  const label = type === "categories" ? "danh mục" : "phong cách";

  const load = useCallback(() => request(endpoint).then(setItems).catch(error => message.error(error.message)), [endpoint]);
  useEffect(() => { if (open) load(); }, [open, load]);

  const startEdit = (record?: AnyRow) => {
    const next = record || {};
    setEditing(next);
    form.setFieldsValue({ name: next.name, description: next.description, sortOrder: next.sortOrder ?? 0 });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await request(editing?.id ? `${endpoint}/${editing.id}` : endpoint, { method: editing?.id ? "PATCH" : "POST", body: JSON.stringify(values) });
      message.success(editing?.id ? `Đã cập nhật ${label}` : `Đã thêm ${label}`);
      setEditing(null); form.resetFields(); load(); onChanged();
    } catch (error) { if (error instanceof Error) message.error(error.message); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    try { await request(`${endpoint}/${id}`, { method: "DELETE" }); message.success(`Đã xóa ${label}`); load(); onChanged(); }
    catch (error) { message.error((error as Error).message); }
  };

  return <Modal open={open} title={`Quản lý ${label}`} width={760} onCancel={onClose} footer={null} destroyOnHidden>
    <div className="mb-4 flex justify-end"><ActionButton type="primary" size="small" onClick={() => startEdit()}>Thêm {label}</ActionButton></div>
    <DataTable<AnyRow> size="small" dataSource={items} pagination={false} columns={[{ title: "Tên", dataIndex: "name" }, { title: "Slug", dataIndex: "slug" }, { title: "Thứ tự", dataIndex: "sortOrder", width: 90 }, { title: "Thao tác", width: 150, render: (_, record) => <Space><ActionButton size="small" onClick={() => startEdit(record)}>Sửa</ActionButton><Popconfirm title={`Xóa ${label}?`} onConfirm={() => remove(record.id)}><ActionButton danger size="small">Xóa</ActionButton></Popconfirm></Space> }]} />
    <Modal open={Boolean(editing)} title={`${editing?.id ? "Sửa" : "Thêm"} ${label}`} onCancel={() => setEditing(null)} onOk={save} confirmLoading={saving} destroyOnHidden>
      <Form form={form} layout="vertical"><Form.Item name="name" label="Tên" rules={[{ required: true, message: "Vui lòng nhập tên" }]}><Input maxLength={100} /></Form.Item><Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} maxLength={255} showCount /></Form.Item><Form.Item name="sortOrder" label="Thứ tự"><InputNumber min={0} className="!w-full" /></Form.Item></Form>
    </Modal>
  </Modal>;
}
