"use client";

import { Alert, Button, Card, Col, DatePicker, Form, Input, Modal, Row, Space, Tag, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { userAuth } from "@/lib/auth";

type InvitationItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount?: number;
  eventDate?: string;
  profileJson?: Record<string, any>;
  template?: { name?: string };
  _count?: { guests?: number; wishes?: number };
};

const statusColor: Record<string, string> = {
  DRAFT: "default",
  PUBLISHED: "pink",
  ARCHIVED: "gold",
};

const statusLabel: Record<string, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đang mở",
  ARCHIVED: "Lưu trữ",
};

export default function InvitationManagementPage() {
  const router = useRouter();
  const [items, setItems] = useState<InvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<{ title: string; eventDate?: string }>();
  const [profileForm] = Form.useForm<Record<string, string>>();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await userAuth.apiFetch<InvitationItem[] | { items?: InvitationItem[] }>("/invitations/mine");
        const list = Array.isArray(data) ? data : data.items ?? [];
        setItems(list);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Không thể tải danh sách thiệp";
        if (message.includes("hết hạn") || message.includes("đăng nhập")) {
          router.push("/login");
          return;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const handleCreateInvitation = async (values: { title: string; eventDate?: string | { toISOString: () => string } }) => {
    setSubmitting(true);
    try {
      const title = values.title.trim() || "Thiệp cưới của tôi";
      const eventDateValue = values.eventDate
        ? (typeof values.eventDate === "string" ? values.eventDate : values.eventDate.toISOString())
        : new Date().toISOString();

      const created = await userAuth.apiFetch<{ id: string; slug?: string; title?: string }>("/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          eventDate: eventDateValue,
          location: "Chưa cập nhật",          profileJson: {
            groomName: "",
            brideName: "",
            groomPhone: "",
            bridePhone: "",
            weddingDate: eventDateValue,
            weddingTime: "",
            location: "",
            mapUrl: "",
            story: "",
            groomFather: "",
            groomMother: "",
            brideFather: "",
            brideMother: "",
            bankName: "",
            accountNumber: "",
            accountHolder: "",
          },          contentJson: { canvasSettings: { width: 600, height: 3200, backgroundColor: "#ffffff", backgroundImage: null, backgroundSize: "cover", backgroundMusic: null, isMusicPlaying: false }, elements: [] },
        }),
      });

      setShowCreateModal(false);
      form.resetFields();
      router.push(`/editor?id=${encodeURIComponent(created.id)}&title=${encodeURIComponent(created.title || title)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tạo thiệp";
      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const openProfileEditor = (invitationId: string, currentProfile?: Record<string, any>) => {
    setSelectedInvitationId(invitationId);
    setShowProfileModal(true);
    profileForm.setFieldsValue({
      groomName: currentProfile?.groomName ?? "",
      brideName: currentProfile?.brideName ?? "",
      groomPhone: currentProfile?.groomPhone ?? "",
      bridePhone: currentProfile?.bridePhone ?? "",
      weddingDate: currentProfile?.weddingDate ?? "",
      weddingTime: currentProfile?.weddingTime ?? "",
      location: currentProfile?.location ?? "",
      mapUrl: currentProfile?.mapUrl ?? "",
      story: currentProfile?.story ?? "",
      groomFather: currentProfile?.groomFather ?? "",
      groomMother: currentProfile?.groomMother ?? "",
      brideFather: currentProfile?.brideFather ?? "",
      brideMother: currentProfile?.brideMother ?? "",
      bankName: currentProfile?.bankName ?? "",
      accountNumber: currentProfile?.accountNumber ?? "",
      accountHolder: currentProfile?.accountHolder ?? "",
    });
  };

  const saveProfile = async () => {
    if (!selectedInvitationId) return;
    try {
      const values = await profileForm.validateFields();
      await userAuth.apiFetch(`/invitations/${selectedInvitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileJson: values }),
      });
      setShowProfileModal(false);
      setSelectedInvitationId(null);
      profileForm.resetFields();
      const data = await userAuth.apiFetch<InvitationItem[] | { items?: InvitationItem[] }>("/invitations/mine");
      setItems(Array.isArray(data) ? data : data.items ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể lưu hồ sơ cưới";
      window.alert(message);
    }
  };

  if (loading) {
    return <Card loading title="Đang tải thiệp của bạn" />;
  }

  if (error) {
    return <Alert type="error" message={error} showIcon />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="mb-1 text-2xl font-bold text-slate-800">Thiệp của tôi</h3>
          <p className="text-sm text-slate-500">Quản lý lời mời, trạng thái và link chia sẻ cho từng sự kiện.</p>
        </div>
        <Button type="primary" size="large" onClick={() => setShowCreateModal(true)}>Tạo thiệp mới</Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <p className="mb-0 text-slate-500">Bạn chưa có thiệp nào. Hãy tạo thiệp đầu tiên để bắt đầu.</p>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {items.map((item) => (
            <Col xs={24} lg={8} key={item.id}>
              <Card className="h-full shadow-sm" title={item.title}>
                <Space direction="vertical" size={12} className="w-full">
                  <div className="flex items-center justify-between">
                    <Tag color={statusColor[item.status] ?? "default"}>{statusLabel[item.status] ?? item.status}</Tag>
                    <span className="text-xs text-slate-500">
                      {item.eventDate ? new Date(item.eventDate).toLocaleDateString("vi-VN") : "Chưa lên lịch"}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    <div>Link thiệp: /{item.slug}</div>
                    {item.template?.name ? <div className="mt-1">Mẫu: {item.template.name}</div> : null}
                  </div>

                  <Row gutter={12}>
                    <Col span={8}>
                      <div className="rounded-xl bg-pink-50 p-3 text-center">
                        <div className="text-xl font-bold text-pink-600">{item.viewCount ?? 0}</div>
                        <div className="text-xs text-slate-500">Lượt xem</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="rounded-xl bg-sky-50 p-3 text-center">
                        <div className="text-xl font-bold text-sky-600">{item._count?.wishes ?? 0}</div>
                        <div className="text-xs text-slate-500">Lời chúc</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="rounded-xl bg-emerald-50 p-3 text-center">
                        <div className="text-xl font-bold text-emerald-600">{item._count?.guests ?? 0}</div>
                        <div className="text-xs text-slate-500">Khách</div>
                      </div>
                    </Col>
                  </Row>

                  <div className="flex gap-2">
                    <Button type="primary" block onClick={() => window.open(`/invitation/${item.slug}`, "_blank", "noopener,noreferrer")}>Xem công khai</Button>
                    {item.profileJson?.guided && item.profileJson?.templateId ? (
                      <Button block onClick={() => router.push(`/create/${encodeURIComponent(item.profileJson!.templateId)}?id=${encodeURIComponent(item.id)}`)}>Sửa thông tin</Button>
                    ) : (
                      <Button block onClick={() => router.push(`/editor?id=${encodeURIComponent(item.id)}&title=${encodeURIComponent(item.title)}`)}>Chỉnh sửa</Button>
                    )}
                  </div>
                  {item.profileJson?.guided ? null : (
                      <Button type="default" block onClick={() => openProfileEditor(item.id, (item as any).profileJson ?? undefined)}>Hồ sơ cưới</Button>
                    )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Tạo thiệp mới"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateInvitation} initialValues={{ title: "Thiệp cưới của tôi", eventDate: dayjs() }}>
          <Form.Item label="Tên thiệp" name="title" rules={[{ required: true, message: "Vui lòng nhập tên thiệp" }]}> 
            <Input placeholder="Ví dụ: Đám cưới Minh Anh & Hoàng Nam" />
          </Form.Item>
          <Form.Item label="Ngày sự kiện" name="eventDate">
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowCreateModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Tạo thiệp</Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Hồ sơ cưới"
        open={showProfileModal}
        onCancel={() => { setShowProfileModal(false); setSelectedInvitationId(null); profileForm.resetFields(); }}
        onOk={saveProfile}
        width={980}
      >
        <Form form={profileForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Chú rể" name="groomName"><Input placeholder="VD: Nguyễn Văn An" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Cô dâu" name="brideName"><Input placeholder="VD: Trần Thị Bình" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Số điện thoại chú rể" name="groomPhone"><Input placeholder="VD: 0901 234 567" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Số điện thoại cô dâu" name="bridePhone"><Input placeholder="VD: 0901 234 567" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Ngày cưới" name="weddingDate"><Input placeholder="2026-12-18" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Giờ cưới" name="weddingTime"><Input placeholder="18:00" /></Form.Item></Col>
            <Col span={24}><Form.Item label="Địa điểm" name="location"><Input placeholder="VD: Trung tâm tiệc cưới Riverside" /></Form.Item></Col>
            <Col span={24}><Form.Item label="Link Google Map" name="mapUrl"><Input placeholder="https://maps.app.goo.gl/..." /></Form.Item></Col>
            <Col span={24}><Form.Item label="Mô tả" name="story"><Input.TextArea rows={4} placeholder="Với lòng biết ơn..." /></Form.Item></Col>
            <Col span={12}><Form.Item label="Bố chú rể" name="groomFather"><Input placeholder="Họ tên bố" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Mẹ chú rể" name="groomMother"><Input placeholder="Họ tên mẹ" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Bố cô dâu" name="brideFather"><Input placeholder="Họ tên bố" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Mẹ cô dâu" name="brideMother"><Input placeholder="Họ tên mẹ" /></Form.Item></Col>
            <Col span={24}><Typography.Text strong>Thông tin tài khoản mừng cưới</Typography.Text></Col>
            <Col span={12}><Form.Item label="Ngân hàng" name="bankName"><Input placeholder="Chọn ngân hàng" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Tên tài khoản" name="accountHolder"><Input placeholder="NGUYEN VAN AN" /></Form.Item></Col>
            <Col span={24}><Form.Item label="Số tài khoản" name="accountNumber"><Input placeholder="0123456789" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
