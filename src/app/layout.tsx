import type { Metadata } from "next";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { appTheme } from "@/constants/theme";

export const metadata: Metadata = {
  title: "Wedding Card Editor - Tạo thiệp cưới online",
  description: "Tạo thiệp cưới đẹp và chuyên nghiệp trực tuyến miễn phí",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <AntdRegistry>
          <ConfigProvider theme={appTheme}>{children}</ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
