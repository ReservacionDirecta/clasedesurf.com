import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const queryString = searchParams.toString();
        const url = `${BACKEND}/classes${queryString ? `?${queryString}` : ''}`;

        console.log('[API Proxy] GET', url);

        const authHeader = req.headers.get('authorization');
        const headers: any = {
            'Content-Type': 'application/json'
        };
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Backend error' }));
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Classes proxy error:', error);
        return NextResponse.json(
            { message: 'Proxy error', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const headers: any = {
            'Content-Type': 'application/json'
        };
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const body = await req.json();

        const response = await fetch(`${BACKEND}/classes`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Backend error' }));
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('Error creating class:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
