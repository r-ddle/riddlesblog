"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Github } from "lucide-react"

export function LoginContent() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl)
    }
  }, [status, router, callbackUrl])

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card border-2 border-foreground rounded-sm shadow-sm p-6 space-y-4">
        <div className="space-y-1">
          <p className="font-mono text-sm text-muted-foreground">Access restricted</p>
          <h1 className="text-2xl font-bold">Sign in to continue</h1>
          <p className="text-sm text-muted-foreground">Only the owner account can access the dashboard.</p>
        </div>

        <button
          onClick={() => signIn("github", { callbackUrl })}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background font-mono text-sm border-2 border-foreground rounded-sm hover:-translate-y-0.5 hover:shadow-sm transition-all"
        >
          <Github className="w-4 h-4" />
          Continue with GitHub
        </button>

        <p className="text-xs text-muted-foreground font-mono">
          You will be redirected after signing in with GitHub.
        </p>
      </div>
    </main>
  )
}
