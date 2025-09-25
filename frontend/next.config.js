/** @type {import('next').NextConfig} */
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const nextConfig = {
	async rewrites() {
		return [
			// Keep NextAuth routes handled locally by Next.js
			{ source: '/api/auth/:path*', destination: '/api/auth/:path*' },
			// Proxy other /api requests to the backend
			{ source: '/api/:path*', destination: `${BACKEND}/:path*` },
		];
	},
};

module.exports = nextConfig;