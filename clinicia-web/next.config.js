/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    poweredByHeader: false,
    // Allow Firebase/Google/Apple auth popups to close themselves after sign-in
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                ],
            },
        ];
    },
    experimental: {
        serverActions: {
            allowedOrigins: process.env.ALLOWED_SERVER_ACTION_ORIGINS
                ? process.env.ALLOWED_SERVER_ACTION_ORIGINS.split(",")
                : ["localhost:3000", "10.0.2.2:3000"]
        },
        // Allow build to succeed even when pages can't be statically generated
        missingSuspenseWithCSRBailout: false,
    },
};

module.exports = nextConfig;
