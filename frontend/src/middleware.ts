import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Force the correct host for NextAuth in production
    if (process.env.NODE_ENV === 'production') {
        const requestHeaders = new Headers(request.headers);

        // Override headers to always use the custom domain without port
        // This is crucial for NextAuth to generate correct callback URLs
        requestHeaders.set('x-forwarded-host', 'clasedesurf.com');
        requestHeaders.set('x-forwarded-proto', 'https');
        requestHeaders.set('x-forwarded-port', '443'); // Force HTTPS standard port

        // Handle Cloudflare-specific headers
        requestHeaders.set('cf-visitor', JSON.stringify({ scheme: 'https' }));

        // Delete any Railway-specific headers that might confuse NextAuth
        requestHeaders.delete('x-forwarded-for');

        // If the request is coming from Railway URL, redirect to custom domain
        const host = request.headers.get('host');
        if (host?.includes('railway.app')) {
            const url = request.nextUrl.clone();
            url.host = 'clasedesurf.com';
            url.protocol = 'https:';
            url.port = ''; // Remove port from URL
            return NextResponse.redirect(url);
        }

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
