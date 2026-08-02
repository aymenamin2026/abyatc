import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.abyatc.com",
        port: "",
        pathname: "/storage/**",
      },
    ],
    // WebP keeps cold image transforms much cheaper than AVIF. The backend
    // already stores uploads as WebP, so AVIF adds CPU latency for little gain.
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [360, 390, 430, 640, 750, 828, 1080, 1200, 1536],
    imageSizes: [32, 48, 56, 64, 96, 128, 256, 384],
    qualities: [70, 75, 85],
  },

  async headers() {
    return [
      {
        source: "/:path*.:ext",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
