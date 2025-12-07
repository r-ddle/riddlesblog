"use client"

import { useEffect, useState } from "react"
import { Music } from "lucide-react"

interface SpotifyTrack {
  name: string
  artist: string
  trackId: string
  isPlaying: boolean
  imageUrl?: string
}

const FALLBACK_TRACK = {
  trackId: "37de7PiZODyk476tuvStLq",
  name: "TELEPATHIC LOVE",
  artist: "Clara La San",
}

export function SpotifyBadge() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null)
  const [showEmbed, setShowEmbed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentTrack()
    // Refresh every 30 seconds to check for new playing track
    const interval = setInterval(fetchCurrentTrack, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchCurrentTrack() {
    try {
      const res = await fetch("/api/spotify/current-track")
      if (res.ok) {
        const data = await res.json()
        if (data.track) {
          setTrack({
            ...data.track,
            isPlaying: data.isPlaying,
          })
        } else {
          setTrack({
            trackId: FALLBACK_TRACK.trackId,
            name: FALLBACK_TRACK.name,
            artist: FALLBACK_TRACK.artist,
            isPlaying: false,
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch Spotify track:", error)
      setTrack({
        trackId: FALLBACK_TRACK.trackId,
        name: FALLBACK_TRACK.name,
        artist: FALLBACK_TRACK.artist,
        isPlaying: false,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="inline-block mb-6">
        <span className="font-mono text-sm bg-primary text-primary-foreground px-4 py-2 border-2 border-foreground shadow-xs rotate-2 inline-block animate-pulse">
          🎶 loading...
        </span>
      </div>
    )
  }

  if (!track) {
    return null
  }

  return (
    <div className="inline-block mb-6 relative">
      <div
        className="font-mono text-sm bg-primary text-primary-foreground px-4 py-2 border-2 border-foreground shadow-xs rotate-2 inline-block cursor-pointer hover:shadow-md transition-all"
        onMouseEnter={() => setShowEmbed(true)}
        onMouseLeave={() => setShowEmbed(false)}
      >
        <span className="inline-flex items-center gap-2">
          <Music className="w-4 h-4" />
          <span className={track.isPlaying ? "animate-pulse" : ""}>
            {track.isPlaying ? "now playing:" : "fav song:"}
          </span>
          <span className="underline decoration-wavy decoration-accent underline-offset-2">{track.name}</span>
        </span>
      </div>

      {/* Spotify Embed - appears on hover */}
      {showEmbed && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50">
          <iframe
            src={`https://open.spotify.com/embed/track/${track.trackId}?utm_source=generator`}
            width="350"
            height="80"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="shadow-lg"
          />
        </div>
      )}
    </div>
  )
}
