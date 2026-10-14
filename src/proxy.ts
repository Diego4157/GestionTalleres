import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas exclusivas del rol ADMIN.
const ADMIN_ONLY = ["/dashboard/facturas", "/dashboard/usuarios", "/dashboard/reportes"];
// Rutas administrativas vedadas al mecánico (además de las financieras).
const MECHANIC_BLOCKED = ["/dashboard/clientes"];

const matches = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: req.nextUrl.protocol === "https:",
  });

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = token.role as string | undefined;

  if (role !== "ADMIN" && (pathname === "/dashboard" || ADMIN_ONLY.some((r) => matches(pathname, r)))) {
    return NextResponse.redirect(new URL("/dashboard/ordenes", req.url));
  }

  if (
    role === "MECHANIC" &&
    (pathname === "/dashboard" || MECHANIC_BLOCKED.some((r) => matches(pathname, r)))
  ) {
    return NextResponse.redirect(new URL("/dashboard/ordenes", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
