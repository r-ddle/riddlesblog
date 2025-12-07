"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export function SearchBox() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")

  useEffect(() => {
    setQuery(searchParams.get("q") || "")
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search the chaos..."
          className="w-full px-4 py-3 pl-12 font-mono text-sm bg-card border-2 border-foreground rounded-sm shadow-xs focus:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-primary-foreground font-mono text-sm font-medium border-2 border-foreground rounded-sm shadow-xs hover:shadow-sm hover:-translate-y-[calc(50%+2px)] transition-all"
      >
        go
      </button>
    </form>
  )
}
