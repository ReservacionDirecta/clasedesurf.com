/** @type {import('next').NextConfig} */
// In production on Railway, both frontend and backend run on the same domain
// Backend runs on port 4000, frontend on port 3000, but Railway handles the routing
const BACKEND = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
  : process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

console.log('Next.js config - NODE_ENV:', process.env.NODE_ENV);
console.log('Next.js config - BACKEND URL:', BACKEND);

const nextConfig = {
	// Enable standalone output for Docker
	output: 'standalone',
	
	// Optimize for production
	swcMinify: true,
	
	// Image optimization
	images: {
		domains: ['localhost'],
		unoptimized: process.env.NODE_ENV === 'development',
	},
	
	async rewrites() {
		// In production, if backend is on the same domain but different port
		// Railway might handle this differently
		const rewrites = [
			// Keep NextAuth routes handled locally by Next.js
			{ source: '/api/auth/:path*', destination: '/api/auth/:path*' },
		];
		
		// Only add backend proxy in development or if explicitly configured
		if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_BACKEND_URL) {
			rewrites.push(
				// Proxy other /api requests to the backend
				{ source: '/api/:path*', destination: `${BACKEND}/:path*` }
			);
		}
		
		console.log('Next.js rewrites:', rewrites);
		return rewrites;
	},
	
	// Environment variables
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
};

module.exports = nextConfig;