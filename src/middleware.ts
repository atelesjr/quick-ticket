// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCurrentUser } from './lib/current-user'

export function middleware(request: NextRequest) {
  const user = getCurrentUser();
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/tickets');
 
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tickets/:path*'], 
}