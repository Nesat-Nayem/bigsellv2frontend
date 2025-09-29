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
        //prodApi: http://localhost:8080/:path*
      },
    ];
  },
};

export default nextConfig;
