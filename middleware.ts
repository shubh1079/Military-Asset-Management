import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-must-be-at-least-32-characters-long",
)

async function getUserFromTokenEdge(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth-token")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, and login page
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/login" ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  try {
    // Check authentication for protected routes
    const user = await getUserFromTokenEdge(request)

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Role-based access control
    if (pathname === "/admin" && user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (pathname === "/assignments" && !["admin", "base_commander"].includes(user.role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
