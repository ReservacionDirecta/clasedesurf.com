import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    // Only admin can access /dashboard/admin
    if (request.nextUrl.pathname.startsWith('/dashboard/admin') && request.nextauth.token?.role !== 'ADMIN') {
      return NextResponse.rewrite(new URL('/denied', request.url));
    }

    // Only school admin can access /dashboard/school
    if (request.nextUrl.pathname.startsWith('/dashboard/school') && request.nextauth.token?.role !== 'SCHOOL_ADMIN') {
      return NextResponse.rewrite(new URL('/denied', request.url));
    }

    // Only authenticated users can access /dashboard/student
    if (request.nextUrl.pathname.startsWith('/dashboard/student') && !request.nextauth.token) {
      return NextResponse.rewrite(new URL('/login', request.url));
    }

    // Redirect to appropriate dashboard if logged in and trying to access login/register
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
      if (request.nextauth.token) {
        const role = request.nextauth.token.role;
        switch (role) {
          case 'ADMIN':
            return NextResponse.redirect(new URL('/dashboard/admin', request.url));
          case 'SCHOOL_ADMIN':
            return NextResponse.redirect(new URL('/dashboard/school', request.url));
          case 'STUDENT':
          default:
            return NextResponse.redirect(new URL('/dashboard/student/profile', request.url));
        }
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
