"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Drawer } from "antd";
import {
  CalendarCheck,
  Clapperboard,
  Crown,
  Gift,
  Globe,
  LayoutDashboard,
  Mails,
  MessageSquareHeart,
  MessageSquarePlus,
  MonitorPlay,
  SquarePen,
  UserRound,
  type LucideIcon,
} from "lucide-react";

interface AppMenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Không có href = tính năng chưa làm, hiện nhãn "Sắp có". */
  href?: string;
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Trang chủ",
    items: [
      { label: "Tổng quan", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Gói dịch vụ của tôi", icon: Crown, href: "/dashboard/profile" },
      { label: "Tạo thiệp mới", icon: SquarePen, href: "/#templates" },
    ],
  },
  {
    title: "Thiết kế của tôi",
    items: [
      { label: "Thiệp online", icon: Mails, href: "/dashboard/invitations" },
      { label: "Video dạm ngõ", icon: Clapperboard },
      { label: "Màn hình LED", icon: MonitorPlay },
      { label: "Website khác", icon: Globe },
    ],
  },
  {
    title: "Quà tặng & lời chúc",
    items: [
      { label: "Lời chúc", icon: MessageSquareHeart, href: "/dashboard/gifts" },
      { label: "Quà tặng", icon: Gift, href: "/dashboard/gifts" },
      // Danh sách khách xác nhận nằm trong từng thiệp
      { label: "Xác nhận tham dự", icon: CalendarCheck, href: "/dashboard/invitations" },
    ],
  },
  {
    title: "Tài khoản",
    items: [{ label: "Thông tin cá nhân", icon: UserRound, href: "/dashboard/profile" }],
  },
  {
    title: "Hỗ trợ",
    items: [{ label: "Đóng góp ý kiến", icon: MessageSquarePlus }],
  },
];

// Kích thước theo menu của CineLove: mục cao 42px, bo tròn, chữ 14.5px/500, icon 19px
const rowClass =
  "flex h-10.5 items-center gap-3 rounded-full px-3 text-[14.5px] font-medium transition-colors";

/** Menu điều hướng mở từ nút ☰ ở header editor. */
export const AppMenuDrawer: React.FC<AppMenuDrawerProps> = ({ open, onClose }) => (
  <Drawer
    open={open}
    onClose={onClose}
    placement="left"
    size={260}
    closable={false}
    styles={{
      body: { padding: 0 },
      mask: { backgroundColor: "rgba(24, 24, 27, 0.44)", backdropFilter: "blur(3px)" },
    }}
  >
    <nav aria-label="Điều hướng" className="flex h-full flex-col overflow-y-auto px-9 pt-9 pb-6">
      <Link href="/" onClick={onClose} className="flex h-13 shrink-0 items-center">
        <Image
          src="/assets/images/brand/logo-web.png"
          alt="Wedify"
          width={106}
          height={28}
          style={{ objectFit: "contain" }}
        />
      </Link>

      {SECTIONS.map((section, i) => (
        <div key={section.title} className={i === 0 ? "" : "mt-4.5"}>
          <div className="mb-1.5 px-3 text-[11.5px] font-semibold uppercase leading-4 tracking-[0.08em] text-ink-3">
            {section.title}
          </div>
          <div className="space-y-0.5">
            {section.items.map(({ label, icon: Icon, href }) =>
              href ? (
                <Link
                  key={label}
                  href={href}
                  onClick={onClose}
                  className={`${rowClass} text-ink-2! hover:bg-surface-muted hover:text-ink!`}
                >
                  <Icon size={19} strokeWidth={1.6} className="shrink-0 text-ink-3" />
                  <span className="truncate">{label}</span>
                </Link>
              ) : (
                <div
                  key={label}
                  aria-disabled="true"
                  title="Sắp có"
                  className={`${rowClass} cursor-not-allowed text-ink-4`}
                >
                  <Icon size={19} strokeWidth={1.6} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
              ),
            )}
          </div>
        </div>
      ))}
    </nav>
  </Drawer>
);

export default AppMenuDrawer;
