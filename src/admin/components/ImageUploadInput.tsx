"use client";

import Image from "next/image";
import { useState } from "react";
import { Input, Space, Typography, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ActionButton } from "@/admin/components/ActionButton";
import { uploadImage } from "@/admin/api/client";
import { adminMessage as message } from "@/admin/utils/message";
export function ImageUploadInput({ value, onChange }: { value?: string; onChange?: (value: string) => void }) {
  const [uploading, setUploading] = useState(false);
  return <Space orientation="vertical" style={{ width: "100%" }}>
    {value && <Image unoptimized src={value} alt="Ảnh đã tải lên" width={560} height={140} className="h-[140px] w-full rounded-[10px] border border-[#e8edf5] object-cover" />}
    <Space.Compact style={{ width: "100%" }}>
      <Input value={value} onChange={e => onChange?.(e.target.value)} placeholder="URL hình ảnh" />
      <Upload accept="image/jpeg,image/png,image/webp,image/gif" showUploadList={false} customRequest={async options => {
        try { setUploading(true); const result = await uploadImage(options.file as File); onChange?.(result.url); options.onSuccess?.(result); message.success("Upload hình ảnh thành công"); }
        catch (e) { options.onError?.(e as Error); message.error((e as Error).message); }
        finally { setUploading(false); }
      }}><ActionButton loading={uploading} icon={<UploadOutlined />}>Upload</ActionButton></Upload>
    </Space.Compact>
    <Typography.Text type="secondary">JPG, PNG, WEBP hoặc GIF · tối đa 10MB</Typography.Text>
  </Space>;
}


