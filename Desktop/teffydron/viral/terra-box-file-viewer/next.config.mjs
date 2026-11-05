/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['pg'],
  allowedDevOrigins: ['tefydron.nexo-dev.com'],
}

export default nextConfig
