import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ugzbiujqfdwkougvxnsd.supabase.co",
            },
        ],
    },
};

export default nextConfig;
