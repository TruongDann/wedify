"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { vietQrUrl } from "@/utils/vietqr";
import { Button, Modal, Segmented } from "antd";
import { Copy, Heart } from "lucide-react";
import { userAuth } from "@/lib/auth";

const BRAND = "#ef4565";
const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

export type GiftCatalogItem = { code: string; name: string; emoji: string; heartPrice: number; animationType?: string | null };
type Catalog = { gifts: GiftCatalogItem[]; packages: number[]; buyRateVnd: number; cashoutRateVnd: number };
type Topup = {
  id: string;
  hearts: number;
  amountVnd: number;
  paymentCode: string;
  status: string;
  qrUrl: string | null;
  bank: { bankName: string; accountNumber: string; accountHolder?: string } | null;
  sandbox: boolean;
};

interface GiftModalProps {
  open: boolean;
  onClose: () => void;
  slug: string;
  profile: Record<string, any>;
  catalog: Catalog | null;
  /** Gọi sau khi tặng quà thành công để trang chủ làm mới lời chúc + chạy hiệu ứng. */
  onSent: (gift: GiftCatalogItem) => void;
  notify: { success: (m: string) => void; error: (m: string) => void; warning: (m: string) => void };
}

/**
 * Quà mừng: khách đăng nhập -> nạp tiền mua tim -> dùng tim tặng quà (kèm lời chúc).
 * Tab "Chuyển khoản" giữ lại cách mừng trực tiếp vào tài khoản của chủ thiệp.
 */
