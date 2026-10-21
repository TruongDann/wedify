import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Tổng quan" },
  { href: "/dashboard/invitations", label: "Thiệp của tôi" },
  { href: "/dashboard/gifts", label: "Quà & lời chúc" },
  { href: "/dashboard/wallet", label: "Ví & rút tiền" },
  { href: "/dashboard/profile", label: "Hồ sơ" },
  { href: "/editor", label: "Tạo thiệp" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">Wedify</div>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">User dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
