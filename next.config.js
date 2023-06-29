/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['firebasestorage.googleapis.com', 'coinpayments.net'],
        minimumCacheTTL: 1500000,
      },
}

module.exports = nextConfig
