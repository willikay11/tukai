/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESM-only packages. Listing them here is also what lets next/jest compile
  // them for tests — its own transformIgnorePatterns skips node_modules and
  // takes precedence over anything jest.config sets.
  transpilePackages: ['@stepperize/react', '@stepperize/core'],
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
      },
      {
        protocol: 'https',
        hostname: 'cdn.tukai.co',
      },
    ],
  },
};

export default nextConfig;
