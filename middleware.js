import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware for route protection
 * Protects dashboard routes and enforces role-based access
 */
export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Protect all /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Not authenticated
    if (!token) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Role-based access control
    const role = token.role;
    
    // Farmer routes
    if (pathname.startsWith('/dashboard/farmer') && role !== 'farmer') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Buyer routes
    if (pathname.startsWith('/dashboard/buyer') && role !== 'buyer') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Coop admin routes
    if (pathname.startsWith('/dashboard/coop') && role !== 'coopAdmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Investor routes
    if (pathname.startsWith('/dashboard/investor') && role !== 'investor') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Admin routes
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
