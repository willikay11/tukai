/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true
    },
    typescript: {
        ignoreBuildErrors: true
    },
    images: {
        domains: ['tukai-storage.s3.amazonaws.com']
    }
};

export default nextConfig;
