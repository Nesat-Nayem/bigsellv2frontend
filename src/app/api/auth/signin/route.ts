import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bigsellv2backend.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Proxy: Received login request:', body);
    console.log('Proxy: Forwarding to:', `${API_BASE_URL}/v1/api/auth/signin`);
    
    const response = await fetch(`${API_BASE_URL}/v1/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Proxy: Backend response:', data);
    console.log('Proxy: Response status:', response.status);

    if (!response.ok) {
      console.log('Proxy: Backend returned error');
      return NextResponse.json(
        { message: data.message || 'Login failed' },
        { status: response.status }
      );
    }

    console.log('Proxy: Forwarding success response');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Auth signin proxy error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
