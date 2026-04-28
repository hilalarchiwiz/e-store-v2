import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: '20000mb'
    }
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'staticportal.blob.core.windows.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**'
      },
      {
        protocol: 'https',
        hostname: 'www.mega.pk',
        pathname: '/**',
      },
      // FIX: Add the domain without 'www'
      {
        protocol: 'https',
        hostname: 'wise-tech.com.pk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.wise-tech.com.pk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;