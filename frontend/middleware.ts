import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    // Only admin can access /dashboard/admin
    if (request.nextUrl.pathname.startsWith('/dashboard/admin') && request.nextauth.token?.role !== 'ADMIN') {
      return NextResponse.rewrite(new URL('/denied', request.url));
    }

    // Only authenticated users can access /dashboard/student
    if (request.nextUrl.pathname.startsWith('/dashboard/student') && !request.nextauth.token) {
      return NextResponse.rewrite(new URL('/login', request.url));
    }

    // Redirect to dashboard if logged in and trying to access login/register
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
      if (request.nextauth.token) {
        return NextResponse.redirect(new URL('/dashboard/student/profile', request.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*', '/login', '/register'],
};
