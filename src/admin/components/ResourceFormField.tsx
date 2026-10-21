import { Form, Input, Select } from "antd";
import { ImageUploadInput } from "@/admin/components/ImageUploadInput";
import type { ResourceField } from "@/admin/api/resources";

export type LookupOption = { label: string; value: string };

export function ResourceFormField({ field, options = [] }: { field: ResourceField; options?: LookupOption[] }) {
  let control = <Input />;
  if (field.name === "thumbnailUrl") control = <ImageUploadInput />;
  else if (field.lookup) control = <Select showSearch allowClear optionFilterProp="label" placeholder={`Chọn ${field.label.toLowerCase()}`} options={options} />;
  else if (field.options) control = <Select options={field.options.map(value => ({ value, label: value }))} />;
  else if (field.type === "password") control = <Input.Password />;
  else if (field.type === "number") control = <Input type="number" />;
  else if (field.type === "date") control = <Input type="date" />;
  else if (field.type === "json") control = <Input.TextArea rows={5} autoSize={{ minRows: 4, maxRows: 8 }} />;

  return <Form.Item name={field.name} label={field.label} rules={[{ required: field.required, message: `Vui lòng chọn/nhập ${field.label.toLowerCase()}` }]}>{control}</Form.Item>;
}


