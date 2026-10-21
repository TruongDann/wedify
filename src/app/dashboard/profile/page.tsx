"use client";

import { Avatar, Button, Card, Col, Form, Input, Row, Space, Statistic, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { userAuth } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface ProfileData {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role?: string;
  avatarUrl?: string | null;
}

export default function DashboardProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>({
    id: "demo-user",
    email: "nguyenanh@example.com",
    name: "Nguyễn Anh",
    phone: "0901 234 567",
    role: "USER",
    avatarUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    const token = userAuth.getAccess();

    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unauthorized");
        const data = await response.json();
        setProfile({
          id: data.id || "demo-user",
          email: data.email || "nguyenanh@example.com",
          name: data.name || "Nguyễn Anh",
          phone: data.phone || "0901 234 567",
          role: data.role || "USER",
          avatarUrl: data.avatarUrl || "",
        });
      })
      .catch(() => {
        setProfile({
          id: "demo-user",
          email: "nguyenanh@example.com",
          name: "Nguyễn Anh",
          phone: "0901 234 567",
          role: "USER",
          avatarUrl: "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
      });
    }
  }, [profile, form]);

  const onFinish = (values: { name: string; email: string; phone: string }) => {
    setProfile((current) => current ? { ...current, ...values } : current);
  };

  const handleLogout = async () => {
    await userAuth.logout();
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Typography.Title level={3} className="!mb-1">Hồ sơ cá nhân</Typography.Title>
        <Typography.Text type="secondary">Quản lý thông tin cá nhân, liên hệ và cài đặt tài khoản của bạn.</Typography.Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="shadow-sm">
            <Space direction="vertical" align="center" className="w-full">
              <Avatar size={96} src={profile?.avatarUrl || undefined} style={{ backgroundColor: "#f472b6" }}>
                {profile?.name?.slice(0, 1)?.toUpperCase() || "N"}
              </Avatar>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-800">{profile?.name || "Người dùng"}</div>
                <div className="text-sm text-slate-500">{profile?.email || "Chưa có email"}</div>
              </div>
              <Button type="primary" block>Đổi ảnh đại diện</Button>
              <Button danger block onClick={handleLogout}>Đăng xuất</Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Thông tin tài khoản" className="shadow-sm">
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ name: profile?.name, email: profile?.email, phone: profile?.phone || "" }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Họ và tên" name="name">
                    <Input placeholder="Nhập họ và tên" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Email" name="email">
                    <Input placeholder="Nhập email" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Số điện thoại" name="phone">
                    <Input placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Vai trò">
                    <Input value={profile?.role || "USER"} readOnly />
                  </Form.Item>
                </Col>
              </Row>

              <div className="mt-2 flex justify-end">
                <Button type="primary" htmlType="submit" loading={loading}>Lưu thay đổi</Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="shadow-sm">
            <Statistic title="Thiệp đã tạo" value={8} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="shadow-sm">
            <Statistic title="Khách mời" value={346} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="shadow-sm">
            <Statistic title="Tổng quà" value="32.5M" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
