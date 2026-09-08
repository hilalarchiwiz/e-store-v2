import type { NextConfig } from "next";
import { execFileSync } from "node:child_process";

function getDeploymentId(): string | undefined {
  const configured = process.env.NEXT_DEPLOYMENT_ID || process.env.BUILD_BUILDID || process.env.GITHUB_RUN_ID;
  if (configured) return configured;
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return undefined;
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: false,
  deploymentId: getDeploymentId(),
  experimental: {
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: '10mb'
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
        hostname: 'fonts.googleapis.com',
        pathname: '/**',
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
        hostname: 'lh3.googleusercontent.com',
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
