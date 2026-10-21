"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useState } from "react";
import { userAuth } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      userAuth.setTokens(data.accessToken, data.refreshToken);
      userAuth.setProfile(data.user || null);
      // Quay lại trang đang xem (vd. thiệp để tặng quà) nếu có ?next=, chỉ chấp nhận đường dẫn nội bộ.
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 via-white to-white px-4 py-8">
      <Card className="w-full max-w-md shadow-lg" bordered={false}>
        <Typography.Title level={2} className="!mb-2 text-center">Đăng nhập</Typography.Title>
        <Typography.Text type="secondary" className="block text-center">Chào mừng bạn quay lại Wedify</Typography.Text>

        {error ? (
          <Alert className="mt-4" type="error" showIcon message={error} />
        ) : null}

        <Form layout="vertical" className="mt-5" onFinish={onSubmit}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}> 
            <Input size="large" placeholder="example@email.com" />
          </Form.Item>

          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}> 
            <Input.Password size="large" placeholder="••••••••" />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} className="mt-2">
            Đăng nhập
          </Button>
        </Form>

        <div className="mt-5 text-center text-sm text-slate-500">
          Chưa có tài khoản? <Link href="/register" className="font-semibold text-pink-500">Đăng ký ngay</Link>
        </div>
        <div className="mt-3 text-center text-sm">
          <Link href="/" className="text-slate-600 hover:text-pink-500">Quay về trang chủ</Link>
        </div>
      </Card>
    </div>
  );
}
