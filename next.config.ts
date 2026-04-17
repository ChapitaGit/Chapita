import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.69"],
  // Turbopack is the default in Next.js 16. The PWA plugin injects a webpack
  // config; an empty turbopack key tells Next.js we acknowledge this and want
  // to stay on Turbopack anyway (silences the build-blocking error).
  turbopack: {},
  images: {
    // Next.js 16 requires explicitly listing all quality values used via
    // the `quality` prop on <Image>. 75 is the default; 85 is used on the logo.
    qualities: [75, 85],
  },
};

export default withPWA(nextConfig);
