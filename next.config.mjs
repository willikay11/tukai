/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['tukai-storage.s3.amazonaws.com'],
    unoptimized: true,
  },
};

export default nextConfig;
