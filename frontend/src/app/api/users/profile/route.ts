import { NextResponse } from 'next/server';

// Proxy the frontend profile API to the backend so the frontend doesn't access Prisma directly.
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function proxy(req: Request) {
  // Build backend URL by stripping the /api prefix
  const url = new URL(req.url);
  const path = url.pathname.replace('/api', ''); // /api/users/profile -> /users/profile
  const backendUrl = `${BACKEND}${path}`;

  try {
    // For PUT requests, log the body for debugging
    let body: ArrayBuffer | undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await req.arrayBuffer();
      
      // Try to parse and log the body (for debugging)
      if (body && body.byteLength > 0) {
        try {
          const text = new TextDecoder().decode(body);
          const parsed = JSON.parse(text);
          const logData = { ...parsed };
          if (logData.profilePhoto && typeof logData.profilePhoto === 'string') {
            logData.profilePhoto = `[base64 string, ${logData.profilePhoto.length} chars]`;
          }
          console.log(`[API Proxy] ${req.method} ${path} - Body:`, JSON.stringify(logData, null, 2));
        } catch (e) {
          console.log(`[API Proxy] ${req.method} ${path} - Body size:`, body.byteLength, 'bytes');
        }
      }
    }

    console.log(`[API Proxy] Proxying ${req.method} ${path} to ${backendUrl}`);
    
    const res = await fetch(backendUrl, {
      method: req.method,
      headers: Object.fromEntries(req.headers),
      body: body,
    });

    // Return backend response (preserve status and headers)
    const text = await res.text();
    
    // Log response for debugging
    if (!res.ok) {
      console.error(`[API Proxy] ${req.method} ${path} - Error ${res.status}:`, text.substring(0, 500));
    } else {
      try {
        const parsed = JSON.parse(text);
        const logData = { ...parsed };
        if (logData.profilePhoto && typeof logData.profilePhoto === 'string') {
          logData.profilePhoto = `[base64 string, ${logData.profilePhoto.length} chars]`;
        }
        console.log(`[API Proxy] ${req.method} ${path} - Success:`, JSON.stringify(logData, null, 2));
      } catch (e) {
        console.log(`[API Proxy] ${req.method} ${path} - Success, response length:`, text.length);
      }
    }
    
    return new NextResponse(text, { status: res.status, headers: Object.fromEntries(res.headers) });
  } catch (error) {
    console.error(`[API Proxy] ${req.method} ${path} - Proxy error:`, error);
    return new NextResponse(JSON.stringify({ message: 'Proxy error', error: String(error) }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(req: Request) {
  return proxy(req);
}

export async function PUT(req: Request) {
  return proxy(req);
}
