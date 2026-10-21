"use client";

import { Suspense, useMemo, useState } from "react";
import { Alert, Button, Card, Form, Input, Result, Space, Typography } from "antd";
import { CheckCircleOutlined, KeyOutlined } from "@ant-design/icons";
import { useSearchParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

type FieldType = {
  newPassword: string;
  confirmPassword: string;
};

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("Vui lòng nhập mật khẩu mới.");

  const onFinish = async (values: FieldType) => {
    if (!token) {
      setSuccess(false);
      setMessage("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      setSuccess(false);
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: values.newPassword }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Đặt lại mật khẩu thất bại");
      }

      setSuccess(true);
      setMessage(data.message || "Đặt lại mật khẩu thành công.");
    } catch (error) {
      setSuccess(false);
      setMessage(error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4">
        <Card className="w-full max-w-xl">
          <Result
            icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            status="success"
            title="Đặt lại mật khẩu thành công"
            subTitle={message}
            extra={
              <Button type="primary" href="/" size="large">
                Về trang chủ
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4">
      <Card className="w-full max-w-lg shadow-sm">
        <Space direction="vertical" size="large" className="w-full">
          <div className="text-center">
            <KeyOutlined className="text-4xl text-pink-500" />
            <Typography.Title level={3} className="!mb-1 mt-3">Đặt lại mật khẩu</Typography.Title>
            <Typography.Text type="secondary">Nhập mật khẩu mới cho tài khoản của bạn.</Typography.Text>
          </div>

          {!token && (
            <Alert type="error" showIcon message="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." />
          )}

          {message && !success && (
            <Alert type={token ? "info" : "error"} showIcon message={message} />
          )}

          <Form layout="vertical" onFinish={onFinish} autoComplete="off">
            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }, { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu mới" size="large" />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={loading} disabled={!token}>
              Đặt lại mật khẩu
            </Button>
          </Form>
        </Space>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Typography.Text>Đang tải form...</Typography.Text></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
