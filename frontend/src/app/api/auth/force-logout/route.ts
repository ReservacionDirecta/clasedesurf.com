import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = await cookies();

    // List of cookies to aggressively clear
    const cookiesToClear = [
        'next-auth.session-token',
        '__Secure-next-auth.session-token',
        'next-auth.csrf-token',
        '__Host-next-auth.csrf-token',
        'next-auth.callback-url',
        '__Secure-next-auth.callback-url'
    ];

    // Create response
    const response = NextResponse.json({ success: true });

    // Explicitly delete each potential cookie
    cookiesToClear.forEach(cookieName => {
        // Delete in the response explicitly (Next.js 13+ helper)
        response.cookies.set({
            name: cookieName,
            value: '',
            expires: new Date(0),
            path: '/',
        });

        // Also try checking if it exists before deleting (server side logic)
        // but the set with expires 0 is the universal "delete" command
    });

    return response;
}
