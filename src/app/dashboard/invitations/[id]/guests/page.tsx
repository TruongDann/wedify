"use client";

import { Alert, Button, Card, Col, Form, Input, Modal, Row, Select, Space, Tag, Typography } from "antd";
import { useParams } from "next/navigation";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { userAuth } from "@/lib/auth";

type GuestGroup = "FAMILY" | "FRIEND" | "COLLEAGUE" | "OTHER";

type GuestRow = {
  id: string;
  name: string;
  honorific?: string;
  phone?: string;
  email?: string;
  group?: GuestGroup;
  note?: string;
  personalizedToken: string;
  createdAt?: string;
  sentAt?: string | null;
  viewedAt?: string | null;
  rsvp?: {
    status?: string;
    numberOfCompanions?: number;
    respondedAt?: string | null;
    note?: string | null;
  };
};

type InvitationInfo = {
  id: string;
  title: string;
  slug: string;
};

type RsvpStats = {
  total: number;
  sent: number;
  viewed: number;
  attending: number;
  notAttending: number;
  pending: number;
  totalAttendeesIncludingCompanions: number;
};

const groupLabels: Record<GuestGroup, string> = {
  FAMILY: "Gia đình",
  FRIEND: "Bạn bè",
  COLLEAGUE: "Đồng nghiệp",
  OTHER: "Khác",
};

const groupOptions: Array<{ value: "ALL" | GuestGroup; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "FAMILY", label: groupLabels.FAMILY },
  { value: "FRIEND", label: groupLabels.FRIEND },
  { value: "COLLEAGUE", label: groupLabels.COLLEAGUE },
  { value: "OTHER", label: groupLabels.OTHER },
];

const statusLabelMap: Record<string, string> = {
  ATTENDING: "Có mặt",
  NOT_ATTENDING: "Không đi",
  PENDING: "Chưa xác nhận",
};

const parseCsvRows = (text: string) => {
  const rows: string[][] = [];
  let current: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      current.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      current.push(value);
      if (current.some((entry) => entry.trim().length > 0)) rows.push(current);
      current = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || current.length > 0) {
    current.push(value);
    if (current.some((entry) => entry.trim().length > 0)) rows.push(current);
  }

  if (rows.length < 2) return [];

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((header) => header.trim().toLowerCase());

  return dataRows
    .filter((row) => row.some((cell) => cell.trim().length > 0))
    .map((row) => {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = (row[index] ?? "").trim();
      });
      return record;
    });
};

