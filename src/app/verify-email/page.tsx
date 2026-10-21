"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Button, Card, Result, Space, Spin, Typography } from "antd";
import { CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useSearchParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [loading, setLoading] = useState(Boolean(token));
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("Đang xác minh email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Liên kết xác minh không hợp lệ. Vui lòng kiểm tra lại đường dẫn.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/email/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Xác minh email thất bại");
        }

        setStatus("success");
        setMessage(data.message || "Xác minh email thành công.");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Xác minh email thất bại.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4">
        <Card className="w-full max-w-lg text-center">
          <Space direction="vertical" size="large" className="w-full items-center">
            <Spin size="large" />
            <Typography.Text>Đang xác minh email của bạn...</Typography.Text>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4">
      <Card className="w-full max-w-xl">
        {status === "success" ? (
          <Result
            icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            status="success"
            title="Xác minh email thành công"
            subTitle={message}
            extra={
              <Button type="primary" href="/" size="large">
                Về trang chủ
              </Button>
            }
          />
        ) : (
          <Result
            icon={<ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />}
            status="error"
            title="Xác minh email không thành công"
            subTitle={message}
            extra={
              <Button href="/" size="large">
                Quay lại trang chủ
              </Button>
            }
          />
        )}
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spin size="large" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
