/** @type {import('next').NextConfig} */
const nextConfig = {
    output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
    poweredByHeader: false,
    experimental: {
        serverActions: {
            allowedOrigins: process.env.ALLOWED_SERVER_ACTION_ORIGINS
                ? process.env.ALLOWED_SERVER_ACTION_ORIGINS.split(",")
                : ["localhost:3000", "10.0.2.2:3000"]
        }
    }
};

module.exports = nextConfig;
