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

const rowClass = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors";

/** Menu điều hướng mở từ nút ☰ ở header editor. */
export const AppMenuDrawer: React.FC<AppMenuDrawerProps> = ({ open, onClose }) => (
  <Drawer
    open={open}
    onClose={onClose}
    placement="left"
    size={280}
    closable={false}
    styles={{
      body: { padding: 0 },
      mask: { backdropFilter: "blur(4px)" },
    }}
  >
    <nav aria-label="Điều hướng" className="flex h-full flex-col overflow-y-auto px-4 pt-6 pb-4">
      <Link href="/" onClick={onClose} className="mb-4 flex items-center px-3">
        <Image
          src="/assets/images/brand/logo-web.png"
          alt="Wedify"
          width={106}
          height={28}
          style={{ objectFit: "contain" }}
        />
      </Link>

      {SECTIONS.map((section) => (
        <div key={section.title} className="mt-3">
          <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-ink-3">
            {section.title}
          </div>
          {section.items.map(({ label, icon: Icon, href }) =>
            href ? (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`${rowClass} text-ink! hover:bg-surface-muted`}
              >
                <Icon size={18} strokeWidth={1.6} className="text-ink-2" />
                {label}
              </Link>
            ) : (
              <div
                key={label}
                aria-disabled="true"
                className={`${rowClass} cursor-not-allowed text-ink-4`}
              >
                <Icon size={18} strokeWidth={1.6} />
                <span className="flex-1">{label}</span>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-3">
                  Sắp có
                </span>
              </div>
            ),
          )}
        </div>
      ))}
    </nav>
  </Drawer>
);

export default AppMenuDrawer;
