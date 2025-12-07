import type { NextAuthOptions, Session } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { getServerSession } from "next-auth"

const secret = process.env.NEXTAUTH_SECRET
if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("NEXTAUTH_SECRET must be set in production")
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ profile }) {
      // Allow any authenticated GitHub user
      return !!profile
    },
    async jwt({ token, profile }) {
      if (profile && "login" in profile && profile.login) {
        token.login = String(profile.login).toLowerCase()
      }
      return token
    },
    async session({ session, token }) {
      if (token && "login" in token && token.login) {
        ;(session.user as Session["user"] & { login?: string }).login = String(token.login)
      }
      return session
    },
  },
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function getSession() {
  return getServerSession(authOptions)
}
