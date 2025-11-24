/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow specific domains for images if needed later
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Environment variable mapping is handled automatically by Next.js for process.env
};

export default nextConfig;
