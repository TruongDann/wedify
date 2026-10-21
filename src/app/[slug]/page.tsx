"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Card, Modal, Spin, Typography, message as antMessage } from "antd";
import { QRCodeSVG } from "qrcode.react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Gift,
  Heart,
  MessageCircle,
  Music,
  Send,
  Share2,
  Smartphone,
  UserCheck,
} from "lucide-react";

import { NOTO_ANIMATED_ATTRIBUTION, isNotoAnimatedSrc } from "@/constants/animatedStock";
import { setViewerRuntime } from "@/lib/viewerRuntime";
import { IntroOverlay } from "@/components/card/IntroOverlay";
import InvitationCover from "@/components/invitation/InvitationCover";
import GiftModal, { type GiftCatalogItem } from "@/components/invitation/GiftModal";

const PublicCanvas = dynamic(() => import("@/components/invitation/PublicCanvas"), { ssr: false });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const BRAND = "#ef4565";

type InvitationPublicData = {
  id: string;
  title: string;
  slug: string;
  eventDate?: string;
  location?: string;
  profileJson?: Record<string, any>;
  contentJson?: {
    canvasSettings?: Record<string, any>;
    elements?: Array<Record<string, any>>;
  };
};

type GuestLinkData = { id: string; name: string; honorific?: string; personalizedToken: string };
type PublicWish = { id: string; guestName: string; message: string; giftCode?: string | null; createdAt: string };
type RsvpStatusLabel = "ATTENDING" | "NOT_ATTENDING" | "PENDING";

const timeAgo = (iso: string) => {
  const diff = Math.max(Date.now() - new Date(iso).getTime(), 0);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
};

const AVATAR_COLORS = ["#fde68a", "#c7d2fe", "#bbf7d0", "#fbcfe8", "#bae6fd", "#fecaca"];
const avatarColor = (name: string) => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const isRsvpElement = (element: Record<string, any>) => {
  const id = typeof element?.id === "string" ? element.id : "";
  const content = typeof element?.content === "string" ? element.content : "";
  // Khối RSVP trong canvas được thay bằng nút "Tham dự" của trang xuất bản.
  if (id.includes("-rsvpBox") || id.startsWith("rsvp-footer-element-")) return true;
  return content.toLowerCase().includes("rsvp");
};

