import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./app/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logos-api.apistemic.com",
      },
    ],
    qualities: [75, 100],
  },
  async rewrites() {
    return [
      {
        source: "/settings/user-data",
        destination: "/settings-user-data",
      },
      {
        source: "/settings/api-data",
        destination: "/settings-api-data",
      },
      {
        source: "/settings/user-information",
        destination: "/settings-user-information",
      },
      {
        source: "/settings/connections/:itemId",
        destination: "/settings-connections?itemId=:itemId",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
