import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const publicRoutes = ['/login', '/register'];
const protectedRoutes = ['/dashboard', '/profile']; // Add more routes as needed

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  let userPayload = null;
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, secret);
      userPayload = payload;
    } catch (err) {
      // Token is invalid or expired
      console.log('JWT verification failed:', err);
    }
  }

  const isAuthenticated = userPayload !== null;

  // If user is authenticated and tries to access a public-only route (like login), redirect to dashboard
  if (isAuthenticated && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and tries to access a protected route, redirect to login
  if (!isAuthenticated && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add user payload to request headers to be accessible in server components
  const requestHeaders = new Headers(request.headers);
  if (userPayload) {
    requestHeaders.set('x-user-payload', JSON.stringify(userPayload));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
