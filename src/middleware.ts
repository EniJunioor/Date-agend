import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authRatelimit } from "@/lib/utils/ratelimit";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/reset-password",
  "/forgot-password",
];

// Auth routes where rate limiting applies
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // Apply rate limiting to auth routes (desativado se Upstash não estiver configurado)
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (!authRatelimit) {
      return NextResponse.next();
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ??
      req.headers.get("x-real-ip") ??
      "anonymous";

    let rateLimitResult:
      | { success: boolean; limit: number; remaining: number; reset: number }
      | null = null;

    try {
      rateLimitResult = await authRatelimit.limit(`auth:${ip}`);
    } catch (error) {
      // Fail-open: if Redis/Upstash is unavailable, don't block authentication flow.
      console.error("Auth rate limit unavailable in middleware:", error);
    }

    if (!rateLimitResult) {
      return NextResponse.next();
    }

    const { success, limit, remaining, reset } = rateLimitResult;

    if (!success) {
      return NextResponse.json(
        {
          error: "Muitas tentativas. Tente novamente em alguns minutos.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }
  }

  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/invite/")
  );

  const isLoggedIn = !!req.auth;

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|api/auth).*)",
  ],
};
