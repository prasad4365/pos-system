import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "pos-system-super-secret-key-change-in-production"
);

// Public routes that don't require authentication
const PUBLIC_PATHS = ["/login", "/api/auth/login"];

// Routes restricted to ADMIN only (cashiers get 403/redirect)
const ADMIN_ONLY_PATHS = [
  "/inventory",
  "/admin",
  "/api/admin",
];

// API routes where cashiers can READ (GET) but not write (POST/PUT/DELETE/PATCH)
const ADMIN_WRITE_ONLY_PATHS = [
  "/api/categories",
  "/api/products",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let user: SessionUser | null = null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    user = payload as unknown as SessionUser;
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
    return res;
  }

  // Cashier cannot access admin-only paths
  if (
    user.role === "CASHIER" &&
    ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Cashier can GET product/category data (needed for POS) but not modify it
  if (
    user.role === "CASHIER" &&
    ADMIN_WRITE_ONLY_PATHS.some((p) => pathname.startsWith(p)) &&
    request.method !== "GET"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
