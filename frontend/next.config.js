/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,  // avoid double-renders in dev
  output: 'standalone',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      'date-fns',
    ],
  },
};

module.exports = nextConfig;
