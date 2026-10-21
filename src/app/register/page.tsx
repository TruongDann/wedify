"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useState } from "react";
import { userAuth } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: { name: string; email: string; password: string; phone?: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      userAuth.setTokens(data.accessToken, data.refreshToken);
      userAuth.setProfile(data.user || null);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 via-white to-white px-4 py-8">
      <Card className="w-full max-w-lg shadow-lg" bordered={false}>
        <Typography.Title level={2} className="!mb-2 text-center">Đăng ký</Typography.Title>
        <Typography.Text type="secondary" className="block text-center">Tạo tài khoản mới để làm thiệp cưới của bạn</Typography.Text>

        {error ? (
          <Alert className="mt-4" type="error" showIcon message={error} />
        ) : null}

        <Form layout="vertical" className="mt-5" onFinish={onSubmit}>
          <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}> 
            <Input size="large" placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}> 
            <Input size="large" placeholder="example@email.com" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone"> 
            <Input size="large" placeholder="0901 234 567" />
          </Form.Item>

          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }, { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" }]}> 
            <Input.Password size="large" placeholder="••••••••" />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} className="mt-2">
            Tạo tài khoản
          </Button>
        </Form>

        <div className="mt-5 text-center text-sm text-slate-500">
          Đã có tài khoản? <Link href="/login" className="font-semibold text-pink-500">Đăng nhập</Link>
        </div>
        <div className="mt-3 text-center text-sm">
          <Link href="/" className="text-slate-600 hover:text-pink-500">Quay về trang chủ</Link>
        </div>
      </Card>
    </div>
  );
}
