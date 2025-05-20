import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  async rewrites() {
    return [
      {        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? process.env.SERVER_URL || 'https://dostifyapp-production.up.railway.app/api/:path*'
          : 'http://localhost:5000/api/:path*',
      },
      {        source: '/socket.io/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://dostifyapp-production.up.railway.app/socket.io/:path*'
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