export default function PublicInvitationPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const guestToken = searchParams.get("g");
  const slug = params?.slug;

  const [invitation, setInvitation] = useState<InvitationPublicData | null>(null);
  const [guestLink, setGuestLink] = useState<GuestLinkData | null>(null);
  const [wishes, setWishes] = useState<PublicWish[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [sideTab, setSideTab] = useState<"wishes" | "phone">("wishes");
  const [wishName, setWishName] = useState("");
  const [wishText, setWishText] = useState("");
  const [sendingWish, setSendingWish] = useState(false);

  const [modal, setModal] = useState<null | "rsvp" | "gift" | "share" | "wishes">(null);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatusLabel>("ATTENDING");
  const [rsvpCompanions, setRsvpCompanions] = useState(0);
  const [rsvpNote, setRsvpNote] = useState("");
  const [sendingRsvp, setSendingRsvp] = useState(false);

  const [catalog, setCatalog] = useState<{ gifts: GiftCatalogItem[]; packages: number[]; buyRateVnd: number; cashoutRateVnd: number } | null>(null);
  const [burst, setBurst] = useState<{ emoji: string; key: number } | null>(null);
  const [coverOpen, setCoverOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicOn, setMusicOn] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  const [scrollInfo, setScrollInfo] = useState({ top: 0, height: 900 });
  const scrollRaf = useRef<number | null>(null);

  const handleScroll = () => {
    if (scrollRaf.current !== null) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null;
      const node = scrollRef.current;
      if (node) setScrollInfo({ top: node.scrollTop, height: node.clientHeight });
    });
  };

  const [msgApi, msgHolder] = antMessage.useMessage();

  const fetchWishes = useCallback(async (s: string): Promise<PublicWish[]> => {
    const response = await fetch(`${API_BASE_URL}/invitations/by-slug/${s}/wishes`);
    const data = await response.json().catch(() => []);
    return response.ok && Array.isArray(data) ? data : [];
  }, []);

  useEffect(() => {
    setPageUrl(window.location.origin + window.location.pathname);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/hearts/catalog`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setCatalog(data))
      .catch(() => undefined);
  }, []);

  // Làm mới lời chúc/quà tặng định kỳ để thấy người khác vừa gửi.
  useEffect(() => {
    if (!slug) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") fetchWishes(slug).then(setWishes);
    }, 20000);
    return () => clearInterval(timer);
  }, [slug, fetchWishes]);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [res, wishList] = await Promise.all([fetch(`${API_BASE_URL}/invitations/by-slug/${slug}`), fetchWishes(slug)]);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Không thể tải thiệp");
        setInvitation(data);
        setWishes(wishList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể mở thiệp");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, fetchWishes]);

  useEffect(() => {
    if (!guestToken) return;
    fetch(`${API_BASE_URL}/guest-links/${guestToken}`)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.message);
        setGuestLink(data);
        setRsvpName(data.name || "");
        setWishName(data.name || "");
      })
      .catch(() => undefined);
  }, [guestToken]);

  // Lượt thích lưu cục bộ theo từng thiệp (chưa có bảng lượt thích ở backend).
  useEffect(() => {
    if (!slug) return;
    try {
      setLiked(localStorage.getItem(`wedify:liked:${slug}`) === "1");
    } catch {
      /* ignore */
    }
  }, [slug]);

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    try {
      localStorage.setItem(`wedify:liked:${slug}`, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const profile = useMemo(() => (invitation?.profileJson && typeof invitation.profileJson === "object" ? invitation.profileJson : {}), [invitation]);
  const viewerData = useMemo(
    () => ({ slug: slug ?? "", guestToken, guestName: guestLink?.name ?? "", title: invitation?.title ?? "", apiBase: API_BASE_URL, profile }),
    [slug, guestToken, guestLink?.name, invitation?.title, profile],
  );
  // Cho các tiện ích gốc của editor (form tham dự...) biết đang ở thiệp nào để gửi về API
  useEffect(() => {
    if (!slug) return;
    setViewerRuntime({ slug, guestToken, guestName: guestLink?.name ?? "", apiBase: API_BASE_URL });
    return () => setViewerRuntime(null);
  }, [slug, guestToken, guestLink?.name]);

  const canvasSettings = useMemo<Record<string, any>>(
    () => ({ width: 600, height: 3200, backgroundColor: "#ffffff", ...(invitation?.contentJson?.canvasSettings ?? {}) }),
    [invitation],
  );
  const elements = useMemo(() => {
    const raw = Array.isArray(invitation?.contentJson?.elements) ? invitation!.contentJson!.elements! : [];
    return raw.filter((el) => el && !isRsvpElement(el));
  }, [invitation]);

  // Đo bề rộng khung để scale canvas vừa khít, giữ nguyên tỉ lệ như editor.
  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const update = () => {
      setFrameWidth(node.clientWidth);
      setScrollInfo((prev) => ({ ...prev, height: node.clientHeight }));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [invitation, loading]);

  // Nhạc nền: trình duyệt chặn autoplay nên thử phát ở lần tương tác đầu tiên.
  const musicSrc: string | undefined = canvasSettings.backgroundMusic?.src;
  useEffect(() => {
    if (!musicSrc) return;
    const audio = new Audio(musicSrc);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    const start = () => {
      audio.play().then(() => setMusicOn(true)).catch(() => undefined);
      window.removeEventListener("pointerdown", start);
    };
    if (canvasSettings.isMusicPlaying !== false) {
      audio.play().then(() => setMusicOn(true)).catch(() => window.addEventListener("pointerdown", start, { once: true }));
    }
    return () => {
      window.removeEventListener("pointerdown", start);
      audio.pause();
      audioRef.current = null;
    };
  }, [musicSrc, canvasSettings.isMusicPlaying]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
    } else {
      audio.play().then(() => setMusicOn(true)).catch(() => undefined);
    }
  };

  const scrollFrame = (dir: 1 | -1) => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollBy({ top: dir * node.clientHeight * 0.8, behavior: "smooth" });
  };

  // Bấm "Mở thiệp" là thao tác của người dùng nên trình duyệt cho phép phát nhạc nền ngay.
  const handleCoverOpen = () => {
    audioRef.current?.play().then(() => setMusicOn(true)).catch(() => undefined);
  };

  const handleGiftSent = async (gift: GiftCatalogItem) => {
    setBurst({ emoji: gift.emoji, key: Date.now() });
    setTimeout(() => setBurst(null), 3200);
    setWishes(await fetchWishes(slug));
  };

  const guestDisplayName = guestLink ? [guestLink.honorific, guestLink.name].filter(Boolean).join(" ") : "";

  const submitWish = async () => {
    const text = wishText.trim();
    const name = (guestLink?.name || wishName).trim();
    if (!name) return msgApi.warning("Vui lòng nhập tên của bạn");
    if (!text) return msgApi.warning("Vui lòng nhập lời chúc");

    setSendingWish(true);
    try {
      const res = guestToken
        ? await fetch(`${API_BASE_URL}/guest-links/${guestToken}/wishes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text }),
          })
        : await fetch(`${API_BASE_URL}/invitations/by-slug/${slug}/wishes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guestName: name, message: text }),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || "Không thể gửi lời chúc");
      setWishText("");
      setWishes(await fetchWishes(slug));
      msgApi.success("Đã gửi lời chúc, cảm ơn bạn!");
    } catch (err) {
      msgApi.error(err instanceof Error ? err.message : "Không thể gửi lời chúc");
    } finally {
      setSendingWish(false);
    }
  };

  const submitRsvp = async () => {
    const name = (guestLink?.name || rsvpName).trim();
    if (!name) return msgApi.warning("Vui lòng nhập tên của bạn");

    setSendingRsvp(true);
    try {
      const body = { status: rsvpStatus, numberOfCompanions: Number(rsvpCompanions) || 0, note: rsvpNote || undefined };
      const res = guestToken
        ? await fetch(`${API_BASE_URL}/guest-links/${guestToken}/rsvp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`${API_BASE_URL}/invitations/by-slug/${slug}/rsvp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...body, name }),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || "Không thể gửi xác nhận");
      msgApi.success(`Cảm ơn ${name}! Chúng tôi đã ghi nhận xác nhận của bạn.`);
      setModal(null);
      setRsvpNote("");
    } catch (err) {
      msgApi.error(err instanceof Error ? err.message : "Không thể gửi xác nhận");
    } finally {
      setSendingRsvp(false);
    }
  };

  const copy = async (text: string, okText = "Đã sao chép") => {
    try {
      await navigator.clipboard.writeText(text);
      msgApi.success(okText);
    } catch {
      msgApi.error("Không thể sao chép");
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: invitation?.title, url: pageUrl });
        return;
      } catch {
        /* người dùng huỷ -> mở modal */
      }
    }
    setModal("share");
  };

  // ---- Nút tiện ích đặt trong thiệp (do chủ thiệp thêm ở editor) ----
  const downloadReminder = () => {
    const rawDate = profile.weddingDate || invitation?.eventDate;
    if (!rawDate) return msgApi.warning("Thiệp chưa có ngày tổ chức");
    const day = new Date(rawDate);
    const [hh, mm] = String(profile.weddingTime || "09:00").split(":").map((n) => Number(n) || 0);
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hh, mm);
    const end = new Date(start.getTime() + 3 * 3600 * 1000);
    const stamp = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
    const clean = (value: unknown) => String(value ?? "").replace(/[;,\\]/g, " ").replace(/\s+/g, " ");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedify//VI", "BEGIN:VEVENT",
      `UID:${slug}@wedify`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
      `SUMMARY:${clean(invitation?.title)}`, `LOCATION:${clean([profile.location, profile.address].filter(Boolean).join(" - "))}`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "thiep-moi.ics";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleWidgetAction = (action: string, props: Record<string, any>) => {
    switch (action) {
      case "rsvp":
        return setModal("rsvp");
      case "gift":
        return setModal("gift");
      case "wishes":
        return window.innerWidth >= 1024 ? setSideTab("wishes") : setModal("wishes");
      case "share":
        return void share();
      case "reminder":
        return downloadReminder();
      case "map": {
        const query = [profile.location, profile.address].filter(Boolean).join(", ");
        const target = profile.mapUrl || props.value || (query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "");
        return target ? void window.open(target, "_blank", "noopener,noreferrer") : msgApi.info("Chủ thiệp chưa cập nhật địa điểm");
      }
      case "call":
        return props.value ? void (window.location.href = `tel:${String(props.value).replace(/[^\d+]/g, "")}`) : msgApi.info("Chưa có số điện thoại");
      case "link":
        return /^https?:\/\//i.test(String(props.value ?? "")) ? void window.open(String(props.value), "_blank", "noopener,noreferrer") : undefined;
      default:
        return undefined;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 via-white to-white">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 via-white to-white px-4">
        <Card className="max-w-lg text-center shadow-sm">
          <Typography.Title level={3}>Thiệp không khả dụng</Typography.Title>
          <Typography.Paragraph type="secondary">{error || "Thiệp này chưa được công bố hoặc link đã hết hạn."}</Typography.Paragraph>
          <Button href="/" type="primary">Về trang chủ</Button>
        </Card>
      </div>
    );
  }

  const eventDate = profile.weddingDate || invitation.eventDate;
  const eventDateText = eventDate ? new Date(eventDate).toLocaleDateString("vi-VN") : "";
  const location = profile.location || (invitation.location && invitation.location !== "Chưa cập nhật" ? invitation.location : "");
  const description = [eventDateText && `Ngày ${eventDateText}`, location].filter(Boolean).join(" · ");
  const previewImage: string | undefined = profile.previewImage || profile.thumbnail;
  const coverNames = [profile.groomName, profile.brideName].filter((n: unknown) => typeof n === "string" && n.trim()).join(" & ") || invitation.title;
  const coverImage: string | undefined =
    profile.cover?.image ||
    (elements.find((el) => el.type === "image" && Number(el.size?.width) >= 500 && typeof el.src === "string")?.src as string | undefined);
  const coverDateText = eventDate
    ? new Date(eventDate).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const actionButtons: Array<{ key: string; label?: string; icon: React.ReactNode; onClick: () => void; active?: boolean }> = [
    { key: "like", label: liked ? "1" : "0", icon: <Heart size={20} fill={liked ? BRAND : "none"} color={liked ? BRAND : "currentColor"} />, onClick: toggleLike },
    { key: "wishes", label: String(wishes.length), icon: <MessageCircle size={20} />, onClick: () => (window.innerWidth >= 1024 ? setSideTab("wishes") : setModal("wishes")) },
    { key: "gift", label: "Quà mừng", icon: <Gift size={20} />, onClick: () => setModal("gift") },
    { key: "rsvp", label: "Tham dự", icon: <UserCheck size={20} />, onClick: () => setModal("rsvp") },
    { key: "share", label: "Chia sẻ", icon: <Share2 size={20} />, onClick: share },
    { key: "phone", label: "Điện thoại", icon: <Smartphone size={20} />, onClick: () => (window.innerWidth >= 1024 ? setSideTab("phone") : setModal("share")) },
  ];

  const ActionColumn = (
    <div className="flex flex-col items-center gap-3">
      {musicSrc ? (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={musicOn ? "Tắt nhạc" : "Bật nhạc"}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white text-slate-700 shadow-md"
          style={{ animation: musicOn ? "wedifySpin 4s linear infinite" : undefined }}
        >
          <Music size={18} color={musicOn ? BRAND : "#64748b"} />
        </button>
      ) : null}
      {actionButtons.map((btn) => (
        <button key={btn.key} type="button" onClick={btn.onClick} className="group flex flex-col items-center gap-1 text-slate-600">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition group-hover:scale-105 group-hover:border-pink-300">
            {btn.icon}
          </span>
          {btn.label ? <span className="text-[11px] leading-none">{btn.label}</span> : null}
        </button>
      ))}
    </div>
  );

  const WishList = (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
      {wishes.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">Chưa có lời chúc nào. Hãy là người đầu tiên!</p>
      ) : (
        wishes.map((wish) => (
          <div key={wish.id} className="flex gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-slate-700"
              style={{ background: avatarColor(wish.guestName) }}
            >
              {wish.guestName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800">{wish.guestName}</div>
              {wish.giftCode ? (
                <div className="mb-0.5 inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-xs" style={{ color: BRAND }}>
                  <span className="text-base leading-none">{catalog?.gifts.find((g) => g.code === wish.giftCode)?.emoji ?? "🎁"}</span>
                  {catalog?.gifts.find((g) => g.code === wish.giftCode)?.name ?? "Quà tặng"}
                </div>
              ) : null}
              <p className="whitespace-pre-wrap break-words text-sm text-slate-700">{wish.message}</p>
              <div className="mt-0.5 text-xs text-slate-400">{timeAgo(wish.createdAt)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const WishForm = (
    <div className="space-y-2 border-t border-slate-100 p-3">
      {!guestLink ? (
        <input
          value={wishName}
          onChange={(e) => setWishName(e.target.value)}
          maxLength={80}
          placeholder="Tên của bạn"
          className="w-full rounded-full bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-200"
        />
      ) : (
        <div className="px-1 text-xs text-slate-500">Gửi với tên <b>{guestDisplayName}</b></div>
      )}
      <div className="flex items-center gap-2">
        <input
          value={wishText}
          onChange={(e) => setWishText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !sendingWish && submitWish()}
          maxLength={1000}
          placeholder="Gửi lời chúc..."
          className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-200"
        />
        <button
          type="button"
          onClick={submitWish}
          disabled={sendingWish}
          aria-label="Gửi lời chúc"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-60"
          style={{ background: BRAND }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );

  const PhoneQr = (
    <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
      <p className="text-sm text-slate-600">Quét mã QR bằng điện thoại để xem thiệp trên thiết bị của bạn.</p>
      {pageUrl ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <QRCodeSVG value={pageUrl} size={180} />
        </div>
      ) : null}
      <Button icon={<Copy size={14} />} onClick={() => copy(pageUrl, "Đã sao chép liên kết")}>Sao chép liên kết</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 lg:h-screen lg:overflow-hidden">
      {msgHolder}
      {!coverOpen && canvasSettings.intro ? (
        // Thiệp đã cấu hình màn hình mở đầu (phong bì / rèm) trong editor: dùng đúng cấu hình đó
        <IntroOverlay
          intro={canvasSettings.intro}
          onDone={() => {
            handleCoverOpen();
            setCoverOpen(true);
          }}
        />
      ) : null}
      {!coverOpen && !canvasSettings.intro ? (
        <InvitationCover
          names={coverNames}
          dateText={coverDateText}
          guestName={guestDisplayName || profile.guestDefault || "Quý khách"}
          eyebrow={profile.cover?.eyebrow}
          image={coverImage}
          accent={profile.cover?.accent || "#be123c"}
          background={String(canvasSettings.backgroundColor || "#fff7f8")}
          ambientType={canvasSettings.ambientEffect?.type}
          onOpen={handleCoverOpen}
          onClosed={() => setCoverOpen(true)}
        />
      ) : null}
      {elements.some((el) => isNotoAnimatedSrc(typeof el.src === "string" ? el.src : undefined)) ? (
        <div className="pointer-events-none fixed bottom-1 left-1/2 z-10 -translate-x-1/2 text-[10px] text-slate-400">{NOTO_ANIMATED_ATTRIBUTION}</div>
      ) : null}
      <style>{`@keyframes wedifySpin { to { transform: rotate(360deg); } }`}</style>

      <div className="mx-auto flex min-h-screen w-full max-w-[1920px] lg:h-screen">
        {/* Cột trái: thông tin thiệp (chỉ desktop) */}
        <aside className="hidden w-[280px] shrink-0 flex-col gap-5 overflow-y-auto p-5 xl:flex">
          <a href="/" className="text-2xl font-extrabold tracking-tight" style={{ color: BRAND }}>wedify</a>

          <div>
            <div className="overflow-hidden rounded-xl bg-gradient-to-br from-pink-50 to-rose-100" style={{ aspectRatio: "4 / 3" }}>
              {previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewImage} alt={invitation.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-lg font-semibold text-pink-400">{invitation.title}</div>
              )}
            </div>
            <h1 className="mt-3 text-lg font-bold text-slate-900">{invitation.title}</h1>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
            {profile.mapUrl ? (
              <a href={profile.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium" style={{ color: BRAND }}>
                Xem bản đồ ↗
              </a>
            ) : null}
            {guestLink ? <p className="mt-2 text-sm" style={{ color: BRAND }}>Xin chào {guestDisplayName}! Thiệp này dành riêng cho bạn.</p> : null}
          </div>

          <div className="rounded-xl bg-pink-50 p-4">
            <p className="text-sm text-slate-700">Thích mẫu này? Tạo thiệp của riêng bạn chỉ trong vài phút.</p>
            <a
              href="/editor"
              className="mt-3 inline-block rounded-full px-5 py-2 text-sm font-semibold text-white"
              style={{ background: BRAND }}
            >
              Dùng mẫu này
            </a>
          </div>

          <p className="mt-auto text-xs text-slate-400">© {new Date().getFullYear()} Wedify</p>
        </aside>

        {/* Giữa: một khung duy nhất, cuộn bên trong */}
        <main className="relative flex min-w-0 flex-1 items-center justify-center bg-slate-50 lg:bg-white">
          <div className="relative flex h-screen w-full max-w-[500px] items-center justify-center lg:h-full lg:py-4">
            <div
              ref={frameRef}
              className="relative h-full w-full overflow-hidden bg-white shadow-[0_8px_40px_rgba(15,23,42,0.18)] lg:rounded-2xl lg:border lg:border-slate-200"
            >
              <div ref={scrollRef} onScroll={handleScroll} className="scrollbar-hide h-full w-full overflow-y-auto overflow-x-hidden">
                {elements.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-8 text-center text-slate-400">Thiệp chưa có nội dung.</div>
                ) : (
                  <PublicCanvas elements={elements} canvasSettings={canvasSettings} displayWidth={frameWidth} scrollTop={scrollInfo.top} viewportHeight={scrollInfo.height} onAction={handleWidgetAction} viewerData={viewerData} placeholders={{ guest: guestDisplayName || profile.guestDefault || "Quý khách" }} />
                )}
              </div>

              {/* Mobile: cột nút nổi trong khung */}
              <div className="absolute bottom-6 right-3 z-10 lg:hidden [&_button>span:first-child]:bg-white/90">{ActionColumn}</div>
            </div>

            {/* Desktop: cột nút nằm ngoài khung, sát bên phải */}
            <div className="absolute -right-[60px] bottom-6 z-10 hidden lg:block">{ActionColumn}</div>
          </div>

          {/* Mũi tên cuộn (desktop) */}
          <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3 2xl:flex">
            <button type="button" onClick={() => scrollFrame(-1)} aria-label="Cuộn lên" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">
              <ChevronUp size={20} />
            </button>
            <button type="button" onClick={() => scrollFrame(1)} aria-label="Cuộn xuống" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">
              <ChevronDown size={20} />
            </button>
          </div>
        </main>

        {/* Cột phải: lời chúc / xem trên điện thoại (desktop) */}
        <aside className="hidden w-[400px] shrink-0 flex-col border-l border-slate-100 lg:flex">
          <div className="flex border-b border-slate-100 text-sm">
            {([
              ["wishes", "Lời chúc"],
              ["phone", "Xem trên điện thoại"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSideTab(key)}
                className={`flex-1 border-b-2 px-4 py-3 font-medium transition ${sideTab === key ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {sideTab === "wishes" ? (
            <>
              <div className="py-3 text-center text-sm text-slate-500">{wishes.length} lời chúc</div>
              {WishList}
              {WishForm}
            </>
          ) : (
            PhoneQr
          )}
        </aside>
      </div>

      {/* Lời chúc trên mobile/tablet */}
      <Modal title={`${wishes.length} lời chúc`} open={modal === "wishes"} onCancel={() => setModal(null)} footer={null} centered styles={{ body: { padding: 0 } }}>
        <div className="flex max-h-[70vh] flex-col">
          {WishList}
          {WishForm}
        </div>
      </Modal>

      {/* Tham dự */}
      <Modal title="Xác nhận tham dự" open={modal === "rsvp"} onCancel={() => setModal(null)} footer={null} centered>
        <div className="space-y-3">
          {guestLink ? (
            <p className="rounded-lg bg-pink-50 px-3 py-2 text-sm" style={{ color: BRAND }}>Xin chào {guestDisplayName}! Thiệp mời này dành riêng cho bạn.</p>
          ) : (
            <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} maxLength={80} placeholder="Tên của bạn" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400" />
          )}
          <div className="grid grid-cols-2 gap-2">
            {([
              ["ATTENDING", "Tôi sẽ tham dự"],
              ["NOT_ATTENDING", "Rất tiếc, không đi được"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRsvpStatus(value)}
                className="rounded-lg border px-3 py-2.5 text-sm transition"
                style={rsvpStatus === value ? { borderColor: BRAND, background: "#fff1f3", color: BRAND, fontWeight: 600 } : { borderColor: "#e2e8f0" }}
              >
                {label}
              </button>
            ))}
          </div>
          {rsvpStatus === "ATTENDING" ? (
            <label className="flex items-center justify-between gap-3 text-sm text-slate-600">
              Số người đi cùng
              <input type="number" min={0} value={rsvpCompanions} onChange={(e) => setRsvpCompanions(Math.max(0, Number(e.target.value) || 0))} className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-400" />
            </label>
          ) : null}
          <textarea value={rsvpNote} onChange={(e) => setRsvpNote(e.target.value)} placeholder="Lời nhắn (không bắt buộc)" className="min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400" />
          <Button type="primary" block size="large" loading={sendingRsvp} onClick={submitRsvp}>Gửi xác nhận</Button>
        </div>
      </Modal>

      {/* Quà mừng: mua tim -> tặng quà */}
      <GiftModal
        open={modal === "gift"}
        onClose={() => setModal(null)}
        slug={slug}
        profile={profile}
        catalog={catalog}
        onSent={handleGiftSent}
        notify={msgApi}
      />

      {/* Hiệu ứng khi tặng quà */}
      {burst ? (
        <div key={burst.key} className="pointer-events-none fixed inset-0 z-[2000] overflow-hidden">
          <style>{`@keyframes wedifyRise { 0% { transform: translateY(0) scale(.6); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-105vh) scale(1.4); opacity: 0; } }`}</style>
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="absolute bottom-0 text-4xl"
              style={{
                left: `${(i * 37) % 100}%`,
                animation: `wedifyRise ${2 + (i % 5) * 0.35}s ease-out ${(i % 8) * 0.12}s both`,
              }}
            >
              {burst.emoji}
            </span>
          ))}
        </div>
      ) : null}

      {/* Chia sẻ / xem trên điện thoại */}
      <Modal title="Chia sẻ thiệp" open={modal === "share"} onCancel={() => setModal(null)} footer={null} centered>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input readOnly value={pageUrl} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
            <Button icon={<Copy size={14} />} onClick={() => copy(pageUrl, "Đã sao chép liên kết")}>Sao chép</Button>
          </div>
          {PhoneQr}
        </div>
      </Modal>
    </div>
  );
}
