import { NextRequest, NextResponse } from "next/server";

const AUTH_TOKEN_COOKIE = "cr_auth_token";
const AUTH_ROLE_COOKIE = "cr_auth_role";

const OWNER_ALLOWED_ADMIN_PATHS = [
  "/admin/cars",
  "/admin/bookings",
  "/admin/notifications",
];

function isPathInScope(pathname: string, scopePath: string) {
  return pathname === scopePath || pathname.startsWith(`${scopePath}/`);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;

  const isAdminRoute = isPathInScope(pathname, "/admin");
  const isLoginRoute = isPathInScope(pathname, "/login");
  const isPrivilegedRole = role === "admin" || role === "owner";

  if (isAdminRoute) {
    if (!token || !isPrivilegedRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (role === "owner") {
      if (pathname === "/admin") {
        return NextResponse.redirect(new URL("/admin/cars", request.url));
      }

      const isAllowedOwnerPath = OWNER_ALLOWED_ADMIN_PATHS.some((allowedPath) =>
        isPathInScope(pathname, allowedPath),
      );

      if (!isAllowedOwnerPath) {
        return NextResponse.redirect(new URL("/admin/cars", request.url));
      }
    }
  }

  if (isLoginRoute && token && isPrivilegedRole) {
    const target = role === "owner" ? "/admin/cars" : "/admin";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
