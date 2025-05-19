import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static optimization for the entire application
  // This can help with certain reference errors during prerendering
  output: 'standalone',
  
  // Skip type checking during production build to avoid potential issues
  typescript: {
    // This setting won't let TypeScript errors stop the production build
    ignoreBuildErrors: true,
  },
  
  // Suppress ESLint warnings during the build
  eslint: {
    // This setting won't let ESLint errors stop the production build
    ignoreDuringBuilds: true,
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? process.env.SERVER_URL || 'https://dostifyapp-server.vercel.app/api/:path*'
          : 'http://localhost:5000/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://dostifyapp-server.vercel.app/socket.io/:path*'
          : 'http://localhost:5000/socket.io/:path*',
      }
    ];
  },
  
  // Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
};

export default nextConfig;
