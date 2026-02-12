import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */
  
  images: {
    qualities: [25, 50, 75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', // Use 'http' if the source uses HTTP
        hostname: 'ffibjxjbjsekelomsyqh.supabase.co', // Your hostname
        port: '', // Leave empty for standard ports (80 for HTTP, 443 for HTTPS)
        pathname: '/storage/v1/object/public/**', // Optional: Restrict to specific paths
      },
      {
        protocol: 'https',
        hostname: 'bootdey.com',
      },
      {
        protocol: 'https',
        hostname: 'images.raidboxes.io',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'outvio.com',
      },
      {
        protocol: 'https',
        hostname: 'multilingualpress.org',
      },
      {
        protocol: 'https',
        hostname: 'avada.io',
      },
      {
        protocol: 'https',
        hostname: 'static1.pocketnowimages.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'pagedone.io',
      },
      {
        protocol: 'https',
        hostname: 'egeniestores.com',
      },
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'egenie-whatsapp.koyeb.app',
      },
      {
        protocol: 'https',
        hostname: 'lookaside.fbsbx.com'
      },
      {
        protocol: 'https',
        hostname: 'cdninstagram.com'
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com'
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      },
      {
        protocol: 'https',
        hostname: 'pps.whatsapp.net'
      },
    ],
  }
  
};

export default nextConfig;
