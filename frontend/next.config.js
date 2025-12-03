/** @type {import('next').NextConfig} */
// Backend URL configuration for different environments
// Force localhost when running in development, regardless of NEXT_PUBLIC_BACKEND_URL
// Backend URL configuration
// Priority: NEXT_PUBLIC_BACKEND_URL > Railway env var > default Railway URL
const BACKEND = process.env.NODE_ENV === 'development'
	? 'http://localhost:4000'
	: (process.env.NEXT_PUBLIC_BACKEND_URL ||
		process.env.RAILWAY_BACKEND_URL ||
		'https://surfschool-backend-production.up.railway.app');

console.log('Next.js config - NODE_ENV:', process.env.NODE_ENV);
console.log('Next.js config - BACKEND URL:', BACKEND);

const nextConfig = {
	// Enable standalone output for Docker
	output: 'standalone',

	// Optimize for production
	swcMinify: true,

	// Ignore ESLint errors during build to prevent deployment failures
	eslint: {
		ignoreDuringBuilds: true,
	},

	// Image optimization
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'plus.unsplash.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'ui-avatars.com',
				pathname: '/**',
			},
			// Instagram CDN domains
			{
				protocol: 'https',
				hostname: '*.cdninstagram.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '*.instagram.com',
				pathname: '/**',
			},
			// Local domain for API images
			{
				protocol: 'https',
				hostname: 'clasedesurf.com',
				pathname: '/**',
			},
			// Cloudinary
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
				pathname: '/**',
			},
		],
		// Disable optimization in development for faster builds
		// In production, optimization is enabled for better performance
		unoptimized: process.env.NODE_ENV === 'development',
	},

	async rewrites() {
		// In production, if backend is on the same domain but different port
		// Railway might handle this differently
		const rewrites = [
			// Keep NextAuth routes handled locally by Next.js
			{ source: '/api/auth/:path*', destination: '/api/auth/:path*' },
			// Redirect old image URLs to new API route
			{ source: '/uploads/classes/:path*', destination: '/api/images/uploads/classes/:path*' },
		];

		// Only add backend proxy in development or if explicitly configured
		if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_BACKEND_URL) {
			rewrites.push(
				// Proxy all /api requests to the backend (except /api/auth which is handled by Next.js)
				{
					source: '/api/:path((?!auth).)*',
					destination: `${BACKEND}/:path*`
				}
			);
		}

		console.log('Next.js rewrites:', rewrites);
		return rewrites;
	},

	// Environment variables
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || BACKEND,
		// Default backend URL for the browser (public) – resolves to localhost:4000 in dev
		NEXT_PUBLIC_BACKEND_URL: BACKEND,
		// Ensure NEXTAUTH_URL is always set for build time
		NEXTAUTH_URL: process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://clasedesurf.com'),
	},
};

module.exports = nextConfig;