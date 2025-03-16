import type { NextConfig } from "next";

const remotePatterns = [
  process.env.NEXT_PUBLIC_AWS_STORAGE
    ? {
        protocol: "https" as const,
        hostname: process.env.NEXT_PUBLIC_AWS_STORAGE.split("https://")[1],
      }
    : null,
].filter((pattern) => pattern !== null);

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [...remotePatterns],
  },
  /* config options here */
};

export default nextConfig;
