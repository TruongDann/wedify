"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dropdown } from "antd";
import {
  ArrowUpRight,
  ChevronDown,
  FilePlus2,
  Gem,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mails,
  UserPlus,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { userAuth, type PlanTierName } from "@/lib/auth";

interface Profile {
  name: string;
  email: string;
  avatarUrl?: string | null;
  tier: PlanTierName;
}

const PLAN_LABEL: Record<PlanTierName, string> = {
  FREE: "Gói Free",
  BASIC: "Gói Basic",
  PREMIUM: "Gói Premium",
};

const PLAN_TONE: Record<PlanTierName, string> = {
  FREE: "bg-surface-muted text-ink-2",
  BASIC: "bg-primary-soft text-link",
  PREMIUM: "bg-primary text-white",
};

const readProfile = (): Profile | null => {
  if (!userAuth.getAccess()) return null;
  const raw = userAuth.getProfile() as Record<string, unknown> | null;
  if (!raw) return null;
  return {
    name: String(raw.name || raw.email || "Tài khoản"),
    email: String(raw.email || ""),
    avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : null,
    tier: userAuth.getCurrentPlanTier(),
  };
};

interface MenuLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Mẫu yêu thích / tạo thiệp mới đều bắt đầu từ thư viện mẫu ở trang chủ
const NAV_GROUPS: MenuLink[][] = [
  [
    { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { href: "/dashboard/invitations", label: "Thiệp của tôi", icon: Mails },
    { href: "/#templates", label: "Mẫu yêu thích", icon: Heart },
    { href: "/#templates", label: "Tạo thiệp mới", icon: FilePlus2 },
  ],
  [
    { href: "/dashboard/profile", label: "Thông tin cá nhân", icon: UserRound },
    { href: "/dashboard/profile", label: "Gói dịch vụ của tôi", icon: Gem },
  ],
];

const GUEST_LINKS: MenuLink[] = [
  { href: "/login", label: "Đăng nhập", icon: LogIn },
  { href: "/register", label: "Tạo tài khoản", icon: UserPlus },
];

// Kích thước theo menu tài khoản của CineLove: mục cao 38px, chữ 14px/500, icon 16px
const rowClass =
  "flex h-9.5 w-full items-center gap-2.5 rounded-xl px-2.5 text-sm font-medium text-ink! hover:bg-surface-muted transition-colors";
const divider = <div className="mx-1 my-1.5 border-t border-line" />;

/** Avatar ở góc phải header editor, bấm mở menu tài khoản. */
export const UserMenu: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Đọc từ localStorage sau khi mount để tránh lệch HTML lúc hydrate; làm mới thông tin từ API nếu có phiên
  useEffect(() => {
    let cancelled = false;
    userAuth.hydrateSession().finally(() => {
      if (!cancelled) setProfile(readProfile());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (next) setProfile(readProfile());
    setOpen(next);
  };

  const handleLogout = async () => {
    setOpen(false);
    await userAuth.logout();
    setProfile(null);
    router.push("/login");
  };

  const renderLink = ({ href, label, icon: Icon }: MenuLink) => (
    <Link key={label} href={href} className={rowClass} onClick={() => setOpen(false)}>
      <Icon size={16} className="text-ink-2" />
      {label}
    </Link>
  );

  const panel = (
    <div className="w-60 rounded-2xl border border-line bg-white p-1.5 shadow-[0_20px_48px_-12px_rgba(24,24,27,0.24),0_6px_12px_-6px_rgba(24,24,27,0.1)]">
      {profile ? (
        <>
          <div className="px-2.5 pt-2.5 pb-2">
            <div className="text-[14.5px] font-semibold leading-5 text-ink truncate">{profile.name}</div>
            {profile.email && (
              <div className="text-[13px] leading-4.5 text-ink-3 truncate">{profile.email}</div>
            )}
            <div className="mt-2.5 flex items-center justify-between">
              <span
                className={`flex h-5 items-center rounded-full px-2 text-[11.5px] font-semibold ${PLAN_TONE[profile.tier]}`}
              >
                {PLAN_LABEL[profile.tier]}
              </span>
              {profile.tier !== "PREMIUM" && (
                <Link
                  href="/dashboard/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-0.5 text-[13px] font-semibold text-link! hover:text-primary-dark! transition-colors"
                >
                  Nâng cấp <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>
          {NAV_GROUPS.map((group, i) => (
            <React.Fragment key={i}>
              {divider}
              {group.map(renderLink)}
            </React.Fragment>
          ))}
          {divider}
          <button type="button" className={rowClass} onClick={handleLogout}>
            <LogOut size={16} className="text-ink-2" />
            Đăng xuất
          </button>
        </>
      ) : (
        <>
          <div className="px-2.5 pt-2.5 pb-2">
            <div className="text-[14.5px] font-semibold leading-5 text-ink">Bạn chưa đăng nhập</div>
            <div className="text-[13px] leading-5 text-ink-3">
              Đăng nhập để lưu và xuất bản thiệp lên Wedify.
            </div>
          </div>
          {divider}
          {GUEST_LINKS.map(renderLink)}
        </>
      )}
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={handleOpenChange}
      trigger={["click"]}
      placement="bottomRight"
      popupRender={() => panel}
    >
      <button
        type="button"
        aria-label="Tài khoản"
        className="ml-1 flex items-center gap-1 p-0.5 pr-2 rounded-full border border-line hover:bg-surface-muted transition-colors"
      >
        {profile?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <Image
            src="/assets/images/brand/avatar.jpg"
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
        <ChevronDown
          size={14}
          className={`text-ink-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
    </Dropdown>
  );
};

export default UserMenu;
