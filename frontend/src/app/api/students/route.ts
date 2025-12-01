import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');

    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Extract search params safely without using new URL() during prerender
    let searchParams = '';
    try {
      if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
        const url = new URL(req.url);
        searchParams = url.search;
      } else {
        const questionMarkIndex = req.url.indexOf('?');
        if (questionMarkIndex !== -1) {
          searchParams = req.url.substring(questionMarkIndex);
        }
      }
    } catch (e) {
      const questionMarkIndex = req.url.indexOf('?');
      if (questionMarkIndex !== -1) {
        searchParams = req.url.substring(questionMarkIndex);
      }
    }
    const backendUrl = `${BACKEND}/students${searchParams}`;

    const response = await fetch(backendUrl, {
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
    console.error('Students proxy error:', error);
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

    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const body = await req.json();

    // Si es admin, obtener su escuela y agregar schoolId para la creación estándar
    // Para la ruta create-with-user el backend ya determina la escuela del admin
    if (!body?.userData && authHeader) {
      try {
        const schoolResponse = await fetch(`${BACKEND}/schools/my-school`, {
          method: 'GET',
          headers
        });

        if (schoolResponse.ok) {
          const school = await schoolResponse.json();
          body.schoolId = school.id;
        }
      } catch (error) {
        console.error('Error getting school for student:', error);
      }
    }

    // Seleccionar endpoint según el contenido del body
    const endpoint = body?.userData
      ? `${BACKEND}/students/create-with-user`
      : `${BACKEND}/students`;

    const response = await fetch(endpoint, {
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
    console.error('Error creating student:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
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

    const response = await fetch(`${BACKEND}/students`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error updating student:', error);
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

    const response = await fetch(`${BACKEND}/students`, {
      method: 'DELETE',
      headers
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
