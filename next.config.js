/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ESLint is checked in CI / pre-commit, skip during production builds on Render
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
