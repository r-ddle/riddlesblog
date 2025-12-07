import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Allow any authenticated user to access dashboard
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return Boolean(token)
      },
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
