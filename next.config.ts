import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.statically.io",
      },
      {
        protocol: 'https',
        hostname: 'equal-brown-cougar.myfilebase.com',
        pathname: '/ipfs/**',
      },
    ],
  },
};

export default nextConfig;
