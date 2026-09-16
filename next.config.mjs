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
  // Creator Studio became Control Center. Links already handed out — bookmarks,
  // emails, anything shared — keep working rather than 404ing.
  async redirects() {
    return [
      {
        source: '/creator-studio',
        destination: '/control-center',
        permanent: true,
      },
      {
        source: '/creator-studio/:path*',
        destination: '/control-center/:path*',
        permanent: true,
      },
      {
        source: '/control-centre',
        destination: '/control-center',
        permanent: false,
      },
      {
        source: '/control-centre/:path*',
        destination: '/control-center/:path*',
        permanent: false,
      },
      {
        source: '/community/:path*',
        destination: '/communities/:path*',
        permanent: false,
      },
      {
        source: '/discover',
        destination: '/',
        permanent: false,
      },
      {
        source: '/moments/:momentId',
        destination: '/moments?momentId=:momentId',
        permanent: false,
      },
      {
        source: '/experiences/:experienceId/reserve',
        destination: '/experiences/:experienceId',
        permanent: false,
      },
      {
        source: '/experiences/:experienceId/rate',
        destination: '/experiences/:experienceId',
        permanent: false,
      },
      {
        source: '/places/:placeId/reviews/:reviewId',
        destination: '/places/:placeId',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ];
  },
  images: {
    unoptimized: true,
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
