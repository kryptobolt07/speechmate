import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Using jose for edge-compatible JWT verification

const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const loginUrl = new URL('/login', request.url); // Construct login URL

  // Simple check if path is for an API route
  const isApiPath = pathname.startsWith('/api/');

  // Allow access to static files and Next.js internals without auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Assume files with extensions are static assets
  ) {
    return NextResponse.next();
  }

  // If accessing login or signup page, allow without token
  if (pathname === '/login' || pathname === '/signup') {
      return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (!JWT_SECRET) {
    console.error("JWT_SECRET not defined.");
    if (isApiPath) {
      return new NextResponse(JSON.stringify({ message: 'Internal configuration error' }), { status: 500 });
    } else {
      // Redirect to login for page requests
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check for token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("Middleware: No or invalid auth header for path:", pathname);
    if (isApiPath) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    } else {
      // Redirect to login for page requests
      return NextResponse.redirect(loginUrl);
    }
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Basic role check (optional - could be more granular)
    // Example: Admins can access anything, therapists only therapist/*, patients only patient/*
    const userRole = payload.role;
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
        throw new Error('Insufficient permissions for admin area');
    }
    if (pathname.startsWith('/therapist') && userRole !== 'therapist') {
         throw new Error('Insufficient permissions for therapist area');
    }
    // Note: /patient routes are accessible by admin/therapist too in this basic check
    // Might need more complex logic if stricter separation is needed


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

    if (isApiPath) {
      // Return JSON error for API routes
      return new NextResponse(JSON.stringify({ message: errorMessage }), { status });
    } else {
      // Redirect to login for page requests
      // Optionally add error message to query param: loginUrl.searchParams.set('error', errorMessage);
      return NextResponse.redirect(loginUrl);
    }
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // API Routes requiring authentication
    '/api/patients/me/:path*',
    '/api/therapists/me/:path*',
    '/api/admin/:path*',

    // Protected Pages (require user to be logged in)
    '/patient/dashboard/:path*', // Protect the patient dashboard and sub-pages
    '/therapist/dashboard/:path*', // Protect the therapist dashboard and sub-pages
    '/admin/dashboard/:path*', // Protect the admin dashboard and sub-pages
    // Add other protected pages like booking, profile settings, etc.
    '/patient/book/:path*',
    '/patient/reviews/add/:path*',
    // '/' // Uncomment if you want to protect the homepage
  ],
}; 