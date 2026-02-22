import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── Route Classification ────────────────────────────────────────────

// GUEST-ONLY pages: visible ONLY when NOT logged in.
// If user has a valid session → redirect to /dashboard.
// Includes auth pages AND registration/onboarding flow.
const GUEST_ONLY_PATHS = [
    '/login',
    '/signup',
    '/register',       // Landing + signup wizard + checkout + success
    '/pricing',
];

// Truly public pages: accessible regardless of auth state.
// Legal pages, patient-facing portals, etc.
const PUBLIC_PATHS = [
    '/terms',
    '/privacy',
    '/refund',
    '/cookies',
    '/p/',             // Public patient booking pages
    '/portal',         // Patient portal (has its own auth)
];

// Everything else is PROTECTED → redirect to /login if no session

function isGuestOnlyPath(pathname: string): boolean {
    return GUEST_ONLY_PATHS.some(p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p));
}

function isPublicPath(pathname: string): boolean {
    // Root '/' is always public (landing page for guests, client-side redirect for auth users)
    if (pathname === '/') return true;
    return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p));
}

/**
 * Quick check if a JWT is expired without verifying signature.
 * Returns true if token is valid (not expired), false otherwise.
 */
function isSessionTokenFresh(token: string): boolean {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        const now = Math.floor(Date.now() / 1000);
        // Token must have exp claim and not be expired (allow 30s skew)
        return payload.exp && payload.exp > (now - 30);
    } catch {
        return false;
    }
}

// ─── Security Headers ────────────────────────────────────────────────
function setSecurityHeaders(response: NextResponse) {
    const isDev = process.env.NODE_ENV === 'development';

    // Allow Firebase/Google/Apple auth popups to close themselves after sign-in
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
    )
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(self), geolocation=(), payment=(self)'
    )

    const scriptSrc = isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://www.gstatic.com https://*.firebaseapp.com https://checkout.razorpay.com https://js.stripe.com;"
        : "script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://www.gstatic.com https://*.firebaseapp.com https://checkout.razorpay.com https://js.stripe.com;";

    response.headers.set(
        'Content-Security-Policy',
        `default-src 'self'; ${scriptSrc} style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.firebaseapp.com https://*.googleapis.com https://api.razorpay.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://s-usc1c-nss-2616.firebaseio.com; frame-src https://*.firebaseapp.com https://accounts.google.com https://www.google.com https://appleid.apple.com https://checkout.razorpay.com https://api.razorpay.com; base-uri 'self'; form-action 'self' https://*.firebaseapp.com https://accounts.google.com https://appleid.apple.com; frame-ancestors 'none';`
    )
}

// ─── Middleware ───────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionToken = request.cookies.get('__session')?.value;
    const hasValidSession = sessionToken ? isSessionTokenFresh(sessionToken) : false;

    // ── 1. Guest-only pages (login, signup, register/*, pricing):
    //        Redirect TO dashboard if already logged in.
    if (isGuestOnlyPath(pathname) && hasValidSession) {
        const dashboardUrl = new URL('/dashboard', request.url);
        const response = NextResponse.redirect(dashboardUrl);
        setSecurityHeaders(response);
        return response;
    }

    // ── 2. Guest-only pages WITHOUT a session: allow through (they need to register/login)
    if (isGuestOnlyPath(pathname) && !hasValidSession) {
        const response = NextResponse.next();
        setSecurityHeaders(response);
        return response;
    }

    // ── 3. Truly public pages (legal, patient portal): always allow through
    if (isPublicPath(pathname)) {
        const response = NextResponse.next();
        setSecurityHeaders(response);
        return response;
    }

    // ── 4. Protected pages (dashboard, patients, etc.): redirect TO login if not logged in
    if (!hasValidSession) {
        const loginUrl = new URL('/login', request.url);
        // Preserve the intended destination so we can redirect back after login
        loginUrl.searchParams.set('redirect', pathname);
        const response = NextResponse.redirect(loginUrl);
        // Clear stale session cookie if it existed but was expired
        if (sessionToken) {
            response.cookies.delete('__session');
        }
        setSecurityHeaders(response);
        return response;
    }

    // ── 5. Authenticated user on protected page: allow through
    const response = NextResponse.next();
    setSecurityHeaders(response);
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes — have their own auth)
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico, images, fonts
         */
        '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)',
    ],
}
