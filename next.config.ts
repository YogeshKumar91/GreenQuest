import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Compatibility aliases for existing .env files. Never add database
    // credentials or server-side API secrets to this object.
    NEXT_PUBLIC_WEB3AUTH_CLIENT_ID:
      process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ?? process.env.WEB3AUTH_CLIENT_ID,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY,
  },
};

export default nextConfig;
