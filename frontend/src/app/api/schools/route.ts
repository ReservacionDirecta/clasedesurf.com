import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request) {
  try {
    console.log('Schools proxy GET called');
    console.log('BACKEND URL:', BACKEND);
    
    const backendUrl = `${BACKEND}/schools`;
    console.log('Fetching from:', backendUrl);
    
    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Backend response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`Backend responded with ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Backend data received:', data.length, 'schools');
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Schools proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Proxy error', error: errorMessage }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    console.log('Schools POST proxy called');
    console.log('Auth header present:', !!authHeader);
    
    const headers: any = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Check if it's FormData (for file upload) or JSON
    const contentType = req.headers.get('content-type');
    let body;
    let requestBody;

    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData (with file upload)
      const formData = await req.formData();
      
      // Convert FormData to JSON for now (we'll handle file upload later)
      const jsonData: any = {};
      formData.forEach((value, key) => {
        if (key !== 'logo') { // Skip file for now
          jsonData[key] = value;
        }
      });
      
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(jsonData);
      console.log('FormData converted to JSON:', jsonData);
    } else {
      // Handle regular JSON
      body = await req.json();
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
      console.log('Request body:', body);
    }
    
    const response = await fetch(`${BACKEND}/schools`, {
      method: 'POST',
      headers,
      body: requestBody
    });

    console.log('Backend POST response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch {
        return NextResponse.json(
          { message: errorText || 'Backend error' }, 
          { status: response.status }
        );
      }
    }
    
    const data = await response.json();
    
    // Return the same status code from backend
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Error creating school:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Internal server error', error: errorMessage }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const body = await req.json();
    
    const response = await fetch(`${BACKEND}/schools`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${BACKEND}/schools`, {
      method: 'DELETE',
      headers
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}