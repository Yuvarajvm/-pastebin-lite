import { auth } from "@/lib/neon-auth/server";
import { NextRequest, NextResponse } from "next/server";

const authMiddleware = auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

export async function proxy(request: NextRequest) {
  const response = await authMiddleware(request);

  // If authMiddleware issued a redirect to loginUrl, but this route is public,
  // permit the request without forcing login.
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location") || "";
    const isLoginRedirect = location.includes("/auth/sign-in");

    const pathname = request.nextUrl.pathname;
    const isProtectedRoute =
      pathname.startsWith("/my-pastes") ||
      pathname.startsWith("/account") ||
      pathname.startsWith("/profile");

    if (isLoginRedirect && !isProtectedRoute) {
      return NextResponse.next();
    }
  }

  return response;
}

export default proxy;
