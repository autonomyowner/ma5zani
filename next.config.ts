import type { NextConfig } from 'next'

if (process.env.NODE_ENV === 'development') {
  import("@opennextjs/cloudflare").then(m => m.initOpenNextCloudflareForDev())
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-6f95df2287c74e40a3e0d525950d723c.r2.dev',
      },
    ],
  },
}

export default nextConfig
