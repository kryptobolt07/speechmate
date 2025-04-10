import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Using jose for edge-compatible JWT verification

const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const authHeader = request.headers.get('authorization');
  
  // Check if the JWT_SECRET is configured
  if (!JWT_SECRET) {
    console.error("JWT_SECRET not defined in environment variables.");
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Internal server configuration error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  // Check if we have an Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using jose (edge compatible)
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Add the verified payload to the request headers
    // API routes can access this via request.headers.get('x-user-payload')
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-payload', JSON.stringify(payload));

    // Continue to the API route
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    let errorMessage = 'Invalid token';
    let status = 401;
    if (err.code === 'ERR_JWT_EXPIRED') {
        errorMessage = 'Token expired';
    }
    // Add more specific error handling if needed
    
    return new NextResponse(
      JSON.stringify({ success: false, message: errorMessage }),
      { status: status, headers: { 'content-type': 'application/json' } }
    );
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/api/patients/me/:path*', 
    '/api/therapists/me/:path*', // Add other protected therapist routes if needed
    '/api/admin/:path*', // Protect all admin routes
    // Add any other paths that require authentication
  ],
}; 