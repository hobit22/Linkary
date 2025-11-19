/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // PWA optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Mobile optimization
  compress: true,
}

module.exports = nextConfig
