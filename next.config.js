/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'picsum.photos'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEYNAR_API_KEY: process.env.NEYNAR_API_KEY,
    BASE_RPC_URL: process.env.BASE_RPC_URL,
    KOKI_TOKEN_ADDRESS: process.env.KOKI_TOKEN_ADDRESS,
    LOTTERY_CONTRACT_ADDRESS: process.env.LOTTERY_CONTRACT_ADDRESS,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
