import { NextRequest, NextResponse } from "next/server"

const FALLBACK_TRACK_ID = "37de7PiZODyk476tuvStLq"

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album?: {
    images: Array<{ url: string }>
  }
}

export async function GET(request: NextRequest) {
  try {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!refreshToken || !clientId || !clientSecret) {
      // Return fallback track if credentials not set
      return NextResponse.json({
        track: null,
        isPlaying: false,
      })
    }

    // Get access token
    const authResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })

    if (!authResponse.ok) {
      return NextResponse.json({
        track: null,
        isPlaying: false,
      })
    }

    const { access_token } = await authResponse.json()

    // Get current playing track
    const trackResponse = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!trackResponse.ok || trackResponse.status === 204) {
      // No track playing, return null
      return NextResponse.json({
        track: null,
        isPlaying: false,
      })
    }

    const data = await trackResponse.json()

    if (!data.item || data.item.type !== "track") {
      return NextResponse.json({
        track: null,
        isPlaying: false,
      })
    }

    const track: SpotifyTrack = data.item
    return NextResponse.json({
      track: {
        trackId: track.id,
        name: track.name,
        artist: track.artists[0]?.name || "Unknown Artist",
        imageUrl: track.album?.images[0]?.url,
      },
      isPlaying: data.is_playing,
    })
  } catch (error) {
    console.error("Spotify API error:", error)
    return NextResponse.json({
      track: null,
      isPlaying: false,
    })
  }
}
