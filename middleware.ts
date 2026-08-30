import { NextResponse, type NextRequest } from "next/server";

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ["/login", "/signup", "/onboarding"];

// Routes that require the admin role
const ADMIN_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API routes
  if (
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next();
  }

  // Read the session cookie Firebase Auth sets (via custom token approach)
  const session = request.cookies.get("sf_session")?.value;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection handled in the admin layout
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)",
  ],
};
