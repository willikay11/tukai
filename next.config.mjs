/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'staging-tukai-storage.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'tukai-storage.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-staging.tukai.co',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.ngrok-free.app',
      },
      {
        protocol: 'http',
        hostname: '**.ngrok-free.app',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },
};

export default nextConfig;
