"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Button, Card, Col, Drawer, Empty, Row, Skeleton, Switch, Table, Tabs, Tag, Typography } from "antd";
import { Heart } from "lucide-react";
import { userAuth } from "@/lib/auth";

interface Activity {
  invitation: { id: string; title: string; slug: string; status: string };
  summary: {
    views: number;
    wishes: number;
    guests: number;
    guestsViewed: number;
    gifts: number;
    giftHearts: number;
    giftValueVnd: number;
    bankTransfers: number;
    bankTransferVnd: number;
    rsvpAttending: number;
    rsvpNotAttending: number;
    rsvpCompanions: number;
    expectedPeople: number;
  };
  gifts: Array<{ id: string; type: string; senderName: string; giftName: string; emoji: string; hearts: number; amount: number; message?: string | null; createdAt: string }>;
  rsvps: Array<{ id: string; name: string; honorific?: string | null; status: string; companions: number; note?: string | null; respondedAt?: string | null }>;
  wishes: Array<{ id: string; guestName: string; message: string; isHidden: boolean; createdAt: string; gift: { name: string; emoji: string } | null }>;
  guests: Array<{ id: string; name: string; honorific?: string | null; group: string; sentAt?: string | null; viewedAt?: string | null; rsvpStatus: string }>;
}

