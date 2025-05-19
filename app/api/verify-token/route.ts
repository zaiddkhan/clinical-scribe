import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { TextEncoder } from 'util';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ authorized: false }, { status: 401 });
    }
    const secret = process.env.NEXT_PUBLIC_JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ authorized: false, error: 'JWT secret is not configured' }, { status: 500 });
    }
    const secretBytes = new TextEncoder().encode(secret);
    
    // Verify the token
    await jwtVerify(token, secretBytes);
    
    return NextResponse.json({ authorized: true });
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json({ authorized: false, error: (error as Error).message }, { status: 401 });
  }
}
