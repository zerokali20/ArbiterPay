/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ESLint is checked in CI / pre-commit, skip during production builds on Render
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Typecheck is checked independently via `npm run typecheck`
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
