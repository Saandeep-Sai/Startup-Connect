
/** @type {import('next').NextConfig} */
const nextConfig = {

  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["https://rfjzb6pr-3000.inc1.devtunnels.ms/", "localhost:3000"],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },    
    ],
  },
};

module.exports = nextConfig;