const GiftModal: React.FC<GiftModalProps> = ({ open, onClose, slug, profile, catalog, onSent, notify }) => {
  const [tab, setTab] = useState<"hearts" | "bank">("hearts");
  const [loggedIn, setLoggedIn] = useState(false);
  const [hearts, setHearts] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [topupOpen, setTopupOpen] = useState(false);
  const [pkg, setPkg] = useState<number | null>(null);
  const [topup, setTopup] = useState<Topup | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshBalance = useCallback(async () => {
    try {
      const me = await userAuth.apiFetch<{ heartBalance: number }>("/hearts/me");
      setHearts(me.heartBalance);
      return me.heartBalance;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const has = Boolean(userAuth.getAccess());
    setLoggedIn(has);
    if (has) refreshBalance();
  }, [open, refreshBalance]);

  const stopPoll = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };
  useEffect(() => stopPoll, []);

  const goLogin = () => {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  };

  const startTopup = async () => {
    if (!pkg) return notify.warning("Hãy chọn gói tim");
    setCreating(true);
    try {
      const order = await userAuth.apiFetch<Topup>("/hearts/topups", { method: "POST", body: JSON.stringify({ hearts: pkg }) });
      setTopup(order);
      // Cổng thanh toán thật sẽ gọi webhook; trang này chỉ hỏi lại trạng thái đơn.
      stopPoll();
      pollRef.current = setInterval(async () => {
        try {
          const list = await userAuth.apiFetch<Array<{ id: string; status: string }>>("/hearts/topups");
          if (list.find((t) => t.id === order.id)?.status === "PAID") {
            stopPoll();
            await finishTopup(order.hearts);
          }
        } catch {
          /* thử lại ở lần sau */
        }
      }, 4000);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Không thể tạo đơn nạp");
    } finally {
      setCreating(false);
    }
  };

  const finishTopup = async (amount: number) => {
    setTopup(null);
    setTopupOpen(false);
    await refreshBalance();
    notify.success(`Đã nạp ${fmt(amount)} tim`);
  };

  const sandboxConfirm = async () => {
    if (!topup) return;
    setConfirming(true);
    try {
      await userAuth.apiFetch(`/hearts/topups/${topup.id}/sandbox-confirm`, { method: "POST" });
      stopPoll();
      await finishTopup(topup.hearts);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Không thể xác nhận");
    } finally {
      setConfirming(false);
    }
  };

  const closeTopup = () => {
    stopPoll();
    setTopup(null);
    setTopupOpen(false);
  };

  const selectedGift = catalog?.gifts.find((g) => g.code === selected) ?? null;

  const send = async () => {
    if (!selectedGift) return notify.warning("Hãy chọn một món quà");
    if (hearts !== null && hearts < selectedGift.heartPrice) {
      notify.warning("Bạn không đủ tim, hãy nạp thêm");
      setTopupOpen(true);
      return;
    }
    setSending(true);
    try {
      await userAuth.apiFetch(`/invitations/by-slug/${slug}/gifts`, {
        method: "POST",
        body: JSON.stringify({ giftCode: selectedGift.code, message: message.trim() || undefined }),
      });
      notify.success(`Đã tặng ${selectedGift.name}!`);
      setMessage("");
      setSelected(null);
      await refreshBalance();
      onSent(selectedGift);
      onClose();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Không thể tặng quà");
    } finally {
      setSending(false);
    }
  };

  const hasBank = Boolean(profile.accountNumber);
  const bankQrUrl =
    hasBank && profile.bankName
      ? vietQrUrl(profile.bankName, profile.accountNumber, profile.accountHolder || "")
      : null;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify.success("Đã sao chép");
    } catch {
      notify.error("Không thể sao chép");
    }
  };

  return (
    <>
      <Modal open={open} onCancel={onClose} footer={null} centered width={560} title={null} styles={{ body: { padding: 20 } }}>
        <h3 className="mb-3 text-center text-2xl font-bold" style={{ color: BRAND }}>Quà tặng</h3>
        <Segmented
          block
          className="mb-4"
          value={tab}
          onChange={(v) => setTab(v as "hearts" | "bank")}
          options={[
            { label: "Tặng quà bằng tim", value: "hearts" },
            { label: "Chuyển khoản", value: "bank" },
          ]}
        />

        {tab === "hearts" ? (
          <>
            <div className="mb-3 flex items-center justify-between rounded-xl bg-pink-50 px-4 py-2.5 text-sm">
              {loggedIn ? (
                <>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    Số dư: <b className="text-base" style={{ color: BRAND }}>{hearts === null ? "…" : fmt(hearts)}</b>
                    <Heart size={14} fill={BRAND} color={BRAND} />
                  </span>
                  <Button size="small" type="primary" onClick={() => setTopupOpen(true)}>Nạp tim</Button>
                </>
              ) : (
                <>
                  <span className="text-slate-600">Đăng nhập để mua tim và tặng quà</span>
                  <Button size="small" type="primary" onClick={goLogin}>Đăng nhập</Button>
                </>
              )}
            </div>

            <div className="grid max-h-[46vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4">
              {(catalog?.gifts ?? []).map((gift) => {
                const active = selected === gift.code;
                return (
                  <button
                    key={gift.code}
                    type="button"
                    onClick={() => setSelected(gift.code)}
                    className="flex flex-col items-center gap-1 rounded-xl border p-3 transition hover:shadow-md"
                    style={active ? { borderColor: BRAND, background: "#fff1f3" } : { borderColor: "#e2e8f0" }}
                  >
                    <span className="text-4xl leading-none">{gift.emoji}</span>
                    <span className="text-sm font-medium text-slate-700">{gift.name}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      {fmt(gift.heartPrice)} <Heart size={12} fill="#ef4444" color="#ef4444" />
                    </span>
                  </button>
                );
              })}
              {!catalog ? <p className="col-span-full py-6 text-center text-sm text-slate-400">Đang tải quà tặng…</p> : null}
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              placeholder="Lời chúc đi kèm (không bắt buộc)"
              className="mt-3 min-h-[70px] w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400"
            />
            <Button
              type="primary"
              block
              size="large"
              className="mt-3"
              loading={sending}
              disabled={!loggedIn || !selectedGift}
              onClick={send}
            >
              {selectedGift ? `Tặng ${selectedGift.name} · ${fmt(selectedGift.heartPrice)} tim` : "Chọn quà để tặng"}
            </Button>
          </>
        ) : hasBank ? (
          <div className="flex flex-col items-center gap-3 text-center">
            {bankQrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bankQrUrl} alt="QR chuyển khoản" className="w-56 rounded-xl border border-slate-200" />
            ) : null}
            <div className="w-full space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
              {profile.bankName ? <div>Ngân hàng: <b>{profile.bankName}</b></div> : null}
              {profile.accountHolder ? <div>Chủ tài khoản: <b>{profile.accountHolder}</b></div> : null}
              <div>Số tài khoản: <b>{profile.accountNumber}</b></div>
            </div>
            <Button icon={<Copy size={14} />} onClick={() => copy(String(profile.accountNumber))}>Sao chép số tài khoản</Button>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">Chủ thiệp chưa cập nhật tài khoản nhận quà mừng.</p>
        )}
      </Modal>

      <Modal open={topupOpen} onCancel={closeTopup} footer={null} centered title="Nạp tim" width={460}>
        {!topup ? (
          <>
            <p className="mb-3 text-sm text-slate-500">
              1 tim = {fmt(catalog?.buyRateVnd ?? 1000)}đ. Tim dùng để tặng quà trên thiệp, không thể rút lại thành tiền.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(catalog?.packages ?? [10, 20, 50, 100, 200, 500]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPkg(p)}
                  className="rounded-xl border p-3 text-center transition"
                  style={pkg === p ? { borderColor: BRAND, background: "#fff1f3" } : { borderColor: "#e2e8f0" }}
                >
                  <div className="flex items-center justify-center gap-1 text-lg font-bold">{fmt(p)} <Heart size={14} fill="#ef4444" color="#ef4444" /></div>
                  <div className="text-xs text-slate-500">{fmt(p * (catalog?.buyRateVnd ?? 1000))}đ</div>
                </button>
              ))}
            </div>
            <Button type="primary" block size="large" className="mt-4" loading={creating} disabled={!pkg} onClick={startTopup}>
              Tiếp tục thanh toán
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="text-sm text-slate-600">
              Thanh toán <b>{fmt(topup.amountVnd)}đ</b> để nhận <b>{fmt(topup.hearts)} tim</b>
            </div>
            {topup.qrUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={topup.qrUrl} alt="QR thanh toán" className="w-56 rounded-xl border border-slate-200" />
                <div className="text-xs text-slate-500">
                  Nội dung chuyển khoản: <b>{topup.paymentCode}</b>. Tim sẽ được cộng tự động sau khi nhận được tiền.
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Chưa cấu hình tài khoản nhận tiền / cổng thanh toán. Mã đơn: <b>{topup.paymentCode}</b>
              </div>
            )}
            {topup.sandbox ? (
              <Button block loading={confirming} onClick={sandboxConfirm}>
                Xác nhận đã thanh toán (chế độ thử nghiệm)
              </Button>
            ) : null}
            <div className="text-xs text-slate-400">Đang chờ thanh toán…</div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default GiftModal;
