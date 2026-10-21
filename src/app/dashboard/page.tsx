"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Badge, Button, Card, Col, DatePicker, Form, Input, Modal, Progress, Row, Space, Statistic, Table, Tag, Typography } from "antd";
import {
  ArrowRightOutlined,
  CopyOutlined,
  GiftOutlined,
  HeartOutlined,
  LinkOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { userAuth } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

type InvitationRow = {
  id: string;
  title: string;
  status: string;
  viewCount?: number;
  eventDate?: string;
  _count?: { guests?: number; wishes?: number };
};

const shortcuts = [
  { label: "Tạo thiệp mới", href: "/editor", icon: <HeartOutlined />, type: "primary" },
  { label: "Thiệp của tôi", href: "/dashboard/invitations", icon: <LinkOutlined />, type: "default" },
  { label: "Quà & lời chúc", href: "/dashboard/gifts", icon: <GiftOutlined />, type: "default" },
  { label: "Ví & rút tiền", href: "/dashboard/wallet", icon: <WalletOutlined />, type: "default" },
  { label: "Hồ sơ cá nhân", href: "/dashboard/profile", icon: <TeamOutlined />, type: "default" },
];

const statusMap: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Nháp", color: "default" },
  PUBLISHED: { label: "Đang mở", color: "pink" },
  ARCHIVED: { label: "Lưu trữ", color: "gold" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "Người dùng", email: "" });
  const [balance, setBalance] = useState(0);
  const [recentInvitations, setRecentInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creatingInvitation, setCreatingInvitation] = useState(false);
  const [form] = Form.useForm<{ title: string; eventDate?: string }>();

  useEffect(() => {
    const token = userAuth.getAccess();
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }),
      fetch(`${API_BASE_URL}/wallet/me`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }),
      fetch(`${API_BASE_URL}/invitations/mine`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }),
    ])
      .then(async ([userRes, walletRes, invitationsRes]) => {
        const userData = await userRes.json().catch(() => ({}));
        const walletData = await walletRes.json().catch(() => ({}));
        const invitationData = await invitationsRes.json().catch(() => []);

        if (userRes.ok && userData?.name) {
          setProfile({ name: userData.name, email: userData.email || "" });
        }
        if (walletRes.ok && typeof walletData?.balance === "number") {
          setBalance(walletData.balance);
        }

        const items = Array.isArray(invitationData) ? invitationData : invitationData.items ?? [];
        setRecentInvitations(items.slice(0, 5).map((item: any) => ({
          id: item.id,
          title: item.title,
          status: item.status,
          viewCount: item.viewCount ?? 0,
          eventDate: item.eventDate,
          _count: item._count ?? { guests: 0, wishes: 0 },
        })));
      })
      .catch(() => {
        setProfile({ name: "Người dùng", email: "" });
        setBalance(0);
        setRecentInvitations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const inviteCount = recentInvitations.filter((item) => item.status === "PUBLISHED").length;
    const guestCount = recentInvitations.reduce((sum, item) => sum + Number(item._count?.guests ?? 0), 0);
    const wishCount = recentInvitations.reduce((sum, item) => sum + Number(item._count?.wishes ?? 0), 0);
    return [
      { title: "Thiệp đang hoạt động", value: inviteCount },
      { title: "Khách mời đã RSVP", value: guestCount },
      { title: "Lời chúc mới", value: wishCount },
      { title: "Tổng quà mừng", value: `${new Intl.NumberFormat("vi-VN").format(balance)}đ` },
    ];
  }, [balance, recentInvitations]);

  const columns = [
    { title: "Thiệp", dataIndex: "title", key: "title" },
    { title: "Trạng thái", key: "status", render: (_: unknown, item: InvitationRow) => <Tag color={statusMap[item.status]?.color ?? "default"}>{statusMap[item.status]?.label ?? item.status}</Tag> },
    { title: "Lượt xem", dataIndex: "viewCount", key: "viewCount" },
    { title: "RSVP", dataIndex: "_count", key: "rsvp", render: (_: unknown, item: InvitationRow) => item._count?.guests ?? 0 },
    { title: "Ngày sự kiện", key: "eventDate", render: (_: unknown, item: InvitationRow) => item.eventDate ? new Date(item.eventDate).toLocaleDateString("vi-VN") : "Chưa lên lịch" },
    { title: "Hành động", key: "action", render: () => <Button type="link" icon={<ArrowRightOutlined />}>Chi tiết</Button> },
  ];

  const handleCreateInvitation = async (values?: { title?: string; eventDate?: string | { toISOString: () => string } }) => {
    const token = userAuth.getAccess();
    if (!token) {
      router.push("/login");
      return;
    }

    setCreatingInvitation(true);

    try {
      const title = (values?.title || "Thiệp cưới của tôi").trim() || "Thiệp cưới của tôi";
      const eventDateValue = values?.eventDate
        ? (typeof values.eventDate === "string" ? values.eventDate : values.eventDate.toISOString())
        : new Date().toISOString();

      const payload = {
        title,
        contentJson: { canvasSettings: { width: 600, height: 3200, backgroundColor: "#ffffff", backgroundImage: null, backgroundSize: "cover", backgroundMusic: null, isMusicPlaying: false }, elements: [] },
        location: "Chưa cập nhật",
        eventDate: eventDateValue,
        profileJson: {
          templateName: "Moonlit Romance",
          story: "Tình yêu là hành trình bắt đầu từ những điều nhỏ bé và dần lớn lên cùng nhau. Chúng tôi xin kính mời mọi người cùng chia sẻ niềm vui hạnh phúc trong ngày cưới của chúng tôi.",
          gallery: [
            "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
          ],
          timeline: [
            { time: "09:00", title: "Tiếp đón khách", note: "Đón khách và chào hỏi tại sảnh chính" },
            { time: "11:00", title: "Lễ cưới", note: "Lễ thành hôn theo nghi thức gia đình" },
            { time: "13:30", title: "Tiệc cưới", note: "Ăn uống, chúc mừng và chụp ảnh" },
          ],
        },
      };

      const response = await fetch(`${API_BASE_URL}/invitations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Không thể tạo thiệp");
      setCreateModalOpen(false);
      form.resetFields();
      router.push(`/editor?id=${encodeURIComponent(data.id)}&title=${encodeURIComponent(data.title || payload.title)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo thiệp";
      if (message.includes("hết hạn") || message.includes("đăng nhập") || message.includes("401")) {
        router.push("/login");
        return;
      }
      window.alert(message);
    } finally {
      setCreatingInvitation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-pink-100 bg-white/80 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <Typography.Title level={3} className="!mb-1">Chào mừng, {profile.name}</Typography.Title>
            <Typography.Text type="secondary">Theo dõi thiệp, khách mời, quà mừng và doanh thu.</Typography.Text>
          </div>
          <Space>
            <Button type="primary" size="large" onClick={() => setCreateModalOpen(true)} loading={loading}>Tạo thiệp mới</Button>
            <Button icon={<CopyOutlined />} size="large">Sao chép link</Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          {stats.map((item) => (
            <Col xs={24} sm={12} lg={6} key={item.title}>
              <Card bordered={false} className="shadow-sm">
                <Statistic title={item.title} value={item.value} />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24} lg={16}>
            <Card title="Thiệp gần đây" className="shadow-sm">
              <Table
                columns={columns}
                dataSource={recentInvitations}
                loading={loading}
                pagination={false}
                rowKey="id"
                locale={{ emptyText: "Bạn chưa có thiệp nào. Hãy tạo thiệp đầu tiên." }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Thao tác nhanh" className="shadow-sm">
              <Space direction="vertical" className="w-full">
                {shortcuts.map((item) => (
                  <Button key={item.label} type={item.type === "primary" ? "primary" : "default"} icon={item.icon} href={item.href} block size="large" className="justify-center">
                    {item.label}
                  </Button>
                ))}
              </Space>
            </Card>

            <Card title="Tình trạng hệ thống" className="mt-4 shadow-sm">
              <Space direction="vertical" className="w-full">
                <div>
                  <div className="mb-1 flex justify-between text-sm"><span>Độ hoàn thiện thiệp</span><b>78%</b></div>
                  <Progress percent={78} strokeColor="#f25f7c" status="active" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm"><span>Khách mời đăng ký</span><b>64%</b></div>
                  <Progress percent={64} strokeColor="#5b7cfa" status="active" />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Đã nhận quà mừng</span>
                  <Tag color="green">24 giao dịch</Tag>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24} md={12}>
            <Card title="Khách mời mới" className="shadow-sm">
              <Space direction="vertical" className="w-full">
                <div className="flex items-center justify-between rounded-xl bg-pink-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-white text-pink-500"><TeamOutlined /></div>
                    <div>
                      <div className="font-semibold">Nguyễn Thị Hà</div>
                      <div className="text-sm text-gray-500">Đã xác nhận tham dự</div>
                    </div>
                  </div>
                  <Badge status="success" text="RSVP" />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-sky-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-white text-sky-500"><TeamOutlined /></div>
                    <div>
                      <div className="font-semibold">Trần Văn Nam</div>
                      <div className="text-sm text-gray-500">Đã gửi lời chúc</div>
                    </div>
                  </div>
                  <Badge status="processing" text="Mới" />
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Ví của bạn" className="shadow-sm">
              <Space direction="vertical" size={18} className="w-full">
                <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 p-5 text-white">
                  <div className="text-sm opacity-80">Số dư hiện tại</div>
                  <div className="mt-2 text-3xl font-bold">{new Intl.NumberFormat("vi-VN").format(balance)}đ</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Đã rút</span>
                  <b>4.600.000đ</b>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Chờ duyệt</span>
                  <b>1.200.000đ</b>
                </div>
                <Button type="primary" block href="/dashboard/wallet">Yêu cầu rút tiền</Button>
              </Space>
            </Card>
          </Col>
        </Row>

        <Modal
          title="Tạo thiệp mới"
          open={createModalOpen}
          onCancel={() => setCreateModalOpen(false)}
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
              <Button onClick={() => setCreateModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={creatingInvitation}>Tạo thiệp</Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
