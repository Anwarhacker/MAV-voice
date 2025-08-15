import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "a-very-secure-secret-that-is-long-enough"
);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const loginUrl = new URL("/admin/login", request.url);

  // Allow the public homepage to fetch videos without authentication
  if (
    request.nextUrl.pathname === "/api/videos" &&
    request.method === "GET"
  ) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the JWT
    await jwtVerify(session, secret);
    // If verification is successful, let the request proceed
    return NextResponse.next();
  } catch (err) {
    // If verification fails, redirect to the login page
    console.error("JWT Verification Error:", err);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (the auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * We want to protect:
     * - /admin and all its sub-pages
     * - /api/videos (for POST)
     * - /api/videos/:id (for PUT and DELETE)
     */
    "/admin/:path*",
    "/api/videos/:path*",
    "/api/videos",
  ],
};