export default function GuestManagementPage() {
  const params = useParams<{ id: string }>();
  const invitationId = params.id;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form] = Form.useForm<{
    name: string;
    honorific?: string;
    phone?: string;
    email?: string;
    group?: GuestGroup;
    note?: string;
  }>();

  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [stats, setStats] = useState<RsvpStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<"ALL" | GuestGroup>("ALL");
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);

  const loadGuests = async () => {
    if (!invitationId) return;
    try {
      const [guestList, statsData, invitationData] = await Promise.all([
        userAuth.apiFetch<GuestRow[]>(`/invitations/${invitationId}/guests${groupFilter === "ALL" ? "" : `?group=${groupFilter}`}`),
        userAuth.apiFetch<RsvpStats>(`/rsvp/invitations/${invitationId}/rsvp-stats`),
        userAuth.apiFetch<InvitationInfo[]>("/invitations/mine"),
      ]);

      const currentInvitation = invitationData.find((item) => item.id === invitationId) ?? null;
      setInvitation(currentInvitation);
      setGuests(guestList);
      setStats(statsData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách khách mời";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, [invitationId, groupFilter]);

  const handleCreateGuest = async (values: {
    name: string;
    honorific?: string;
    phone?: string;
    email?: string;
    group?: GuestGroup;
    note?: string;
  }) => {
    if (!invitationId) return;

    await userAuth.apiFetch(`/invitations/${invitationId}/guests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        honorific: values.honorific?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        email: values.email?.trim() || undefined,
        group: values.group ?? "OTHER",
        note: values.note?.trim() || undefined,
      }),
    });

    form.resetFields();
    await loadGuests();
  };

  const handleCsvImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !invitationId) return;

    const text = await file.text();
    const rows = parseCsvRows(text);
    const guestsToCreate = rows.map((record) => {
      const resolvedGroup = String(record.group ?? record.nhom ?? "OTHER").toUpperCase();
      const finalGroup: GuestGroup = ["FAMILY", "FRIEND", "COLLEAGUE", "OTHER"].includes(resolvedGroup)
        ? (resolvedGroup as GuestGroup)
        : "OTHER";
      return {
        name: record.name || record.ten || "Khách mời",
        honorific: record.honorific || record.xung_ho || undefined,
        phone: record.phone || record.sdt || undefined,
        email: record.email || undefined,
        group: finalGroup,
        note: record.note || record.ghi_chu || undefined,
      };
    });

    await userAuth.apiFetch(`/invitations/${invitationId}/guests/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guests: guestsToCreate }),
    });

    event.target.value = "";
    await loadGuests();
  };

  const filteredGuests = groupFilter === "ALL"
    ? guests
    : guests.filter((guest) => guest.group === groupFilter);

  if (loading) {
    return <Card loading title="Đang tải khách mời" />;
  }

  if (error) {
    return <Alert type="error" message={error} showIcon />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Typography.Title level={3} className="!mb-1">Khách mời theo nhóm</Typography.Title>
        <Typography.Text type="secondary">{invitation?.title ?? "Thiệp cưới"}</Typography.Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-sm text-slate-500">Tổng khách</div>
            <div className="mt-3 text-3xl font-bold text-slate-800">{stats?.total ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-sm text-slate-500">Đã xem</div>
            <div className="mt-3 text-3xl font-bold text-cyan-600">{stats?.viewed ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-sm text-slate-500">Có mặt</div>
            <div className="mt-3 text-3xl font-bold text-emerald-600">{stats?.attending ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-sm text-slate-500">Chưa xác nhận</div>
            <div className="mt-3 text-3xl font-bold text-amber-600">{stats?.pending ?? 0}</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title="Thêm khách mời" className="shadow-sm">
            <Form form={form} layout="vertical" onFinish={handleCreateGuest}>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Vui lòng nhập tên khách" }]}> 
                    <Input placeholder="VD: Nguyễn Văn A" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Xưng hô" name="honorific">
                    <Input placeholder="Anh/Chị/Bác" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Điện thoại" name="phone">
                    <Input placeholder="090..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Email" name="email">
                    <Input placeholder="example@mail.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Nhóm" name="group" initialValue="OTHER">
                    <Select
                      options={[
                        { value: "FAMILY", label: groupLabels.FAMILY },
                        { value: "FRIEND", label: groupLabels.FRIEND },
                        { value: "COLLEAGUE", label: groupLabels.COLLEAGUE },
                        { value: "OTHER", label: groupLabels.OTHER },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea rows={3} placeholder="Thông tin thêm" />
                  </Form.Item>
                </Col>
              </Row>

              <Button htmlType="submit" type="primary">Thêm khách</Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="Import CSV" className="shadow-sm">
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                File CSV nên có cột: name, phone, email, group, honorific, note. Nhóm hợp lệ: FAMILY, FRIEND, COLLEAGUE, OTHER.
              </div>
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleCsvImport} className="block w-full" />
              <Button onClick={() => fileInputRef.current?.click()}>Chọn file CSV</Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Danh sách khách mời" className="shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          {groupOptions.map((option) => (
            <Button
              key={option.value}
              type={groupFilter === option.value ? "primary" : "default"}
              onClick={() => setGroupFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <Space direction="vertical" className="w-full">
          {filteredGuests.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Chưa có khách nào trong nhóm này.</div>
          ) : (
            filteredGuests.map((guest) => {
              const publicLink = `http://localhost:3000${invitation ? `/invitation/${invitation.slug}?g=${guest.personalizedToken}` : `?g=${guest.personalizedToken}`}`;
              return (
                <div key={guest.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-800">{guest.honorific ? `${guest.honorific} ${guest.name}` : guest.name}</div>
                        <Tag color={guest.group === "FAMILY" ? "pink" : guest.group === "FRIEND" ? "blue" : guest.group === "COLLEAGUE" ? "purple" : "default"}>
                          {guest.group ? groupLabels[guest.group] : groupLabels.OTHER}
                        </Tag>
                      </div>
                      <div className="mt-2 text-sm text-slate-500">{guest.phone || "Chưa có số điện thoại"} · {guest.email || "Chưa có email"}</div>
                      {guest.note ? <div className="mt-1 text-sm text-slate-500">Ghi chú: {guest.note}</div> : null}
                    </div>

                    <div className="flex flex-col gap-2 lg:items-end">
                      <div className="flex flex-wrap gap-2">
                        <Tag color={guest.rsvp?.status === "ATTENDING" ? "green" : guest.rsvp?.status === "NOT_ATTENDING" ? "red" : "gold"}>
                          {guest.rsvp?.status ? statusLabelMap[guest.rsvp.status] ?? guest.rsvp.status : "Chưa xác nhận"}
                        </Tag>
                        {guest.rsvp?.numberOfCompanions ? <Tag>Plus one: {guest.rsvp.numberOfCompanions}</Tag> : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="small"
                          onClick={() => {
                            const fullLink = publicLink;
                            navigator.clipboard?.writeText(fullLink).catch(() => undefined);
                          }}
                        >
                          Copy link
                        </Button>
                        <Button size="small" onClick={() => window.open(publicLink, "_blank", "noopener,noreferrer")}>Mở link</Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </Space>
      </Card>
    </div>
  );
}
