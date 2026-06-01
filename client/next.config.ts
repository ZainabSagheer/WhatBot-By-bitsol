import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5001/api/:path*",
      },
      {
        source: "/socket.io/:path*",
        destination: "http://localhost:5001/socket.io/:path*",
      },
    ];
  },
};

export default nextConfig;
