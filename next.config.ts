import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // allow Cloudinary images
      },
      {
        protocol: "http",
        hostname: "*", // allow Cloudinary images
      },
      {
        protocol: "https",
        hostname: "*", // allow Cloudinary images
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*", // proxy path
        destination: "https://api.bigsell.org/v1/api/:path*", // your backend https://api.bigsell.org/v1/api/:path*
        //prodApi: https://api.bigsell.org/:path*
      },
    ];
  },
};

export default nextConfig;
