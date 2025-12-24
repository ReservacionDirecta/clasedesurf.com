import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const { searchParams } = new URL(req.url);
        const queryString = searchParams.toString();
        const url = `${BACKEND}/classes/${params.id}/calendar${queryString ? `?${queryString}` : ''}`;

        console.log('[API Proxy] GET Calendar', url);

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
        console.error('Calendar proxy error:', error);
        return NextResponse.json(
            { message: 'Proxy error', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
