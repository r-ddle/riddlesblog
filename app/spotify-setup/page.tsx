export const dynamic = "force-dynamic"

"use client"

import { useState, useEffect } from "react"

export default function SpotifySetupPage() {
  const [step, setStep] = useState(0)
  const [code, setCode] = useState("")
  const [refreshToken, setRefreshToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [redirectUri, setRedirectUri] = useState("")

  const clientId = "b975bc0b794f481b9e4f16e87d599cc9"

  useEffect(() => {
    // Set redirect URI based on current domain
    const uri = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/spotify-setup`
    setRedirectUri(uri)

    // Extract code from URL on mount
    const params = new URLSearchParams(window.location.search)
    const urlCode = params.get("code")
    if (urlCode) {
      setCode(urlCode)
      setStep(2)
    }
  }, [])

  const handleAuthorize = () => {
    const scope = "user-read-currently-playing user-read-private user-read-email"
    const authUrl = new URL("https://accounts.spotify.com/authorize")
    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("scope", scope)
    window.location.href = authUrl.toString()
  }

  const handleExchangeCode = async () => {
    if (!code) {
      setMessage("Please paste the code from the URL")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/spotify/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirectUri }),
      })

      const data = await res.json()
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token)
        setMessage("✅ Successfully obtained refresh token!")
        setStep(3)
      } else {
        setMessage("❌ Failed to get refresh token: " + (data.error || "Unknown error"))
      }
    } catch (err) {
      setMessage("❌ Error: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  // Extract code from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlCode = params.get("code")
    if (urlCode) {
      setCode(urlCode)
      setStep(2)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Spotify Setup</h1>

        <div className="space-y-6">
          {/* Step 0: Instructions */}
          <div className={`p-6 border-2 rounded-sm ${step >= 0 ? "border-foreground bg-card" : "border-muted bg-muted/30"}`}>
            <h2 className="font-bold mb-4">⚠️ Important: Update Spotify App Settings</h2>
            <p className="text-sm text-muted-foreground mb-4">Before authorizing, go to your Spotify Developer dashboard and add this redirect URI:</p>
            <div className="bg-foreground/5 border-2 border-foreground rounded-sm p-4 font-mono text-xs mb-4 break-all">
              {redirectUri || "Loading..."}
            </div>
            <p className="text-sm text-muted-foreground">Then come back and click authorize.</p>
          </div>

          {/* Step 1 */}
          <div className={`p-6 border-2 rounded-sm ${step >= 1 ? "border-foreground bg-card" : "border-muted bg-muted/30"}`}>
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs">
                1
              </span>
              Authorize with Spotify
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Click the button below to authorize your Spotify account</p>
            <button
              onClick={handleAuthorize}
              className="px-4 py-2 bg-primary text-primary-foreground border-2 border-foreground rounded-sm font-mono"
            >
              👉 Authorize Spotify
            </button>
          </div>

          {/* Step 2 */}
          <div className={`p-6 border-2 rounded-sm ${step >= 2 ? "border-foreground bg-card" : "border-muted bg-muted/30"}`}>
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs">
                2
              </span>
              Exchange Code for Refresh Token
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {code ? "Code found in URL! Click below to exchange it:" : "After authorizing, paste the code here:"}
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste the code here..."
                className="w-full px-3 py-2 border-2 border-foreground bg-background rounded-sm font-mono text-sm"
              />
              <button
                onClick={handleExchangeCode}
                disabled={loading || !code}
                className="px-4 py-2 bg-secondary text-foreground border-2 border-foreground rounded-sm font-mono disabled:opacity-50"
              >
                {loading ? "Loading..." : "Exchange Code"}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`p-6 border-2 rounded-sm ${step >= 3 ? "border-foreground bg-card" : "border-muted bg-muted/30"}`}>
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs">
                3
              </span>
              Copy Refresh Token
            </h2>
            {refreshToken && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Add this to your .env.local:</p>
                <div className="bg-foreground/5 border-2 border-foreground rounded-sm p-4 font-mono text-xs break-all">
                  SPOTIFY_REFRESH_TOKEN={refreshToken}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(refreshToken)}
                  className="px-4 py-2 bg-accent text-accent-foreground border-2 border-foreground rounded-sm font-mono text-sm"
                >
                  📋 Copy Token
                </button>
              </div>
            )}
          </div>

          {message && (
            <div className={`p-4 border-2 rounded-sm ${message.includes("✅") ? "border-green-500 bg-green-500/10" : "border-destructive bg-destructive/10"}`}>
              <p className="font-mono text-sm">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