const vnd = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
const dateTime = (value?: string | null) => (value ? new Date(value).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

const RSVP_LABEL: Record<string, { text: string; color: string }> = {
  ATTENDING: { text: "Sẽ tham dự", color: "green" },
  NOT_ATTENDING: { text: "Không tham dự", color: "red" },
  PENDING: { text: "Chưa phản hồi", color: "default" },
};

const GROUP_LABEL: Record<string, string> = { FAMILY: "Gia đình", FRIEND: "Bạn bè", COLLEAGUE: "Đồng nghiệp", OTHER: "Khác" };

const Stat: React.FC<{ label: string; value: React.ReactNode; hint?: string; color?: string }> = ({ label, value, hint, color }) => (
  <Card size="small" className="h-full shadow-sm">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="mt-1 text-2xl font-bold" style={{ color }}>{value}</div>
    {hint ? <div className="mt-0.5 text-xs text-slate-400">{hint}</div> : null}
  </Card>
);

const downloadCsv = (filename: string, rows: string[][]) => {
  const escape = (cell: string) => `"${String(cell ?? "").replace(/"/g, '""')}"`;
  // BOM để Excel mở đúng tiếng Việt
  const blob = new Blob(["﻿" + rows.map((row) => row.map(escape).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

interface Props {
  invitationId: string | null;
  title?: string;
  onClose: () => void;
}

/** Tổng hợp mọi thứ khách để lại trên thiệp: quà nhận được từ ai, ai tham dự, lời chúc, khách mời. */
export const InvitationActivityDrawer: React.FC<Props> = ({ invitationId, title, onClose }) => {
  const [data, setData] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      setData(await userAuth.apiFetch<Activity>(`/invitations/${id}/activity`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (invitationId) void load(invitationId);
    else setData(null);
  }, [invitationId, load]);

  const toggleWish = async (wishId: string, isHidden: boolean) => {
    if (!data) return;
    setData({ ...data, wishes: data.wishes.map((w) => (w.id === wishId ? { ...w, isHidden } : w)) });
    try {
      await userAuth.apiFetch(`/wishes/${wishId}/hidden`, { method: "PATCH", body: JSON.stringify({ isHidden }) });
    } catch {
      if (invitationId) void load(invitationId);
    }
  };

  const s = data?.summary;

  const tabs = [
    {
      key: "overview",
      label: "Tổng quan",
      children: s ? (
        <div className="space-y-4">
          <Row gutter={[12, 12]}>
            <Col xs={12} md={8}><Stat label="Lượt xem" value={s.views} color="#4f46e5" /></Col>
            <Col xs={12} md={8}><Stat label="Lời chúc" value={s.wishes} color="#db2777" /></Col>
            <Col xs={12} md={8}><Stat label="Khách mời đã mở thiệp" value={`${s.guestsViewed}/${s.guests}`} color="#0891b2" /></Col>
            <Col xs={12} md={8}><Stat label="Xác nhận tham dự" value={s.rsvpAttending} hint={`+ ${s.rsvpCompanions} người đi cùng`} color="#16a34a" /></Col>
            <Col xs={12} md={8}><Stat label="Dự kiến có mặt" value={s.expectedPeople} hint="người (gồm cả người đi cùng)" color="#16a34a" /></Col>
            <Col xs={12} md={8}><Stat label="Từ chối" value={s.rsvpNotAttending} color="#dc2626" /></Col>
            <Col xs={12} md={8}><Stat label="Quà tặng bằng tim" value={s.gifts} hint={`${s.giftHearts} tim`} color="#e11d48" /></Col>
            <Col xs={12} md={8}><Stat label="Giá trị quy đổi" value={vnd(s.giftValueVnd)} hint="khi bạn đổi tim ra tiền" color="#d97706" /></Col>
            <Col xs={12} md={8}><Stat label="Chuyển khoản đã ghi nhận" value={s.bankTransfers} hint={s.bankTransfers ? vnd(s.bankTransferVnd) : undefined} color="#475569" /></Col>
          </Row>
          <Alert type="info" showIcon message="Chuyển khoản trực tiếp vào tài khoản ngân hàng của bạn không tự hiện ở đây — bạn xem trong ứng dụng ngân hàng." />
        </div>
      ) : null,
    },
    {
      key: "gifts",
      label: `Quà tặng (${data?.gifts.length ?? 0})`,
      children: (
        <Table
          size="small"
          rowKey="id"
          dataSource={data?.gifts ?? []}
          locale={{ emptyText: <Empty description="Chưa có ai tặng quà" /> }}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          scroll={{ x: 560 }}
          columns={[
            { title: "Người tặng", dataIndex: "senderName", render: (v: string) => <b>{v}</b> },
            { title: "Quà", render: (_: unknown, r: Activity["gifts"][number]) => <span><span className="mr-1 text-lg">{r.emoji}</span>{r.giftName}</span> },
            { title: "Tim", dataIndex: "hearts", align: "right" as const, render: (v: number) => (v ? <span className="inline-flex items-center gap-1">{v} <Heart size={12} className="fill-rose-500 text-rose-500" /></span> : "—") },
            { title: "Quy đổi", dataIndex: "amount", align: "right" as const, render: (v: number) => vnd(v) },
            { title: "Lời nhắn", dataIndex: "message", render: (v?: string | null) => v || "—" },
            { title: "Thời gian", dataIndex: "createdAt", render: dateTime },
          ]}
        />
      ),
    },
    {
      key: "rsvp",
      label: `Tham dự (${data?.rsvps.length ?? 0})`,
      children: (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button
              disabled={!data?.rsvps.length}
              onClick={() =>
                data &&
                downloadCsv("danh-sach-tham-du.csv", [
                  ["Tên", "Trạng thái", "Số người đi cùng", "Ghi chú", "Thời gian"],
                  ...data.rsvps.map((r) => [[r.honorific, r.name].filter(Boolean).join(" "), RSVP_LABEL[r.status]?.text ?? r.status, String(r.companions), r.note ?? "", dateTime(r.respondedAt)]),
                ])
              }
            >
              Tải danh sách (CSV)
            </Button>
          </div>
          <Table
            size="small"
            rowKey="id"
            dataSource={data?.rsvps ?? []}
            locale={{ emptyText: <Empty description="Chưa có ai xác nhận" /> }}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: 560 }}
            columns={[
              { title: "Khách", render: (_: unknown, r: Activity["rsvps"][number]) => <b>{[r.honorific, r.name].filter(Boolean).join(" ")}</b> },
              { title: "Trạng thái", dataIndex: "status", render: (v: string) => <Tag color={RSVP_LABEL[v]?.color}>{RSVP_LABEL[v]?.text ?? v}</Tag> },
              { title: "Đi cùng", dataIndex: "companions", align: "right" as const },
              { title: "Ghi chú", dataIndex: "note", render: (v?: string | null) => v || "—" },
              { title: "Thời gian", dataIndex: "respondedAt", render: dateTime },
            ]}
          />
        </div>
      ),
    },
    {
      key: "wishes",
      label: `Lời chúc (${data?.wishes.length ?? 0})`,
      children: data?.wishes.length ? (
        <div className="space-y-3">
          {data.wishes.map((wish) => (
            <Card key={wish.id} size="small" className={wish.isHidden ? "opacity-60" : ""}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">
                    {wish.gift ? <span className="mr-1">{wish.gift.emoji}</span> : null}
                    {wish.guestName}
                    {wish.gift ? <span className="ml-2 text-xs font-normal text-pink-500">tặng {wish.gift.name}</span> : null}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">{wish.message}</div>
                  <div className="mt-1 text-xs text-slate-400">{dateTime(wish.createdAt)}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-slate-500">
                  <Switch size="small" checked={!wish.isHidden} onChange={(show) => toggleWish(wish.id, !show)} />
                  {wish.isHidden ? "Đang ẩn" : "Đang hiện"}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="Chưa có lời chúc nào" />
      ),
    },
    {
      key: "guests",
      label: `Khách mời (${data?.guests.length ?? 0})`,
      children: (
        <div className="space-y-3">
          <div className="flex justify-end">
            {data ? (
              <Link href={`/dashboard/invitations/${data.invitation.id}/guests`}>
                <Button>Quản lý & tạo link mời</Button>
              </Link>
            ) : null}
          </div>
          <Table
            size="small"
            rowKey="id"
            dataSource={data?.guests ?? []}
            locale={{ emptyText: <Empty description="Chưa có khách mời nào" /> }}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: 560 }}
            columns={[
              { title: "Khách", render: (_: unknown, r: Activity["guests"][number]) => <b>{[r.honorific, r.name].filter(Boolean).join(" ")}</b> },
              { title: "Nhóm", dataIndex: "group", render: (v: string) => GROUP_LABEL[v] ?? v },
              { title: "Đã gửi", dataIndex: "sentAt", render: dateTime },
              { title: "Đã mở thiệp", dataIndex: "viewedAt", render: dateTime },
              { title: "Phản hồi", dataIndex: "rsvpStatus", render: (v: string) => <Tag color={RSVP_LABEL[v]?.color}>{RSVP_LABEL[v]?.text ?? v}</Tag> },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <Drawer
      open={Boolean(invitationId)}
      onClose={onClose}
      width={Math.min(760, typeof window !== "undefined" ? window.innerWidth : 760)}
      title={<div><Typography.Text type="secondary" className="block text-xs">Hoạt động của thiệp</Typography.Text>{data?.invitation.title ?? title ?? ""}</div>}
      extra={<Button onClick={() => invitationId && load(invitationId)} loading={loading}>Làm mới</Button>}
      destroyOnHidden
    >
      {error ? <Alert type="error" showIcon message={error} /> : null}
      {loading && !data ? <Skeleton active paragraph={{ rows: 8 }} /> : null}
      {data ? <Tabs items={tabs} /> : null}
    </Drawer>
  );
};
