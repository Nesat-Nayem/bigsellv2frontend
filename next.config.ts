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
        destination: "http://localhost:8080/v1/api/:path*", // your backend http://localhost:8080/v1/api/:path*
        //prodApi: https://backend-node-vercel-bigsell.vercel.app//:path*
      },
    ];
  },
};

export default nextConfig;
