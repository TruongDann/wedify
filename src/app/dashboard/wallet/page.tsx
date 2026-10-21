"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Row, Space, Table, Tag, Typography } from "antd";
import { userAuth } from "@/lib/auth";

type WithdrawalRow = {
  id: string;
  amount: number;
  status: string;
  requestedAt?: string;
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  };
};

const statusColor: Record<string, string> = {
  PENDING: "gold",
  APPROVED: "blue",
  PAID: "green",
  REJECTED: "red",
};

const statusLabel: Record<string, string> = {
  PENDING: "Đang xử lý",
  APPROVED: "Đã duyệt",
  PAID: "Đã thanh toán",
  REJECTED: "Từ chối",
};

export default function WalletPage() {
  const [wallet, setWallet] = useState({ balance: 0, withdrawals: [] as WithdrawalRow[] });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [hearts, setHearts] = useState({ receivedHearts: 0, heartBalance: 0, cashoutRateVnd: 700 });
  const [exchangeAmount, setExchangeAmount] = useState<number | null>(null);
  const [exchanging, setExchanging] = useState(false);

  const loadWallet = async () => {
    try {
      const data = await userAuth.apiFetch<{ balance: number; withdrawals?: WithdrawalRow[] }>("/wallet/me");
      const withdrawals = (data.withdrawals ?? []).map((item) => ({
        ...item,
        id: String(item.id),
        amount: Number(item.amount ?? 0),
        status: item.status ?? "PENDING",
      }));
      setWallet({ balance: Number(data.balance ?? 0), withdrawals });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Không thể tải thông tin ví";
      setMessage(messageText);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadHearts = async () => {
    try {
      const data = await userAuth.apiFetch<{ receivedHearts: number; heartBalance: number; cashoutRateVnd: number }>("/hearts/me");
      setHearts(data);
    } catch {
      /* hiển thị 0 nếu chưa tải được */
    }
  };

  useEffect(() => {
    loadWallet();
    loadHearts();
  }, []);

  const exchangeHearts = async () => {
    if (!exchangeAmount || exchangeAmount < 1) return;
    setExchanging(true);
    setMessage(null);
    try {
      const result = await userAuth.apiFetch<{ vnd: number }>("/hearts/exchange", {
        method: "POST",
        body: JSON.stringify({ hearts: exchangeAmount }),
      });
      setMessage(`Đã đổi ${new Intl.NumberFormat("vi-VN").format(exchangeAmount)} tim thành ${new Intl.NumberFormat("vi-VN").format(result.vnd)}đ vào số dư.`);
      setExchangeAmount(null);
      await Promise.all([loadWallet(), loadHearts()]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Đổi tim thất bại");
    } finally {
      setExchanging(false);
    }
  };

  const totalWithdrawn = useMemo(
    () => wallet.withdrawals.reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
    [wallet.withdrawals],
  );

  const pendingAmount = useMemo(
    () => wallet.withdrawals.filter((item) => item.status === "PENDING" || item.status === "APPROVED").reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
    [wallet.withdrawals],
  );

  const requestWithdrawal = async (values: { amount: number; bankName: string; accountNumber: string; accountHolder: string }) => {
    setLoading(true);
    setMessage(null);

    try {
      await userAuth.apiFetch<{ id: string }>("/wallet/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(values.amount),
          bankInfo: {
            bankName: values.bankName,
            accountNumber: values.accountNumber,
            accountHolder: values.accountHolder,
          },
        }),
      });

      setMessage("Yêu cầu rút tiền đã được gửi thành công. Admin sẽ xét duyệt trong thời gian sớm nhất.");
      form.resetFields();
      await loadWallet();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Yêu cầu rút tiền thất bại");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Mã giao dịch", dataIndex: "id", key: "id" },
    { title: "Ngày", dataIndex: "requestedAt", key: "requestedAt", render: (value?: string) => value ? new Date(value).toLocaleDateString("vi-VN") : "--" },
    { title: "Số tiền", dataIndex: "amount", key: "amount", render: (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ` },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={statusColor[status] ?? "default"}>{statusLabel[status] ?? status}</Tag>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Typography.Title level={3} className="!mb-1">Ví & rút tiền</Typography.Title>
        <Typography.Text type="secondary">Theo dõi số dư, giao dịch và yêu cầu thanh toán của bạn.</Typography.Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="shadow-sm" loading={initialLoading}>
            <div className="text-sm text-slate-500">Số dư hiện tại</div>
            <div className="mt-3 text-3xl font-bold text-pink-600">{new Intl.NumberFormat("vi-VN").format(wallet.balance)}đ</div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="shadow-sm" loading={initialLoading}>
            <div className="text-sm text-slate-500">Đã rút</div>
            <div className="mt-3 text-3xl font-bold text-slate-800">{new Intl.NumberFormat("vi-VN").format(totalWithdrawn)}đ</div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="shadow-sm" loading={initialLoading}>
            <div className="text-sm text-slate-500">Chờ duyệt</div>
            <div className="mt-3 text-3xl font-bold text-slate-800">{new Intl.NumberFormat("vi-VN").format(pendingAmount)}đ</div>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm" title="Tim nhận được từ quà tặng">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <div className="text-sm text-slate-500">Tim có thể đổi</div>
            <div className="mt-2 text-3xl font-bold text-rose-500">{new Intl.NumberFormat("vi-VN").format(hearts.receivedHearts)} ♥</div>
            <div className="mt-1 text-xs text-slate-400">1 tim = {new Intl.NumberFormat("vi-VN").format(hearts.cashoutRateVnd)}đ</div>
          </Col>
          <Col xs={24} md={16}>
            <Space.Compact style={{ width: "100%" }}>
              <InputNumber
                min={1}
                max={hearts.receivedHearts || undefined}
                value={exchangeAmount}
                onChange={(value) => setExchangeAmount(value ? Math.floor(Number(value)) : null)}
                placeholder="Số tim muốn đổi"
                style={{ width: "100%" }}
                addonAfter={exchangeAmount ? `= ${new Intl.NumberFormat("vi-VN").format(exchangeAmount * hearts.cashoutRateVnd)}đ` : "♥"}
              />
              <Button type="primary" loading={exchanging} disabled={!exchangeAmount || exchangeAmount > hearts.receivedHearts} onClick={exchangeHearts}>
                Đổi sang tiền
              </Button>
            </Space.Compact>
            <div className="mt-2 text-xs text-slate-400">Tiền sau khi đổi vào "Số dư hiện tại" và có thể gửi yêu cầu rút ở bên dưới.</div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="shadow-sm" title="Yêu cầu rút tiền">
            <Form form={form} layout="vertical" onFinish={requestWithdrawal} initialValues={{ amount: 500000, bankName: "Vietcombank", accountNumber: "1020 0203 8844", accountHolder: "Nguyễn Anh" }}>
              <Form.Item label="Số tiền muốn rút" name="amount" rules={[{ required: true, message: "Nhập số tiền" }, { type: "number", min: 50000, message: "Tối thiểu 50.000đ" }]}> 
                <InputNumber min={50000} max={wallet.balance || 5000000} style={{ width: "100%" }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => Number(value?.replace(/,/g, "")) || 0} addonAfter="đ" />
              </Form.Item>

              <Form.Item label="Tên ngân hàng" name="bankName" rules={[{ required: true, message: "Nhập tên ngân hàng" }]}> 
                <Input />
              </Form.Item>

              <Form.Item label="Số tài khoản" name="accountNumber" rules={[{ required: true, message: "Nhập số tài khoản" }]}> 
                <Input />
              </Form.Item>

              <Form.Item label="Tên chủ tài khoản" name="accountHolder" rules={[{ required: true, message: "Nhập tên chủ tài khoản" }]}> 
                <Input />
              </Form.Item>

              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Yêu cầu rút tiền
              </Button>
              {message ? <div className="mt-3 text-sm text-slate-600">{message}</div> : null}
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="shadow-sm" title="Lịch sử giao dịch">
            <Table dataSource={wallet.withdrawals} columns={columns} pagination={false} rowKey="id" locale={{ emptyText: "Chưa có giao dịch nào." }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
