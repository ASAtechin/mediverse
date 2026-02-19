/** @type {import('next').NextConfig} */
const nextConfig = {
    output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
    poweredByHeader: false,
};

module.exports = nextConfig;
