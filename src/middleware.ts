import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/jwt';

// Edge middleware: verifies the JWT signature statelessly (jose is edge-safe).
// Server-side revocation (checking the AuthSession row) happens in API routes.
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionToken(token) : null;

  if (!claims) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding'],
};
