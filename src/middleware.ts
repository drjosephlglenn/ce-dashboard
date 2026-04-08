import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/register",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
