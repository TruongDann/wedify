"use client";

import { Alert, Button, Card, Col, Progress, Row, Space, Tag, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { userAuth } from "@/lib/auth";

type InvitationSummary = {
  id: string;
  title: string;
  giftTotal: number;
  wishCount: number;
  guestCount: number;
};

type WishEntry = {
  id: string;
  invitationId: string;
  invitationTitle?: string;
  guestName: string;
  message: string;
  isHidden: boolean;
  createdAt: string;
};

export default function DashboardGiftsPage() {
  const router = useRouter();
  const [items, setItems] = useState<InvitationSummary[]>([]);
  const [wishes, setWishes] = useState<WishEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const invitations = await userAuth.apiFetch<Array<{ id: string; title: string; _count?: { guests?: number } }>>("/invitations/mine");

        const results = await Promise.all(
          invitations.map(async (invitation) => {
            const [giftData, wishData] = await Promise.all([
              userAuth.apiFetch<{ total?: number; gifts?: Array<{ amount?: number }> }>(`/invitations/${invitation.id}/gifts`),
              userAuth.apiFetch<Array<{ id: string; guestName?: string; message?: string; invitationId?: string; isHidden?: boolean; createdAt?: string; invitation?: { title?: string } }>>(`/invitations/${invitation.id}/wishes`),
            ]);

            const giftTotal = Number(giftData.total ?? (giftData.gifts ?? []).reduce((sum, item) => sum + Number(item.amount ?? 0), 0));
            return {
              id: invitation.id,
              title: invitation.title,
              giftTotal,
              wishCount: wishData.length,
              guestCount: invitation._count?.guests ?? 0,
            };
          }),
        );

        const allWishes = (await Promise.all(
          invitations.map(async (invitation) => {
            const data = await userAuth.apiFetch<Array<{ id: string; guestName?: string; message?: string; isHidden?: boolean; createdAt?: string; invitationId?: string }>>(`/invitations/${invitation.id}/wishes`);
            return data.map((wish) => ({
              id: wish.id,
              invitationId: wish.invitationId ?? invitation.id,
              invitationTitle: invitation.title,
              guestName: wish.guestName ?? "Khách mời",
              message: wish.message ?? "",
              isHidden: Boolean(wish.isHidden),
              createdAt: wish.createdAt ?? new Date().toISOString(),
            }));
          }),
        )).flat();

        setItems(results);
        setWishes(allWishes);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Không thể tải dữ liệu quà & lời chúc";
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

  const summary = useMemo(() => {
    const totalGiftAmount = items.reduce((sum, item) => sum + item.giftTotal, 0);
    const totalWishes = items.reduce((sum, item) => sum + item.wishCount, 0);
    const totalGuests = items.reduce((sum, item) => sum + item.guestCount, 0);
    return [
      { label: "Tổng quà mừng", value: `${new Intl.NumberFormat("vi-VN").format(totalGiftAmount)}đ`, tone: "pink" },
      { label: "Lời chúc mới", value: String(totalWishes), tone: "blue" },
      { label: "Đã xác nhận", value: String(totalGuests), tone: "green" },
      { label: "Thiệp đang theo dõi", value: String(items.length), tone: "gold" },
    ];
  }, [items]);

  const toggleWishVisibility = async (wishId: string, nextHidden: boolean) => {
    await userAuth.apiFetch(`/wishes/${wishId}/hidden`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHidden: nextHidden }),
    });

    setWishes((current) =>
      current.map((wish) =>
        wish.id === wishId ? { ...wish, isHidden: nextHidden } : wish,
      ),
    );
  };

  if (loading) {
    return <Card loading title="Đang tải dữ liệu quà & lời chúc" />;
  }

  if (error) {
    return <Alert type="error" message={error} showIcon />;
  }

  const visibleProgress = items.length ? Math.min(100, Math.round((items.filter((item) => item.wishCount > 0).length / items.length) * 100)) : 0;
  const giftProgress = items.length ? Math.min(100, Math.round((items.reduce((sum, item) => sum + item.giftTotal, 0) / Math.max(1, items.length * 5000000)) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Typography.Title level={3} className="!mb-1">Quà & lời chúc</Typography.Title>
        <Typography.Text type="secondary">Theo dõi tổng quà mừng, lời chúc và trạng thái hiển thị trên thiệp của bạn.</Typography.Text>
      </div>

      <Row gutter={[16, 16]}>
        {summary.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.label}>
            <Card className="shadow-sm">
              <div className="text-sm text-slate-500">{item.label}</div>
              <div className={`mt-3 text-2xl font-bold ${
                item.tone === "pink" ? "text-pink-600" : item.tone === "blue" ? "text-blue-600" : item.tone === "green" ? "text-emerald-600" : "text-amber-600"
              }`}>{item.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Quà mừng theo thiệp" className="shadow-sm">
            <Space direction="vertical" className="w-full">
              {items.length === 0 ? (
                <div className="text-slate-500">Chưa có thiệp nào để hiển thị quà mừng.</div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">{item.title}</div>
                        <div className="text-sm text-slate-500">{item.guestCount} khách mời</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag color="pink">{item.wishCount} lời chúc</Tag>
                        <span className="font-semibold text-slate-800">{new Intl.NumberFormat("vi-VN").format(item.giftTotal)}đ</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Tình trạng hiển thị" className="shadow-sm">
            <Space direction="vertical" className="w-full">
              <div>
                <div className="mb-1 flex justify-between text-sm"><span>Thiệp có lời chúc</span><b>{visibleProgress}%</b></div>
                <Progress percent={visibleProgress} strokeColor="#f25f7c" status="active" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm"><span>Quà mừng đã ghi nhận</span><b>{giftProgress}%</b></div>
                <Progress percent={giftProgress} strokeColor="#5b7cfa" status="active" />
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                {items.length === 0 ? "Chưa có dữ liệu từ khách mời." : "Hệ thống đang ghi nhận dữ liệu quà mừng và lời chúc từ các thiệp của bạn."}
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Duyệt lời chúc công khai" className="shadow-sm">
        <Space direction="vertical" className="w-full">
          {wishes.length === 0 ? (
            <div className="text-slate-500">Chưa có lời chúc nào.</div>
          ) : (
            wishes.map((wish) => (
              <div key={wish.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">{wish.guestName}</div>
                    <div className="text-xs text-slate-500">{wish.invitationTitle ?? "Thiệp của tôi"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag color={wish.isHidden ? "default" : "green"}>{wish.isHidden ? "Đã ẩn" : "Hiển thị"}</Tag>
                    <Button size="small" onClick={() => toggleWishVisibility(wish.id, !wish.isHidden)}>{wish.isHidden ? "Hiện lại" : "Ẩn"}</Button>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{wish.message}</p>
                <div className="mt-2 text-xs text-slate-400">{new Date(wish.createdAt).toLocaleDateString("vi-VN")}</div>
              </div>
            ))
          )}
        </Space>
      </Card>
    </div>
  );
}
