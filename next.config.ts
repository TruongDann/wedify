import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    const imageDirectories = [
      "blocks",
      "crop-shapes",
      "decor",
      "effects",
      "graphics",
      "stock",
      "widgets",
    ];

    return [
      ...imageDirectories.flatMap((directory) => [
        {
          source: `/${directory}/:path*`,
          destination: `/assets/images/${directory}/:path*`,
        },
        {
          source: `/assets/${directory}/:path*`,
          destination: `/assets/images/${directory}/:path*`,
        },
      ]),
      {
        source: "/fonts/:path*",
        destination: "/assets/fonts/:path*",
      },
      {
        source: "/logo-web.png",
        destination: "/assets/images/brand/logo-web.png",
      },
      {
        source: "/avatar.jpg",
        destination: "/assets/images/brand/avatar.jpg",
      },
      {
        source: "/logo.png",
        destination: "/assets/images/brand/logo.png",
      },
      ...["file", "globe", "next", "vercel", "window"].map((name) => ({
        source: `/${name}.svg`,
        destination: `/assets/images/misc/${name}.svg`,
      })),
    ];
  },
};

export default nextConfig;
