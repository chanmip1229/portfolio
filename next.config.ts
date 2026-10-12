import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/product/search.html',
        destination: '/search',
      },
    ];
  },
};

export default nextConfig;
