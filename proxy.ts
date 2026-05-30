import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const auth = request.cookies.get('auth')?.value;
  const role = request.cookies.get('role')?.value;
  
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname.startsWith('/login');

  if (!auth && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (auth && isLoginPage) {
    if (role === 'sales') {
      return NextResponse.redirect(new URL('/invoices', request.url));
    }
    if (role === 'finance') {
      return NextResponse.redirect(new URL('/payroll', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Role-based route protection
  if (auth === 'true' && !isLoginPage) {
    // Sales role: We let them access all paths in middleware so the client-side RoleGate
    // can display the "Access Locked" UI (letting them "see" the page but locked).
    
    // Finance role restrictions (keep intact)
    if (role === 'finance') {
      const allowedPaths = ['/payroll', '/clients', '/reports', '/ai-chat', '/settings'];
      const isAllowed = allowedPaths.some(p => pathname.startsWith(p)) || pathname === '/';
      if (!isAllowed) {
        return NextResponse.redirect(new URL('/payroll', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
};
