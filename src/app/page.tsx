"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Card, Row, Col, Space, Modal } from "antd";
import {
  EditOutlined,
  HeartOutlined,
  StarOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { userAuth } from "@/lib/auth";
import { REQUIRE_PREMIUM, isPremiumProfile } from "@/lib/premium";
import { templateMetas, weddingTemplates } from "@/data/templates";
import GuidedPreview from "@/components/invitation/GuidedPreview";

const KIND_FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "wedding", label: "Thiệp cưới" },
  { key: "engagement", label: "Đính hôn" },
  { key: "birthday", label: "Sinh nhật" },
  { key: "baby", label: "Thôi nôi" },
] as const;

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [kindFilter, setKindFilter] = useState<(typeof KIND_FILTERS)[number]["key"]>("all");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);

  const visibleTemplates = templateMetas.filter((meta) => kindFilter === "all" || meta.kind === kindFilter);
  const previewTemplate = weddingTemplates.find((t) => t.id === previewId) ?? null;

  const useTemplate = (id: string) => {
    if (!userAuth.getAccess()) {
      router.push(`/login?next=${encodeURIComponent(`/create/${id}`)}`);
      return;
    }
    if (REQUIRE_PREMIUM && !isPremium) {
      setUpsellOpen(true);
      return;
    }
    router.push(`/create/${id}`);
  };

  useEffect(() => {
    const syncSession = async () => {
      const profile = await userAuth.hydrateSession();
      setIsLoggedIn(Boolean(userAuth.getAccess()));
      setIsPremium(isPremiumProfile(profile));
    };

    void syncSession();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-web.png"
              alt="Logo"
              width={150}
              height={45}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <Button type="default">Dashboard</Button>
                </Link>
                <Link href="/editor">
                  <Button type="primary" icon={<EditOutlined />}>
                    Tạo thiệp mới
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button>Đăng nhập</Button>
                </Link>
                <Link href="/register">
                  <Button type="primary">Đăng ký</Button>
                </Link>
                <Link href="/editor">
                  <Button type="primary" icon={<EditOutlined />}>
                    Tạo thiệp mới
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1
            className="text-5xl font-bold text-gray-800 mb-6"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Tạo thiệp cưới đẹp trong vài phút
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Công cụ thiết kế thiệp cưới online miễn phí, dễ sử dụng với hàng
            trăm mẫu đẹp
          </p>
          <Space size="middle" wrap>
            <Link href="/editor">
              <Button
                type="primary"
                size="large"
                icon={<EditOutlined />}
                className="h-12 px-8 text-lg"
              >
                {isLoggedIn ? "Tiếp tục thiết kế" : "Bắt đầu thiết kế ngay"}
              </Button>
            </Link>
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="large" className="h-12 px-8 text-lg">
                  Xem bảng điều khiển
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="large" className="h-12 px-8 text-lg">
                  Đăng nhập
                </Button>
              </Link>
            )}
          </Space>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Tính năng nổi bật
          </h2>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center h-full">
                <EditOutlined className="text-4xl text-pink-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Kéo thả dễ dàng</h3>
                <p className="text-gray-600">
                  Thiết kế trực quan với thao tác kéo thả đơn giản
                </p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center h-full">
                <StarOutlined className="text-4xl text-pink-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Mẫu đa dạng</h3>
                <p className="text-gray-600">
                  Hàng trăm mẫu thiệp cưới được thiết kế sẵn
                </p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center h-full">
                <HeartOutlined className="text-4xl text-pink-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Font chữ đẹp</h3>
                <p className="text-gray-600">
                  Bộ sưu tập font chữ cưới lãng mạn
                </p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center h-full">
                <DownloadOutlined className="text-4xl text-pink-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Xuất chất lượng cao
                </h3>
                <p className="text-gray-600">
                  Tải về PNG/JPG chất lượng cao để in ấn
                </p>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">Chọn mẫu thiệp</h2>
          <p className="mb-8 text-center text-gray-500">Chọn mẫu, điền thông tin — thiệp hoàn chỉnh với hiệu ứng đẹp mắt chỉ sau vài phút.</p>

          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {KIND_FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setKindFilter(filter.key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${kindFilter === filter.key ? "border-pink-500 bg-pink-500 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-pink-300"}`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <Row gutter={[24, 24]}>
            {visibleTemplates.map((template) => (
              <Col key={template.id} xs={12} sm={12} md={6}>
                <Card
                  hoverable
                  className="group overflow-hidden border-0 shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  styles={{ body: { padding: 14 } }}
                  cover={
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-white/10 z-10" />
                      <img
                        alt={template.name}
                        src={template.thumbnail}
                        className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <span className="absolute left-3 top-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: template.accent }}>
                        {template.tag}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 z-20 flex gap-2 p-3 opacity-100 md:translate-y-4 md:opacity-0 md:transition md:duration-300 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                        <Button size="small" className="flex-1" onClick={() => setPreviewId(template.id)}>Xem trước</Button>
                        <Button size="small" type="primary" className="flex-1" onClick={() => useTemplate(template.id)}>Dùng mẫu này</Button>
                      </div>
                    </div>
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-800">{template.name}</span>
                    <span className="rounded-full bg-pink-50 px-2 py-1 text-[10px] font-medium text-pink-600 uppercase tracking-wide">Premium</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/editor">
              <Button size="large">Tự thiết kế trong editor</Button>
            </Link>
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="large">Bảng điều khiển</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="large">Đăng nhập</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <Modal open={Boolean(previewTemplate)} onCancel={() => setPreviewId(null)} footer={null} centered width={440} destroyOnHidden title={previewTemplate?.name}>
        <div className="flex flex-col items-center gap-4">
          <GuidedPreview template={previewTemplate} width={360} height={620} />
          <Button type="primary" size="large" onClick={() => previewTemplate && useTemplate(previewTemplate.id)}>Dùng mẫu này</Button>
        </div>
      </Modal>

      <Modal open={upsellOpen} onCancel={() => setUpsellOpen(false)} footer={null} centered title="Tính năng dành cho gói Premium">
        <p className="text-gray-600">Chọn mẫu và điền thông tin để tạo thiệp hoàn chỉnh dành cho tài khoản Premium. Bạn có thể xem trước tất cả mẫu, hoặc tự thiết kế miễn phí trong editor.</p>
        <div className="mt-4 flex gap-3">
          <Link href="/dashboard/profile"><Button type="primary">Xem gói của tôi</Button></Link>
          <Link href="/editor"><Button>Dùng editor</Button></Link>
        </div>
      </Modal>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2
            className="text-4xl font-bold mb-6"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Sẵn sàng tạo thiệp cưới của bạn?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Bắt đầu miễn phí ngay hôm nay và tạo thiệp cưới đẹp như mơ
          </p>
          <Space size="middle" wrap>
            <Link href="/editor">
              <Button
                size="large"
                className="h-12 px-8 text-lg bg-white text-pink-500 border-0 hover:bg-gray-100"
              >
                Tạo thiệp ngay
              </Button>
            </Link>
            <Link href="/login">
              <Button size="large" className="h-12 px-8 text-lg bg-white text-pink-500 border-0 hover:bg-gray-100">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="large" className="h-12 px-8 text-lg bg-white text-pink-500 border-0 hover:bg-gray-100">
                Vào dashboard
              </Button>
            </Link>
          </Space>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HeartOutlined className="text-xl text-pink-400" />
            <span className="text-lg font-semibold">Wedding Card Editor</span>
          </div>
          <p className="text-gray-400">
            © 2025 Wedding Card Editor. Made with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
