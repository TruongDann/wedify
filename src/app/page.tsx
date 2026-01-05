"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Card, Row, Col } from "antd";
import {
  EditOutlined,
  HeartOutlined,
  StarOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const templates = [
  {
    id: 1,
    name: "Hoa hồng lãng mạn",
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Tối giản hiện đại",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Cổ điển sang trọng",
    image:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=300&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Rustic mộc mạc",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=400&fit=crop",
  },
];

export default function HomePage() {
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
          <Link href="/editor">
            <Button type="primary" icon={<EditOutlined />}>
              Tạo thiệp mới
            </Button>
          </Link>
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
          <Link href="/editor">
            <Button
              type="primary"
              size="large"
              icon={<EditOutlined />}
              className="h-12 px-8 text-lg"
            >
              Bắt đầu thiết kế ngay
            </Button>
          </Link>
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

      {/* Templates Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Mẫu thiệp nổi bật
          </h2>
          <Row gutter={[24, 24]}>
            {templates.map((template) => (
              <Col key={template.id} xs={12} sm={12} md={6}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={template.name}
                      src={template.image}
                      className="h-64 object-cover"
                    />
                  }
                  className="overflow-hidden"
                >
                  <Card.Meta title={template.name} />
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-8">
            <Link href="/editor">
              <Button type="primary" size="large">
                Xem tất cả mẫu
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
          <Link href="/editor">
            <Button
              size="large"
              className="h-12 px-8 text-lg bg-white text-pink-500 border-0 hover:bg-gray-100"
            >
              Tạo thiệp ngay
            </Button>
          </Link>
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
