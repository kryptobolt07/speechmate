import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const loginUrl = new URL('/login', request.url);

  const isApiPath = pathname.startsWith('/api/');

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') 
  ) {
    return NextResponse.next();
  }

  // Allow public auth pages
  if (pathname === '/login' || pathname === '/signup') {
      return NextResponse.next();
  }

  // --- Get token from cookie (use request.cookies in middleware) --- 
  const token = request.cookies.get('token')?.value;

  if (!JWT_SECRET) {
    console.error("JWT_SECRET not defined.");
    if (isApiPath) {
      return new NextResponse(JSON.stringify({ message: 'Internal configuration error' }), { status: 500 });
    } else {
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check for token existence (from cookie)
  if (!token) {
    console.log("Middleware: No token cookie found for path:", pathname);
    if (isApiPath) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    } else {
      return NextResponse.redirect(loginUrl);
    }
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Basic role check (same logic as before)
    const userRole = payload.role;
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
        throw new Error('Insufficient permissions for admin area');
    }
    if (pathname.startsWith('/therapist') && userRole !== 'therapist') {
         throw new Error('Insufficient permissions for therapist area');
    }

    // Inject payload and continue
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-payload', JSON.stringify(payload));
    return NextResponse.next({
      request: { headers: requestHeaders },
    });

  } catch (err) {
    console.error(`JWT Error for path ${pathname}:`, err.message);
    let errorMessage = 'Authentication failed';
    let status = 401;
    if (err.code === 'ERR_JWT_EXPIRED') {
      errorMessage = 'Session expired. Please log in again.';
    }

    // Clear the invalid/expired cookie before redirecting/erroring
    // Need to use the same cookieStore instance if modifying within the same request?
    // Let's try creating a response and modifying its cookies.
    const responseOptions = { status, headers: { 'Content-Type': 'application/json' } };
    if (!isApiPath) {
        // For page redirects, create a response to clear the cookie
        const redirectResponse = NextResponse.redirect(loginUrl);
        // Use cookies() on the response to delete
        redirectResponse.cookies.delete('token'); 
        return redirectResponse;
    } else {
        // For API errors, create the JSON response and clear the cookie on it
        const errorResponse = new NextResponse(JSON.stringify({ message: errorMessage }), responseOptions);
         // Use cookies() on the response to delete
        errorResponse.cookies.delete('token');
        return errorResponse;
    }
  }
}

export const config = {
  matcher: [
    // API Routes requiring authentication
    '/api/patients/me/:path*',
    '/api/therapists/me/:path*',
    '/api/admin/:path*',
    '/api/appointments/book',
    '/api/hospitals/:path*',
    '/api/therapists/available/:path*',
    '/api/llm/:path*',

    // Protected Pages (require user to be logged in)
    '/patient/dashboard/:path*',
    '/therapist/dashboard/:path*',
    '/admin/:path*',
    '/patient/book/:path*',
    '/patient/reviews/add/:path*',
  ],
};